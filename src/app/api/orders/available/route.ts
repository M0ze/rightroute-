// src/app/api/orders/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch available orders for a driver (PENDING status, not yet assigned)
// Uses simple geographic proximity for matching
// Future: implement advanced matching with surge pricing, driver rating, etc.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json({ error: 'driverId is required' }, { status: 400 });
    }

    // Get driver's current location
    const driver = await prisma.driver.findUnique({
      where: { userId: driverId },
      select: { currentLocation: true },
    });

    if (!driver || !driver.currentLocation) {
      return NextResponse.json({ orders: [] });
    }

    // Parse driver location
    const [driverLat, driverLng] = driver.currentLocation.split(',').map(Number);

    // Fetch pending orders (not yet assigned to a driver)
    const allOrders = await prisma.order.findMany({
      where: { status: 'PENDING', driverId: null },
      include: {
        customer: { select: { fullName: true, phoneNumber: true } },
      },
    });

    // Calculate distance and filter orders within 5 km (for MVP)
    // Future: use PostGIS for efficient geographic queries
    const MAX_DISTANCE_KM = 5;
    const ordersWithDistance = allOrders
      .map((order) => {
        const [pickupLat, pickupLng] = order.pickupLocation.split(',').map(Number);
        const distance = calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
        return { ...order, distanceKm: distance };
      })
      .filter((order) => order.distanceKm <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm); // Closest first

    return NextResponse.json(ordersWithDistance);
  } catch (error: any) {
    console.error('GET /api/orders/available error:', error);
    return NextResponse.json({ error: 'Failed to fetch available orders' }, { status: 500 });
  }
}

// Haversine formula to calculate distance between two lat/lng points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
