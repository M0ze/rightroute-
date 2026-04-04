// src/app/api/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH: Update order status
// Allows driver to update order status: PICKED_UP → IN_TRANSIT → DELIVERED
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const { status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build update data with timestamp based on status
    const updateData: any = { status };

    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: { select: { fullName: true, phoneNumber: true } },
        driver: { select: { user: { select: { fullName: true, phoneNumber: true } } } },
      },
    });

    // Optional: Send notification to customer about status update
    // Implementation: SMS, in-app notification, push notification, etc.

    // If order is delivered, update driver stats
    if (status === 'DELIVERED') {
      const driver = await prisma.driver.findUnique({
        where: { userId: order.driverId! },
        select: { earnings: true, deliveryCount: true },
      });

      if (driver) {
        await prisma.driver.update({
          where: { userId: order.driverId! },
          data: {
            earnings: driver.earnings + order.driverPayout,
            deliveryCount: driver.deliveryCount + 1,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('PATCH /api/orders/[orderId]/status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

// GET: Fetch order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { fullName: true, phoneNumber: true } },
        driver: { select: { user: { select: { fullName: true, phoneNumber: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('GET /api/orders/[orderId]/status error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
