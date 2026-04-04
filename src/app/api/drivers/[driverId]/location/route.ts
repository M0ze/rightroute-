// src/app/api/drivers/[driverId]/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH: Update driver's current location (for live tracking)
// Called frequently by the driver app to provide real-time location updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const driverId = params.driverId;
    const { latitude, longitude } = await request.json();

    if (!driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store location as "LAT,LNG" string
    const locationString = `${latitude},${longitude}`;

    // Update driver location
    const driver = await prisma.driver.update({
      where: { userId: driverId },
      data: { currentLocation: locationString },
    });

    // Optional: Trigger real-time updates via Supabase Realtime or Pusher
    // This would broadcast location to customer and admin dashboards
    // Implementation: call Pusher.trigger() or Supabase.realtime().broadcast()

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/drivers/[driverId]/location error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
