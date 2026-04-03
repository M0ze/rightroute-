// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// This client is used in client-side components and browser environments.
// It uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (publicly exposed).
// Supabase's RLS (Row Level Security) will protect data access.
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Helper to get the browser client instance.
// In a mobile-first app for Uganda, robust client-side interaction is key,
// but always ensure sensitive operations are routed through secure API routes.
export const supabaseBrowser = createSupabaseBrowserClient();
