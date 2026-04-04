// src/app/api/orders/[orderId]/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST: Driver accepts an order
// Assigns the order to the driver and changes status to ACCEPTED
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const { driverId } = await request.json();

    if (!orderId || !driverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update order: assign to driver, change status to ACCEPTED
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: driverId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        customer: { select: { fullName: true, phoneNumber: true } },
        driver: { select: { user: { select: { fullName: true, phoneNumber: true } } } },
      },
    });

    // Optional: Send notification to customer that a driver accepted their order
    // Implementation: trigger SMS via Africa's Talking, in-app notification, etc.

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('POST /api/orders/[orderId]/accept error:', error);
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 });
  }
}
