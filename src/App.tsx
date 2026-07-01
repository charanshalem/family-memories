import { useEffect, useState, useCallback } from 'react';
import { Plus, LogOut, Heart, Loader2, ImageOff } from 'lucide-react';
import { supabase, type Memory } from './lib/supabase';
import { PostForm } from './components/PostForm';
import { MemoryCard } from './components/MemoryCard';

const FAMILY_PASSWORD = 'family@143';
const ADMIN_PASSWORD = 'cherry@143';

export default function App() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);

  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const loadMemories = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMemories(data as Memory[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMemories();

    if (localStorage.getItem('family_access') === 'true') {
      setHasAccess(true);
    }

    if (localStorage.getItem('admin_access') === 'true') {
      setIsAdmin(true);
    }
  }, [loadMemories]);

  const handleCreated = (m: Memory) => {
    setMemories((prev) => [m, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory permanently?')) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const unlockFamily = () => {
    if (password === FAMILY_PASSWORD) {
      setHasAccess(true);
      localStorage.setItem('family_access', 'true');
      setError('');
    } else {
      setError('Wrong family password');
    }
  };

  const unlockAdmin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('admin_access', 'true');
      setError('');
    } else {
      setError('Wrong admin password');
    }
  };

  const logout = () => {
    localStorage.removeItem('family_access');
    localStorage.removeItem('admin_access');
    setHasAccess(false);
    setIsAdmin(false);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-3">
            Family Access
          </h1>

          <p className="text-center text-stone-500 mb-6">
            Enter family password to view memories
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Family password"
            className="w-full rounded-lg border px-4 py-3 mb-4"
          />

          <button
            onClick={unlockFamily}
            className="w-full rounded-lg bg-rose-500 py-3 text-white"
          >
            Unlock
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
            <span className="font-serif text-xl">Our Family Memories</span>
          </div>

          <div className="flex gap-2 items-center">
            {!isAdmin && (
              <>
                <input
                  type="password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />

                <button
                  onClick={unlockAdmin}
                  className="bg-amber-500 text-white px-3 py-2 rounded"
                >
                  Admin
                </button>
              </>
            )}

            <button
              onClick={() => setPostOpen(true)}
              className="bg-rose-500 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <Plus size={16} /> Share
            </button>

            <button
              onClick={logout}
              className="border px-3 py-2 rounded flex items-center gap-1"
            >
              <LogOut size={16} /> Exit
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20">
            <ImageOff size={30} className="mx-auto mb-4" />
            <h3>No memories yet</h3>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {memories.map((m) => (
              <div key={m.id} className="mb-6">
                <MemoryCard
                  memory={m}
                  canDelete={isAdmin}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <PostForm
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
