// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';
import { UserRole } from '@prisma/client'; // Import UserRole for type checking

// This middleware is crucial for handling authentication and authorization (role-based access control).
// It runs before a request is completed, allowing us to protect routes and redirect users.
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // --- Public Routes ---
  // These routes are accessible to everyone (logged in or logged out).
  const publicRoutes = [
    '/', // Landing page
    '/login',
    '/register',
    '/otp',
    '/api/auth/callback', // Supabase callback URL
    // Add other public pages like privacy policy, terms of service etc.
  ];

  // If the user is trying to access a public route, let them proceed.
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return response;
  }

  // --- Authentication Check ---
  // If no session (user is not logged in) and trying to access a protected route, redirect to login.
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- Authorization (Role-Based Access Control) ---
  // If the user is logged in, fetch their role from the database.
  // This requires querying our 'users' table, not just Supabase Auth metadata,
  // because Supabase Auth only stores basic user info, not our custom roles.
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('role')
    .eq('supabase_id', session.user.id)
    .single();

  if (error || !dbUser) {
    // If user has a session but no role in DB (e.g., incomplete registration),
    // or if there's an error fetching the role, redirect to a page to complete profile or to login.
    console.error('Middleware: Error fetching user role or user not found in DB:', error?.message);
    // Potentially redirect to an OTP verification page if they've registered but not completed it
    if (pathname !== '/otp' && pathname !== '/register' && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url)); // Fallback to login
    }
  }

  const userRole: UserRole | null = dbUser ? (dbUser.role as UserRole) : null;

  // --- Role-based Redirection ---
  // Define protected paths for each role.
  const customerProtectedPaths = ['/dashboard', '/order', '/wallet', '/profile', '/settings', '/sos'];
  const driverProtectedPaths = ['/dashboard', '/onboarding', '/jobs', '/earnings', '/settings'];
  const adminProtectedPaths = ['/admin', '/admin/users', '/admin/orders', '/admin/drivers', '/admin/pricing', '/admin/reports', '/admin/settings'];

  // Example: Redirect to specific dashboard based on role after login
  if (pathname === '/dashboard') {
    switch (userRole) {
      case UserRole.CUSTOMER:
        return NextResponse.redirect(new URL('/customer', request.url));
      case UserRole.DRIVER:
        // Check if driver has completed onboarding, else redirect to onboarding
        const { data: driverProfile, error: driverError } = await supabase
          .from('drivers')
          .select('is_verified')
          .eq('user_id', dbUser.id) // Assuming dbUser has 'id' field matching userId in Driver table
          .single();

        if (driverError || !driverProfile) {
          console.warn('Middleware: Driver profile not found or error:', driverError?.message);
          return NextResponse.redirect(new URL('/driver/onboarding', request.url));
        }

        if (!driverProfile.is_verified) {
          return NextResponse.redirect(new URL('/driver/onboarding', request.url));
        }
        return NextResponse.redirect(new URL('/driver', request.url));
      case UserRole.DISTRICT_ADMIN:
      case UserRole.SUPER_ADMIN:
        return NextResponse.redirect(new URL('/admin', request.url));
      default:
        // If role is unassigned or unknown, redirect to a default safe page or login
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Enforce access for specific roles based on the path.
  if (pathname.startsWith('/customer')) {
    if (userRole !== UserRole.CUSTOMER) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else if (pathname.startsWith('/driver')) {
    if (userRole !== UserRole.DRIVER) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else if (pathname.startsWith('/admin')) {
    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.DISTRICT_ADMIN) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     *
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any files in the public folder (e.g., /assets/*)
     * - /api/* (API routes - handled separately or protected within the route itself)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
    '/', // Explicitly include root for clarity
    '/api/auth/complete-registration', // Explicitly include API route for middleware checks if needed
  ],
};
