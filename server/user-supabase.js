import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env.js";

/**
 * Creates a request-scoped Supabase client that uses the authenticated user's
 * access token. Table and Storage access is still enforced by Supabase RLS.
 */
export function createUserSupabaseClient(accessToken) {
  const supabaseUrl = getServerEnv("SUPABASE_URL", {
    aliases: ["VITE_SUPABASE_URL"],
  });
  const publishableKey = getServerEnv("SUPABASE_PUBLISHABLE_KEY", {
    aliases: [
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
    ],
  });

  if (!supabaseUrl || !publishableKey || !accessToken) {
    throw new Error("Thiếu cấu hình Supabase hoặc phiên người dùng.");
  }

  return createClient(supabaseUrl, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
