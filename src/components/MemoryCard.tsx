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
    <article className="group relative flex break-inside-avoid flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
      {memory.image_url && (
        <img
          src={memory.image_url}
          alt={memory.title}
          className="h-56 w-full object-cover"
        />
      )}

      <div className="p-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-amber-600">
          <Heart size={13} fill="currentColor" className="text-rose-400" />
          {formatDate(memory.created_at)}
        </div>

        <h3 className="text-xl font-semibold">{memory.title}</h3>

        <p className="mt-2 text-sm text-stone-600">
          {memory.story}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span>— {memory.author_name}</span>

          {canDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="flex items-center gap-1 text-red-500"
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
