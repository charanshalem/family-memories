import { useEffect, useState, useCallback } from 'react';
import { Plus, LogOut, Heart, Loader2, ImageOff, Trash2 } from 'lucide-react';
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

  const [familyInput, setFamilyInput] = useState('');
  const [adminInput, setAdminInput] = useState('');
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
    if (!confirm('Delete this memory?')) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const unlockFamily = () => {
    if (familyInput === FAMILY_PASSWORD) {
      setHasAccess(true);
      localStorage.setItem('family_access', 'true');
      setError('');
    } else {
      setError('Wrong family password');
    }
  };

  const unlockAdmin = () => {
    if (adminInput === ADMIN_PASSWORD) {
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
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-[380px]">
          <h1 className="text-2xl font-bold text-center mb-4">
            Family Access Required
          </h1>

          <input
            type="password"
            placeholder="Enter family password"
            value={familyInput}
            onChange={(e) => setFamilyInput(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <button
            onClick={unlockFamily}
            className="w-full bg-rose-500 text-white rounded-lg py-3"
          >
            Unlock Memories
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
            <span className="font-serif text-xl">Our Family Memories</span>
          </div>

          <div className="flex gap-2">
            {!isAdmin && (
              <input
                type="password"
                placeholder="Admin password"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
            )}

            {!isAdmin && (
              <button
                onClick={unlockAdmin}
                className="bg-amber-500 text-white px-3 py-2 rounded"
              >
                Admin Login
              </button>
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
