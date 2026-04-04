// src/app/(driver)/jobs/[jobId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Map } from '@/components/customer/Map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock, DollarSign, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

// Driver job details page with live tracking and real-time updates
// Shows pickup/dropoff locations, customer info, and navigation
// Updates in real-time as driver progresses through delivery states

interface JobDetails {
  id: string;
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLocation: string; // "LAT,LNG"
  dropoffLocation: string; // "LAT,LNG"
  status: string;
  fareAmount: number;
  customer: { fullName: string; phoneNumber: string };
}

export default function DriverJobPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch job details
  useEffect(() => {
    if (!user || !jobId) return;

    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/orders/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch job');
        const data = await response.json();
        setJob(data);
      } catch (error) {
        toast.error('Failed to load job details');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [user, jobId]);

  // Get driver's current location (geolocation)
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not available');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ lat: latitude, lng: longitude });

        // Send location update to backend (for real-time tracking)
        fetch(`/api/drivers/${user?.id}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude }),
        }).catch(console.error);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not get your location. Please enable location services.');
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user?.id]);

  // Update job status (picked up, in transit, delivered)
  const updateJobStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      const updatedJob = await response.json();
      setJob(updatedJob);
      toast.success(`Order status updated to ${newStatus}`);

      if (newStatus === 'DELIVERED') {
        router.push('/driver');
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p>Job not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse location strings
  const [pickupLat, pickupLng] = job.pickupLocation.split(',').map(Number);
  const [dropoffLat, dropoffLng] = job.dropoffLocation.split(',').map(Number);

  const statusSteps = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
  const currentStatusIndex = statusSteps.indexOf(job.status);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>

        {/* Status Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                      index <= currentStatusIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {index < currentStatusIndex ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      index
                    )}
                  </div>
                  <p className="text-xs text-center">{step.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Route</CardTitle>
          </CardHeader>
          <CardContent>
            <Map
              pickupLat={pickupLat}
              pickupLng={pickupLng}
              dropoffLat={dropoffLat}
              dropoffLng={dropoffLng}
              driverLat={driverLocation?.lat}
              driverLng={driverLocation?.lng}
              className="w-full h-80 rounded-lg"
              interactive={false}
            />
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-semibold">{job.pickupAddress}</p>
              </div>
            </div>

            <div className="border-t pt-4 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Dropoff</p>
                <p className="font-semibold">{job.dropoffAddress}</p>
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-muted-foreground">Your Earnings</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                UGX {Math.round(job.fareAmount * 0.85).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold">{job.customer.fullName}</p>
            <a
              href={`tel:${job.customer.phoneNumber}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Phone className="h-4 w-4" />
              {job.customer.phoneNumber}
            </a>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {job.status === 'ACCEPTED' && (
            <Button
              onClick={() => updateJobStatus('PICKED_UP')}
              disabled={isUpdatingStatus}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Navigation className="mr-2 h-5 w-5" />
              I've Picked Up the Package
            </Button>
          )}

          {job.status === 'PICKED_UP' && (
            <Button
              onClick={() => updateJobStatus('IN_TRANSIT')}
              disabled={isUpdatingStatus}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Start Delivery
            </Button>
          )}

          {job.status === 'IN_TRANSIT' && (
            <Button
              onClick={() => updateJobStatus('DELIVERED')}
              disabled={isUpdatingStatus}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Mark as Delivered
            </Button>
          )}

          {job.status === 'DELIVERED' && (
            <Card className="bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold">Order Delivered!</p>
                <p className="text-sm text-muted-foreground mt-1">Great job! Waiting for customer review.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
