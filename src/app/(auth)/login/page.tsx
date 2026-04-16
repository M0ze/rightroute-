// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/AuthForms';
import Link from 'next/link';

// Login page for RightRoute. Users can log in with their phone number and password.
// This page is mobile-first, designed for quick access on low-bandwidth networks.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Welcome Back to RightRoute</h1>
        <p className="text-center text-muted-foreground">Log in to continue your journey.</p>
        <LoginForm />
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </div>
        {/* Optional: Add social login buttons here (Google, etc.) */}
      </div>
    </div>
  );
}
