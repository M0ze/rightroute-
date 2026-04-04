// src/app/api/orders/estimate-fare/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple fare calculation algorithm for Mubende District, Uganda
// Fare = Base Rate + (Distance * Rate Per KM) + (Weight * Rate Per KG) + Surge Multiplier
// Optimized for realistic pricing in Uganda's economic context

const PRICING_CONFIG = {
  baseRate: 2000, // UGX 2000 base fare
  ratePerKm: 500, // UGX 500 per kilometer
  ratePerKg: 300, // UGX 300 per kilogram
  surgeMultiplier: 1.0, // 1.0 during normal hours, 1.5 during peak hours (7-9 AM, 5-7 PM)
  minFare: 3000, // Minimum fare to ensure driver profitability
};

// Haversine formula to calculate distance between two lat/lng points
// Used to estimate delivery distance for fare calculation
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

// Determine surge multiplier based on time of day
// Peak hours: 7-9 AM (breakfast rush) and 5-7 PM (evening rush) = 1.5x multiplier
function getSurgeMultiplier(): number {
  const hour = new Date().getHours();
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.5;
  }
  return 1.0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, packageWeight } = body;

    // Validate input
    if (
      pickupLat === undefined ||
      pickupLng === undefined ||
      dropoffLat === undefined ||
      dropoffLng === undefined ||
      packageWeight === undefined
    ) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Calculate distance
    const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);

    // Calculate fare components
    const distanceFare = distanceKm * PRICING_CONFIG.ratePerKm;
    const weightFare = packageWeight * PRICING_CONFIG.ratePerKg;
    const surge = getSurgeMultiplier();

    // Total fare calculation
    let estimatedFare =
      (PRICING_CONFIG.baseRate + distanceFare + weightFare) * surge;

    // Apply minimum fare to ensure driver profitability
    if (estimatedFare < PRICING_CONFIG.minFare) {
      estimatedFare = PRICING_CONFIG.minFare;
    }

    // Round to nearest 500 UGX for simplicity (standard currency rounding in Uganda)
    estimatedFare = Math.ceil(estimatedFare / 500) * 500;

    return NextResponse.json(
      {
        estimatedFare: Math.round(estimatedFare),
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        surge: surge,
        breakdown: {
          baseRate: PRICING_CONFIG.baseRate,
          distanceFare: Math.round(distanceFare),
          weightFare: Math.round(weightFare),
          surgeMultiplier: surge,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/orders/estimate-fare error:', error);
    return NextResponse.json({ error: 'Failed to estimate fare' }, { status: 500 });
  }
}
