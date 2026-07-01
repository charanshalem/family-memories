import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase environment variables missing");
}

export const supabase = createClient(url, key);

export type Memory = {
  id: string;
  title: string;
  story: string;
  image_url: string | null;
  author_name: string;
  created_at: string;
};
