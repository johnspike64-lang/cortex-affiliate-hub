import { createClient } from "@supabase/supabase-js";

// Projeto Supabase próprio (chave anon é publicável — pode ficar no código).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://xxgyhehzbjmhuqpsyhka.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z3loZWh6YmptaHVxcHN5aGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzExMzEsImV4cCI6MjEwMDc0NzEzMX0.RwiEMtttJsnJpx_KEUpNl70xyepEn1dElQEhH8Cr7X4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
