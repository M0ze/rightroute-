// src/components/auth/AuthForms.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Use browser client for client-side auth
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'; // shadcn/ui form components
import { Input } from '@/components/ui/input'; // shadcn/ui input component
import { Button } from '@/components/ui/button'; // shadcn/ui button component
import { toast } from 'sonner'; // For user notifications

// --- Zod Schemas for Validation ---
// Input validation is critical for security and data integrity, especially
// in mobile environments where network conditions might lead to incomplete data.
const loginSchema = z.object({
  phoneNumber: z.string().min(10, { message: 'Phone number is required and must be valid.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number is required and must be valid.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    toast.info('Attempting to log in...');
    try {
      // Supabase's sign-in with password (email or phone)
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: values.phoneNumber,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // After successful login, redirect to the appropriate dashboard
      // The `roleMiddleware` will handle the specific redirection based on user role.
      toast.success('Login successful! Redirecting...');
      router.push('/dashboard'); // Generic dashboard, middleware handles role-specific routing
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (e.g., +256771234567)</FormLabel>
              <FormControl>
                <Input placeholder="+256771234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    toast.info('Attempting to register...');
    try {
      // Supabase's sign-up with password (email or phone)
      // This will create the user in Supabase Auth and trigger an OTP if phone number is used.
      // For phone-based registration in Uganda, OTP verification is crucial.
      const { data, error } = await supabase.auth.signUp({
        phone: values.phoneNumber,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            // Additional user metadata can be stored here
          },
          // redirectTo: `${window.location.origin}/auth/callback`, // Optional: for email confirmation links
        },
      });

      if (error) {
        throw error;
      }

      // If phone number sign-up, Supabase will send an OTP.
      // We then redirect the user to an OTP verification page.
      // The user will then complete verification on the OTP screen.
      toast.success('Registration successful! Please check your phone for an OTP to verify your account.');
      router.push(`/auth/otp?phone=${values.phoneNumber}`); // Redirect to OTP verification
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (e.g., +256771234567)</FormLabel>
              <FormControl>
                <Input placeholder="+256771234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Form>
  );
}
