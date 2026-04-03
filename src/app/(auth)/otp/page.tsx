// src/app/(auth)/otp/page.tsx
import { OTPScreen } from '@/components/auth/OTPScreen';

// OTP verification page for RightRoute.
// Users are redirected here after phone number registration to verify their account.
// This is a critical step for phone-based authentication in Uganda.
export default function OtpVerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8 shadow-lg">
        <OTPScreen />
      </div>
    </div>
  );
}
