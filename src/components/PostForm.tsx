import { useState, useRef, useCallback } from 'react';
import { X, Plus, Loader2, UploadCloud, Check } from 'lucide-react';
import { supabase, type Memory } from '../lib/supabase';
import { uploadImage, isCloudinaryConfigured } from '../lib/cloudinary';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (m: Memory) => void;
};

export function PostForm({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle('');
    setStory('');
    setAuthorName('');
    setImageUrl('');
    setError(null);
    setDragging(false);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image is too large (max 15 MB).');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          title: title.trim(),
          story: story.trim(),
          author_name: authorName.trim(),
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      onCreated(data as Memory);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post memory');
    } finally {
      setBusy(false);
    }
  };

  // IMPORTANT: after hooks only
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={20} />
        </button>

        <form onSubmit={submit}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border p-6"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="preview" />
            ) : uploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UploadCloud />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <input
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Name"
          />

          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <textarea
            required
            value={story}
            onChange={(e) => setStory(e.target.value)}
          />

          {error && <p>{error}</p>}

          <button disabled={busy || uploading}>
            {busy ? 'Posting...' : 'Post memory'}
          </button>
        </form>
      </div>
    </div>
  );
}
