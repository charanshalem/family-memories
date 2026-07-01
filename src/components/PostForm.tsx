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

  // ❌ Don't render modal if closed
  if (!open) return null;

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
          image_url: imageUrl.trim() || null,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-stone-200">

        {/* close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* header */}
        <div className="mb-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
            <Plus className="text-amber-600" size={22} />
          </div>
          <h2 className="font-serif text-2xl text-stone-800">Share a Memory</h2>
          <p className="mt-1 text-sm text-stone-500">
            Add a moment you'd love the family to remember.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* IMAGE UPLOAD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Photo <span className="text-stone-400">(optional)</span>
            </label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-lg ring-1 ring-stone-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute right-2 top-2 rounded-full bg-stone-900/70 p-1.5 text-white transition hover:bg-stone-900"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>

                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-medium text-white">
                  <Check size={12} /> Uploaded
                </div>
              </div>
            ) : uploading ? (
              <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50">
                <div className="flex flex-col items-center gap-2 text-amber-700">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-sm font-medium">Uploading photo…</span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition ${
                  dragging
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-300 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <UploadCloud
                  size={28}
                  className={dragging ? 'text-amber-500' : 'text-stone-400'}
                />
                <p className="mt-2 text-sm font-medium text-stone-600">
                  Drag & drop or click to upload
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  PNG, JPG up to 15 MB
                </p>

                {!isCloudinaryConfigured() && (
                  <p className="mt-2 max-w-xs text-center text-xs text-rose-500">
                    Upload needs a Cloudinary upload preset in .env
                  </p>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Your name
            </label>
            <input
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="e.g. Grandma Rose"
            />
          </div>

          {/* TITLE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Summer at the lake, 1998"
            />
          </div>

          {/* STORY */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              The story
            </label>
            <textarea
              required
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full resize-none rounded-lg border border-stone-300 px-3 py-2.5 text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Tell us what happened…"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={busy || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 font-medium text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
          >
            {busy && <Loader2 size={18} className="animate-spin" />}
            {busy ? 'Posting…' : uploading ? 'Wait for upload…' : 'Post memory'}
          </button>
        </form>
      </div>
    </div>
  );
}
