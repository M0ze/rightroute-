// src/app/api/drivers/[driverId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH: Update driver online/offline status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const driverId = params.driverId;
    const { isOnline } = await request.json();

    if (!driverId || isOnline === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update driver online status
    const driver = await prisma.driver.update({
      where: { userId: driverId },
      data: { isOnline },
    });

    return NextResponse.json({ success: true, isOnline: driver.isOnline });
  } catch (error: any) {
    console.error('PATCH /api/drivers/[driverId]/status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
