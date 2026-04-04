// src/components/customer/Map.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons for Leaflet
// Default Leaflet icons require these workarounds due to webpack bundling issues
const MARKER_ICON = L.divIcon({
  html: `
    <div style="
      background-color: #3b82f6;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      📍
    </div>
  `,
  iconSize: [32, 32],
  className: 'custom-marker',
});

const DRIVER_MARKER = L.divIcon({
  html: `
    <div style="
      background-color: #10b981;
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      🚗
    </div>
  `,
  iconSize: [40, 40],
  className: 'driver-marker',
});

interface MapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  driverLat?: number;
  driverLng?: number;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  interactive?: boolean; // Allow clicking on map
}

// Leaflet + OpenStreetMap map component
// Optimized for mobile-first viewing and low-bandwidth networks
// Shows pickup, dropoff, and driver locations with custom markers
// Mubende District, Uganda is the default center
export const Map: React.FC<MapProps> = ({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  driverLat,
  driverLng,
  onMapClick,
  className = 'w-full h-96',
  interactive = false,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const pickupMarker = useRef<L.Marker | null>(null);
  const dropoffMarker = useRef<L.Marker | null>(null);
  const driverMarker = useRef<L.Marker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map on component mount
  // Default center: Mubende District, Uganda (approximate center)
  useEffect(() => {
    if (!mapContainer.current || isInitialized) return;

    const MUBENDE_LAT = 0.6117;
    const MUBENDE_LNG = 31.3617;
    const DEFAULT_ZOOM = 13; // Zoom level suitable for a district

    map.current = L.map(mapContainer.current).setView([MUBENDE_LAT, MUBENDE_LNG], DEFAULT_ZOOM);

    // Use OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    setIsInitialized(true);

    // Handle map clicks for location selection
    if (interactive && onMapClick) {
      map.current.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isInitialized, interactive, onMapClick]);

  // Update pickup marker when coordinates change
  useEffect(() => {
    if (!map.current || !isInitialized) return;

    if (pickupMarker.current) {
      map.current.removeLayer(pickupMarker.current);
    }

    if (pickupLat !== undefined && pickupLng !== undefined) {
      pickupMarker.current = L.marker([pickupLat, pickupLng], {
        icon: MARKER_ICON,
        title: 'Pickup Location',
      })
        .bindPopup('📍 Pickup Location')
        .addTo(map.current);

      // Pan map to pickup location if it's the first location set
      if (!dropoffLat || !dropoffLng) {
        map.current.setView([pickupLat, pickupLng], 15);
      }
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, isInitialized]);

  // Update dropoff marker when coordinates change
  useEffect(() => {
    if (!map.current || !isInitialized) return;

    if (dropoffMarker.current) {
      map.current.removeLayer(dropoffMarker.current);
    }

    if (dropoffLat !== undefined && dropoffLng !== undefined) {
      dropoffMarker.current = L.marker([dropoffLat, dropoffLng], {
        icon: MARKER_ICON,
        title: 'Dropoff Location',
      })
        .bindPopup('📍 Dropoff Location')
        .addTo(map.current);

      // Fit map to both pickup and dropoff if both exist
      if (pickupLat !== undefined && pickupLng !== undefined) {
        const bounds = L.latLngBounds([
          [pickupLat, pickupLng],
          [dropoffLat, dropoffLng],
        ]);
        map.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.current.setView([dropoffLat, dropoffLng], 15);
      }
    }
  }, [dropoffLat, dropoffLng, pickupLat, pickupLng, isInitialized]);

  // Update driver marker when driver location changes (for live tracking)
  useEffect(() => {
    if (!map.current || !isInitialized) return;

    if (driverMarker.current) {
      map.current.removeLayer(driverMarker.current);
    }

    if (driverLat !== undefined && driverLng !== undefined) {
      driverMarker.current = L.marker([driverLat, driverLng], {
        icon: DRIVER_MARKER,
        title: 'Driver Location',
      })
        .bindPopup('🚗 Driver Location')
        .addTo(map.current);
    }
  }, [driverLat, driverLng, isInitialized]);

  return <div ref={mapContainer} className={className} />;
};
