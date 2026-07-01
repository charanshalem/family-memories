import { AdminPanel } from './components/AdminPanel';
import { useEffect, useState, useCallback } from 'react';
import { Plus, LogIn, LogOut, Heart, Sparkles, Loader2, ImageOff } from 'lucide-react';
import { supabase, type Memory } from './lib/supabase';
import { useAuth } from './lib/auth';
import { AuthModal } from './components/AuthModal';
import { PostForm } from './components/PostForm';
import { MemoryCard } from './components/MemoryCard';

export default function App() {
  const { session, signIn, signUp, signOut } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);

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
  }, [loadMemories]);

  useEffect(() => {
    async function checkApproval() {
      if (!session) {
        setApproved(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setApproved(data.approved);
      }
    }

    checkApproval();
  }, [session]);

  const handleCreated = (m: Memory) => {
    setMemories((prev) => [m, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return;
    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (!error) setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const isOwner = !!session && approved === true;

  if (session && approved === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="rounded-2xl bg-white p-10 shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-3">Access Pending</h1>
          <p className="text-stone-600">
            Your access request was sent to the owner.
          </p>
          <p className="text-stone-500 mt-2">
            Please wait for approval.
          </p>
          <button
            onClick={signOut}
            className="mt-6 rounded-lg bg-rose-500 px-5 py-2 text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100">
              <Heart size={18} className="text-rose-500" fill="currentColor" />
            </div>
            <span className="font-serif text-xl text-stone-800">
              Our Family Memories
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
                  <Sparkles size={13} /> Approved
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}

            <button
              onClick={() => setPostOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              <Plus size={16} /> Share
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200">
            <Heart size={26} className="text-rose-500" fill="currentColor" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl">
            A place for the moments
            <br />
            we never want to forget
          </h1>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
              <ImageOff className="text-stone-400" size={26} />
            </div>
            <h3 className="font-serif text-xl text-stone-700">
              No memories yet
            </h3>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {memories.map((m) => (
              <div key={m.id} className="mb-6">
                <MemoryCard
                  memory={m}
                  canDelete={isOwner}
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

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    </div>
  );
}
