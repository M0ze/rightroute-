// src/app/api/drivers/[driverId]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET driver stats: total earnings, completed deliveries, rating, active orders
export async function GET(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const driverId = params.driverId;

    if (!driverId) {
      return NextResponse.json({ error: 'driverId is required' }, { status: 400 });
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: driverId },
      select: {
        earnings: true,
        rating: true,
        deliveryCount: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Count active orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        driverId: driverId,
        status: {
          in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      },
    });

    return NextResponse.json({
      totalEarnings: driver.earnings,
      completedDeliveries: driver.deliveryCount,
      rating: driver.rating,
      activeOrders: activeOrdersCount,
    });
  } catch (error: any) {
    console.error('GET /api/drivers/[driverId]/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch driver stats' }, { status: 500 });
  }
}
