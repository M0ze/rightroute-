// src/app/api/auth/complete-registration/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Prisma client
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Server-side Supabase client
import { cookies } from 'next/headers';

// This API route handles the final step of registration after Supabase OTP verification.
// It creates a corresponding user entry in our PostgreSQL database (Prisma).
// This is crucial for linking Supabase Auth users to our application's user roles and profiles.
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use server client for privileged operations

  try {
    const { supabaseId, phoneNumber, fullName } = await request.json();

    // Ensure the request has necessary data.
    if (!supabaseId || !phoneNumber || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if a user with this supabaseId already exists in our database.
    // This prevents duplicate entries if the webhook fires multiple times or during retries.
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseId },
    });

    if (existingUser) {
      console.log(`User with supabaseId ${supabaseId} already exists in DB.`);
      return NextResponse.json({ message: 'User already registered in DB' }, { status: 200 });
    }

    // Create the new user in our Prisma database with a default role of CUSTOMER.
    // This maps the Supabase Auth user to our application's internal User model.
    const newUser = await prisma.user.create({
      data: {
        supabaseId: supabaseId,
        phoneNumber: phoneNumber,
        fullName: fullName,
        role: 'CUSTOMER', // Default role for new registrations
        isActive: true,
        // Potentially add email if available from Supabase data.user?.email
      },
    });

    // Also create a default customer profile for the new user.
    await prisma.customer.create({
      data: {
        userId: newUser.id,
      },
    });

    // Initialize an empty wallet for the new customer.
    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: 0.0,
      },
    });


    console.log('New user registered in DB:', newUser.id);
    return NextResponse.json({ message: 'User registered successfully', userId: newUser.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error during complete-registration API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete registration' }, { status: 500 });
  }
}

// NOTE: For production, you might want to protect this endpoint with an internal
// API key or ensure it's called only from trusted sources (e.g., a Supabase Function
// acting as a webhook listener for `auth.users` table inserts).
// For this project MVP, we're calling it directly from the client after OTP verification.
// Enhanced security would involve a server-side webhook from Supabase for `auth.users` `INSERT` events.
