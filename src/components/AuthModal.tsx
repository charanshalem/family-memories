import { useState } from 'react';
import { X, Lock, Mail, Heart } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
};

export function AuthModal({ open, onClose, onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await onSignIn(email, password);
      else await onSignUp(email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-stone-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Heart className="text-rose-500" size={22} />
          </div>
          <h2 className="font-serif text-2xl text-stone-800">
            {mode === 'signin' ? 'Owner Sign In' : 'Create Owner Account'}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {mode === 'signin'
              ? 'Sign in to manage family memories'
              : 'Create the owner account to manage memories'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-stone-300 py-2.5 pl-10 pr-3 text-stone-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                placeholder="you@family.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone-300 py-2.5 pl-10 pr-3 text-stone-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-rose-500 py-2.5 font-medium text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60"
          >
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          {mode === 'signin' ? "Need an owner account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
