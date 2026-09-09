import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

// Keep builds and the public landing page renderable before deployment secrets
// are configured. Data operations still return a clear configuration error.
const supabaseUrl = configuredUrl || "http://127.0.0.1:54321";
const supabasePublishableKey = configuredKey || "missing-publishable-key";

/** Browser-safe client. Authorization is enforced by Postgres row-level security. */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
