// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// This client is used in server-side components, API routes, and server actions.
// It securely accesses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (private, never exposed to client).
// This is essential for privileged operations and fetching data safely on the server.
export const createSupabaseServerClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `set` method was called in a Server Component.
            // This is problematic because Server Components don't have a `Response` object.
            // We ignore it, but log a warning if needed for debugging.
            // console.warn('Supabase server client `set` called in Server Component:', error);
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // console.warn('Supabase server client `remove` called in Server Component:', error);
          }
        },
      },
      // Ensure autoRefreshToken is false on the server to prevent token refresh issues
      // in serverless environments, as tokens should be managed via cookies.
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Helper to get the server client instance in Server Components.
export const supabaseServer = createSupabaseServerClient(cookies());

// This client uses the anonymous key (like the browser client) but runs on the server.
// Useful for fetching data that *should* respect RLS on the server.
export const createSupabaseAnonServerClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // console.warn('Supabase anon server client `set` called in Server Component:', error);
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // console.warn('Supabase anon server client `remove` called in Server Component:', error);
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
