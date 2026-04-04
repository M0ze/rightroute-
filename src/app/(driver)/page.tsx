// src/app/(driver)/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Power } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Driver dashboard showing available jobs, earnings, and real-time status
// This is the primary interface for drivers to manage their work and income
// Optimized for mobile-first, with quick job acceptance workflow

interface AvailableJob {
  id: string;
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  fareAmount: number;
  distanceKm?: number;
  createdAt: string;
}

interface DriverStats {
  totalEarnings: number;
  completedDeliveries: number;
  rating: number;
  activeOrders: number;
}

export default function DriverDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [stats, setStats] = useState<DriverStats>({
    totalEarnings: 0,
    completedDeliveries: 0,
    rating: 5.0,
    activeOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Fetch driver stats and available jobs
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchDriverData = async () => {
      try {
        // Fetch driver stats
        const statsResponse = await fetch(`/api/drivers/${user.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch available jobs (only if driver is online)
        if (isOnline) {
          const jobsResponse = await fetch(`/api/orders/available?driverId=${user.id}`);
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setAvailableJobs(jobsData);
          }
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchDriverData();
    }
  }, [user, authLoading, router, isOnline]);

  // Toggle driver online/offline status
  const handleToggleOnline = async () => {
    setIsTogglingStatus(true);
    try {
      const response = await fetch(`/api/drivers/${user?.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      setIsOnline(!isOnline);
      toast.success(isOnline ? 'You are now offline' : 'You are now online and accepting orders');
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Accept a job
  const acceptJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/orders/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: user?.id }),
      });

      if (!response.ok) throw new Error('Failed to accept job');
      toast.success('Job accepted! Start navigation to pickup location.');
      
      // Refresh available jobs
      const jobsResponse = await fetch(`/api/orders/available?driverId=${user?.id}`);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setAvailableJobs(jobsData);
      }

      router.push(`/driver/jobs/${jobId}`);
    } catch (error) {
      toast.error('Failed to accept job');
      console.error('Error:', error);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header with Online Toggle */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, Driver</h1>
          <p className="text-muted-foreground">You're currently <span className="font-semibold">{isOnline ? '🟢 Online' : '🔴 Offline'}</span></p>
        </div>
        <Button
          onClick={handleToggleOnline}
          disabled={isTogglingStatus}
          className={`${
            isOnline
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
          size="lg"
        >
          <Power className="mr-2 h-5 w-5" />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">UGX {stats.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed Orders</p>
                <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
                <p className="text-2xl font-bold">⭐ {stats.rating.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Orders</p>
                <p className="text-2xl font-bold">{stats.activeOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Jobs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Available Orders</h2>

        {!isOnline && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-muted-foreground">Go online to see available orders</p>
              <Button onClick={handleToggleOnline} className="mt-4 bg-green-600 hover:bg-green-700">
                Go Online
              </Button>
            </CardContent>
          </Card>
        )}

        {isOnline && availableJobs.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No orders available right now. Check back soon!</p>
            </CardContent>
          </Card>
        )}

        {isOnline && availableJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2">📍 {job.pickupAddress}</h3>
                  <p className="text-sm text-muted-foreground mb-2">→ {job.dropoffAddress}</p>
                  {job.distanceKm && (
                    <p className="text-xs text-muted-foreground">Distance: {job.distanceKm.toFixed(1)} km</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">UGX {job.fareAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Your cut: UGX {Math.round(job.fareAmount * 0.85).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => acceptJob(job.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Accept Order
                </Button>
                <Button variant="outline" className="flex-1">
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/driver/earnings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Earnings Report</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/profile">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
              <p className="font-semibold">My Profile</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/settings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
