// src/context/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { UserRole } from '@prisma/client'; // Import UserRole from Prisma client
import { toast } from 'sonner';

// Define the shape of our authentication context
interface AuthContextType {
  user: SupabaseAuthUser | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole | null; // Our custom user role from the Prisma DB
  logout: () => Promise<void>;
  // refreshSession: () => Promise<void>; // If explicit refresh is needed
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap our application and provide auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);

        // Fetch the user's role from our database whenever auth state changes.
        // This is crucial for role-based access control.
        if (currentSession?.user) {
          const { data: dbUser, error } = await supabase
            .from('users') // Query our 'users' table in Supabase (which is backed by Prisma)
            .select('role')
            .eq('supabase_id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          } else if (dbUser) {
            setUserRole(dbUser.role as UserRole); // Cast to UserRole enum
          } else {
            // This case might happen if Supabase Auth user exists, but DB entry is not yet created.
            // For example, if the user navigates away before OTP verification is fully processed.
            // We can prompt them to complete registration or handle this as an unassigned role.
            console.warn('Supabase Auth user found, but no matching DB user entry.');
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    // Initial check (useful for server-side rendered pages that hydrate)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
      if (session?.user) {
         // Fetch user role on initial load if session exists
        supabase
          .from('users')
          .select('role')
          .eq('supabase_id', session.user.id)
          .single()
          .then(({ data: dbUser, error }) => {
            if (error) {
              console.error('Error fetching user role on initial load:', error);
              setUserRole(null);
            } else if (dbUser) {
              setUserRole(dbUser.role as UserRole);
            } else {
              console.warn('Supabase Auth user found, but no matching DB user entry on initial load.');
              setUserRole(null);
            }
          });
      }
    });


    // Clean up the auth listener on component unmount
    return () => {
      authListener.unsubscribe();
    };
  }, [router, supabase]); // Re-run effect if router or supabase instance changes

  const logout = async () => {
    setIsLoading(true); // Indicate loading during logout
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out.');
    } else {
      setUser(null);
      setSession(null);
      setUserRole(null); // Clear role on logout
      toast.success('Logged out successfully!');
      router.push('/login'); // Redirect to login page after logout
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, userRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
