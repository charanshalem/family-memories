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

  const handleCreated = (m: Memory) => {
    setMemories((prev) => [m, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return;
    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (!error) setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const isOwner = !!session;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Header */}
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
                  <Sparkles size={13} /> Owner
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
              >
                <LogIn size={16} /> Owner sign in
              </button>
            )}
            <button
              onClick={() => setPostOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Share a memory</span>
              <span className="sm:hidden">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-stone-50" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(120 113 108) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200">
            <Heart size={26} className="text-rose-500" fill="currentColor" />
          </div>
          <h1 className="font-serif text-4xl leading-tight text-stone-800 sm:text-6xl">
            A place for the moments
            <br />
            we never want to forget
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Everyone in the family is welcome to add a memory — a story, a photo,
            a laugh, a lesson. Together, we're keeping our story alive.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setPostOpen(true)}
              className="flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-medium text-white shadow-md transition hover:bg-rose-600"
            >
              <Plus size={18} /> Share a memory
            </button>
            <a
              href="#wall"
              className="rounded-full border border-stone-300 bg-white/70 px-6 py-3 font-medium text-stone-700 transition hover:bg-white"
            >
              Browse the wall
            </a>
          </div>
        </div>
      </section>

      {/* Memory wall */}
      <main id="wall" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-stone-800">The Memory Wall</h2>
            <p className="mt-1 text-stone-500">
              {memories.length === 0
                ? 'No memories yet — be the first to share one.'
                : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} and counting.`}
            </p>
          </div>
        </div>

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
              The wall is waiting
            </h3>
            <p className="mt-1 max-w-sm text-sm text-stone-500">
              Share the first memory and start building the family archive.
            </p>
            <button
              onClick={() => setPostOpen(true)}
              className="mt-5 flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-rose-600"
            >
              <Plus size={18} /> Add the first memory
            </button>
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

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-stone-500">
          <p className="flex items-center justify-center gap-1.5">
            Made with <Heart size={13} className="text-rose-400" fill="currentColor" /> for our family
          </p>
          <p className="mt-1 text-stone-400">
            Anyone can share. Only the owner can remove.
          </p>
        </div>
      </footer>

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
