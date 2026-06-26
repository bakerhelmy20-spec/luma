import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase is not configured. Please add the following environment variables:\n' +
        '- VITE_SUPABASE_URL\n' +
        '- VITE_SUPABASE_PUBLISHABLE_KEY\n\n' +
        'Get these from your Supabase project dashboard: https://supabase.com/dashboard'
      );
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// Export as supabase for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabase();
    return client[prop as keyof SupabaseClient];
  }
});
