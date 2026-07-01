import { useState } from 'react';
import { X, Lock, Mail, Heart } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
};

export function AuthModal({ open, onClose, onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-stone-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Heart className="text-rose-500" size={22} />
          </div>

          <h2 className="font-serif text-2xl text-stone-800">
            {mode === 'signin' ? 'Sign In' : 'Request Access'}
          </h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border px-3 py-2.5"
            />
          )}

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border px-3 py-2.5"
          />

          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border px-3 py-2.5"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-rose-500 py-2.5 text-white"
          >
            {busy
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Request Access'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          {mode === 'signin' ? 'Need access? ' : 'Already registered? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-rose-600 font-medium"
          >
            {mode === 'signin' ? 'Request Access' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
