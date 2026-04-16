// src/app/(auth)/register/page.tsx
import { RegisterForm } from '@/components/auth/AuthForms';
import Link from 'next/link';

// Registration page for RightRoute. Users can create a new account.
// Phone number-based registration with OTP verification is prioritized for Uganda.
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Join RightRoute</h1>
        <p className="text-center text-muted-foreground">Create your account to start moving.</p>
        <RegisterForm />
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
