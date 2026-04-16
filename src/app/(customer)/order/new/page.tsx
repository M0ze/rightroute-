// src/app/(customer)/order/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Map } from '@/components/customer/Map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { MapPin, Package, DollarSign, ArrowRight } from 'lucide-react';

// Validation schema for order placement
// Ensures all required fields are present and valid before submission
const orderSchema = z.object({
  pickupAddress: z.string().min(3, 'Pickup address is required'),
  dropoffAddress: z.string().min(3, 'Dropoff address is required'),
  packageType: z.string().min(2, 'Package type is required'),
  packageWeight: z.number().min(0.1, 'Package weight must be at least 0.1 kg'),
  notes: z.string().optional(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// New order placement page with step-by-step form and interactive map
// Customer can select pickup and dropoff locations, enter package details,
// and receive a real-time fare estimate before confirming the order
// Mobile-first, optimized for low-bandwidth Uganda networks

export default function NewOrderPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Locations, Step 2: Package Details, Step 3: Review
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pickupAddress: '',
      dropoffAddress: '',
      packageType: 'Documents',
      packageWeight: 1,
      notes: '',
      pickupLat: 0.6117, // Default to Mubende
      pickupLng: 31.3617,
      dropoffLat: 0.6117,
      dropoffLng: 31.3617,
    },
  });

  // Handle map clicks to set location coordinates
  const handleMapClick = (lat: number, lng: number, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      form.setValue('pickupLat', lat);
      form.setValue('pickupLng', lng);
    } else {
      form.setValue('dropoffLat', lat);
      form.setValue('dropoffLng', lng);
    }
  };

  // Calculate fare estimate based on distance, weight, and time of day
  const calculateFare = async (values: OrderFormValues) => {
    setIsCalculatingFare(true);
    try {
      const response = await fetch('/api/orders/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: values.pickupLat,
          pickupLng: values.pickupLng,
          dropoffLat: values.dropoffLat,
          dropoffLng: values.dropoffLng,
          packageWeight: values.packageWeight,
        }),
      });

      if (!response.ok) throw new Error('Failed to calculate fare');
      const data = await response.json();
      setEstimatedFare(data.estimatedFare);
      toast.success('Fare estimated!');
    } catch (error) {
      toast.error('Could not estimate fare. Please try again.');
      console.error('Fare calculation error:', error);
    } finally {
      setIsCalculatingFare(false);
    }
  };

  // Handle form submission and create order
  const onSubmit = async (values: OrderFormValues) => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          customerId: user.id,
          estimatedFare,
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');
      const data = await response.json();
      toast.success('Order placed successfully!');
      router.push(`/customer/order/${data.orderId}`); // Redirect to order tracking
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order. Please try again.');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const { pickupLat, pickupLng, dropoffLat, dropoffLng, packageWeight, packageType } =
    form.getValues();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">New Delivery Order</h1>
        <p className="text-muted-foreground mb-6">
          Step {step} of 3
        </p>

        {/* Step 1: Select Locations */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Pickup & Dropoff Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Click on the map to select your pickup and dropoff locations, or enter addresses below.
              </p>

              {/* Map for location selection */}
              <div className="rounded-lg border">
                <Map
                  pickupLat={pickupLat}
                  pickupLng={pickupLng}
                  dropoffLat={dropoffLat}
                  dropoffLng={dropoffLng}
                  onMapClick={(lat, lng) => {
                    // Toggle between pickup and dropoff with each click
                    // First click sets pickup, second sets dropoff
                    const pickupSet = pickupLat !== 0.6117 || pickupLng !== 31.3617;
                    const dropoffSet = dropoffLat !== 0.6117 || dropoffLng !== 31.3617;
                    if (!pickupSet) {
                      handleMapClick(lat, lng, 'pickup');
                    } else if (!dropoffSet) {
                      handleMapClick(lat, lng, 'dropoff');
                    } else {
                      // Both are set, toggle between them
                      handleMapClick(lat, lng, 'dropoff');
                    }
                  }}
                  interactive={true}
                  className="w-full h-96"
                />
              </div>

              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pickupAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 123 Main Street, Mubende" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dropoffAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropoff Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 456 Delivery Street, Mubende" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!form.getValues('pickupAddress') || !form.getValues('dropoffAddress')}
                      className="flex-1"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Package Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    calculateFare(values);
                    setStep(3);
                  })}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="Documents">Documents</option>
                            <option value="Food">Food & Groceries</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing & Textiles</option>
                            <option value="Medicine">Medicine & Pharmacy</option>
                            <option value="Produce">Agricultural Produce</option>
                            <option value="Fuel">Fuel & Liquids</option>
                            <option value="Other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="e.g., 2.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="e.g., Fragile, Handle with care, Call before delivery, etc."
                            className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isCalculatingFare} className="flex-1">
                      {isCalculatingFare ? 'Calculating...' : 'Review & Confirm'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Review Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Map preview */}
              <div className="rounded-lg border">
                <Map
                  pickupLat={pickupLat}
                  pickupLng={pickupLng}
                  dropoffLat={dropoffLat}
                  dropoffLng={dropoffLng}
                  className="w-full h-64"
                  interactive={false}
                />
              </div>

              {/* Order summary */}
              <div className="space-y-4 bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-semibold">{form.getValues('pickupAddress')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-semibold">{form.getValues('dropoffAddress')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-semibold">
                    {packageType} ({packageWeight} kg)
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg">
                  <span className="font-semibold">Estimated Fare:</span>
                  <span className="font-bold text-green-600">
                    UGX {estimatedFare?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => form.handleSubmit(onSubmit)()}
                  disabled={isSubmitting || !estimatedFare}
                  className="flex-1"
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
