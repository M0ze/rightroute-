// src/components/auth/OTPScreen.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }), // Supabase default OTP length
});

type OtpFormValues = z.infer<typeof otpSchema>;

export function OTPScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || ''; // Get phone number from URL
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (values: OtpFormValues) => {
    setIsLoading(true);
    toast.info('Verifying OTP...');
    try {
      // Verify OTP using Supabase auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: values.otp,
        type: 'sms', // Specify type as 'sms' for phone verification
      });

      if (error) {
        throw error;
      }

      // If OTP is verified, the user is signed in.
      // Now, we need to create the user's profile in our Prisma database.
      // This step ensures the user has a `User` entry with the correct role.
      // We will call a server action or API route for this.
      await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ supabaseId: data.user?.id, phoneNumber: phoneNumber, fullName: data.user?.user_metadata.full_name }),
      });


      toast.success('Account verified and logged in! Redirecting...');
      router.push('/dashboard'); // Redirect to dashboard, role middleware will handle specific path
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    toast.info('Resending OTP...');
    try {
      const { error } = await supabase.auth.resend({
        type: 'sms',
        phone: phoneNumber,
      });

      if (error) {
        throw error;
      }
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP.');
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Verify Your Phone Number</h2>
      <p className="text-center text-sm text-muted-foreground">
        A 6-digit OTP has been sent to your phone number: <span className="font-bold">{phoneNumber}</span>.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="XXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </Form>
      <Button variant="link" onClick={resendOtp} disabled={isLoading} className="w-full">
        {isLoading ? 'Resending...' : 'Resend OTP'}
      </Button>
    </div>
  );
}
