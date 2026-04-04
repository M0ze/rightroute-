// src/app/(customer)/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tabs } from '@/components/ui/tabs';
import { Plus, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Customer dashboard showing active orders, order history, and quick action buttons.
// This is the primary interface for customers to manage their deliveries.
// Optimized for mobile-first viewing on low-bandwidth networks.

interface Order {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  fareAmount: number;
  createdAt: string;
  driver?: { fullName: string; rating: number };
}

export default function CustomerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Fetch customer's orders on component mount
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const activeOrders = orders.filter((o) => ['PENDING', 'SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(o.status));
  const completedOrders = orders.filter((o) => ['DELIVERED', 'CANCELLED', 'FAILED'].includes(o.status));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SEARCHING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'ACCEPTED':
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Waiting for Driver',
      SEARCHING: 'Finding Driver',
      ACCEPTED: 'Driver Accepted',
      PICKED_UP: 'In Transit',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      FAILED: 'Failed',
    };
    return statusMap[status] || status;
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.user_metadata?.full_name || 'Customer'}</h1>
        <p className="text-muted-foreground">Manage your deliveries and track orders in real-time.</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/customer/order/new" className="flex-1">
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </Link>
        <Link href="/customer/wallet" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            Wallet
          </Button>
        </Link>
        <Link href="/customer/profile" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            Profile
          </Button>
        </Link>
      </div>

      {/* Tabs: Active Orders vs Completed Orders */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
          >
            Active Orders ({activeOrders.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedOrders.length})
          </Button>
        </div>

        {/* Active Orders */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No active orders. Create a new order to get started!</p>
                  <Link href="/customer/order/new">
                    <Button className="mt-4">Create Order</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Link key={order.id} href={`/customer/order/${order.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          {getStatusIcon(order.status)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{order.pickupAddress}</h3>
                            <p className="text-sm text-muted-foreground truncate">→ {order.dropoffAddress}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">UGX {order.fareAmount.toLocaleString()}</p>
                          <p className="text-xs text-green-600 font-semibold">{getStatusText(order.status)}</p>
                        </div>
                      </div>
                      {order.driver && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <p className="text-muted-foreground">Driver: <span className="font-semibold">{order.driver.fullName}</span></p>
                          <p className="text-muted-foreground">Rating: <span className="font-semibold">⭐ {order.driver.rating}</span></p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Completed Orders */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No completed orders yet.</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Link key={order.id} href={`/customer/order/${order.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          {getStatusIcon(order.status)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{order.pickupAddress}</h3>
                            <p className="text-sm text-muted-foreground truncate">→ {order.dropoffAddress}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">UGX {order.fareAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-600 font-semibold">{getStatusText(order.status)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
