// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET: Fetch orders for a specific user (customer or driver)
// Filters by userId and includes related data (driver/customer info)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch orders where user is customer or driver
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ customerId: userId }, { driverId: userId }],
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST: Create a new order
// Customer places order with pickup/dropoff locations, package details, etc.
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    // Verify user is authenticated via Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      pickupAddress,
      dropoffAddress,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      packageType,
      packageWeight,
      notes,
      estimatedFare,
    } = body;

    // Validate required fields
    if (!customerId || !pickupAddress || !dropoffAddress || estimatedFare === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns the customerId (security check)
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: session.user.id },
    });

    if (!dbUser || dbUser.id !== customerId) {
      return NextResponse.json({ error: 'Unauthorized: User mismatch' }, { status: 403 });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId,
        pickupAddress,
        dropoffAddress,
        pickupLocation: `${pickupLat},${pickupLng}`, // Store as "LAT,LNG" string
        dropoffLocation: `${dropoffLat},${dropoffLng}`,
        packageType,
        packageWeight,
        notes: notes || '',
        fareAmount: estimatedFare,
        commissionPaid: estimatedFare * 0.15, // 15% commission
        driverPayout: estimatedFare * 0.85, // 85% to driver
        status: 'PENDING', // Order starts in PENDING status, waits for driver matching
        paymentStatus: 'PENDING',
      },
    });

    // Optional: Trigger order matching algorithm or notify available drivers
    // This would typically be done via a background job (BullMQ, etc.)
    // For MVP, we can trigger a simple driver notification

    return NextResponse.json({ orderId: order.id, order }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
