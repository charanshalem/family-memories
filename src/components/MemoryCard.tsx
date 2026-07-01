import { Trash2, Heart } from 'lucide-react';
import type { Memory } from '../lib/supabase';

type Props = {
  memory: Memory;
  canDelete: boolean;
  onDelete: (id: string) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function MemoryCard({ memory, canDelete, onDelete }: Props) {
  return (
    <article className="group relative flex break-inside-avoid flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {memory.image_url && (
        <div className="overflow-hidden">
          <img
            src={memory.image_url}
            alt={memory.title}
            loading="lazy"
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-600">
          <Heart size={13} fill="currentColor" className="text-rose-400" />
          {formatDate(memory.created_at)}
        </div>

        <h3 className="font-serif text-xl leading-snug text-stone-800">
          {memory.title}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
          {memory.story}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-sm font-medium text-stone-500">
            — {memory.author_name}
          </span>
          {canDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
              aria-label="Delete memory"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
