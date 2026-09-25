"use client";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NeighborhoodInfo {
  neighborhood: string;
  confidence: number;
}

const LUANDA_NEIGHBORHOODS = [
  "Viana", "Cacuaco", "Cazenga", "Palanca", "Sambizanga", "Rangel",
  "Hoji-ya-Henda", "Camama", "Kilamba", "Talatona", "Benfica",
  "Zango", "Panguila", "Maianga", "Samba", "Belas"
];

// Bounding box aproximado de Luanda
const LUANDA_BOUNDS = {
  north: -8.7,
  south: -9.2,
  east: 13.4,
  west: 13.0
};

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Erro de geolocalização: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 min cache
      }
    );
  });
}

export function isInLuanda(lat: number, lng: number): boolean {
  return (
    lat <= LUANDA_BOUNDS.north &&
    lat >= LUANDA_BOUNDS.south &&
    lng <= LUANDA_BOUNDS.east &&
    lng >= LUANDA_BOUNDS.west
  );
}

// Cálculo de distância de Haversine
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Bairros conhecidos com coordenadas aproximadas (centroides)
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "Viana": { lat: -8.95, lng: 13.35 },
  "Cacuaco": { lat: -8.85, lng: 13.30 },
  "Cazenga": { lat: -8.82, lng: 13.25 },
  "Palanca": { lat: -8.88, lng: 13.23 },
  "Sambizanga": { lat: -8.83, lng: 13.22 },
  "Rangel": { lat: -8.84, lng: 13.20 },
  "Hoji-ya-Henda": { lat: -8.86, lng: 13.24 },
  "Camama": { lat: -8.90, lng: 13.28 },
  "Kilamba": { lat: -8.95, lng: 13.30 },
  "Talatona": { lat: -8.92, lng: 13.27 },
  "Benfica": { lat: -8.87, lng: 13.21 },
  "Zango": { lat: -8.98, lng: 13.33 },
  "Panguila": { lat: -8.93, lng: 13.32 },
  "Maianga": { lat: -8.81, lng: 13.19 },
  "Samba": { lat: -8.80, lng: 13.18 },
  "Belas": { lat: -8.97, lng: 13.26 }
};

export function detectNeighborhood(lat: number, lng: number): NeighborhoodInfo {
  if (!isInLuanda(lat, lng)) {
    return { neighborhood: "Viana", confidence: 0 }; // Default
  }

  let closest = "Viana";
  let minDistance = Infinity;

  for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    const dist = haversineDistance(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }

  // Confiança baseada na distância (menor distância = maior confiança)
  const confidence = Math.max(0, Math.min(1, 1 - minDistance / 10));

  return { neighborhood: closest, confidence };
}

export async function getCurrentNeighborhood(): Promise<NeighborhoodInfo> {
  try {
    const coords = await getCurrentPosition();
    return detectNeighborhood(coords.latitude, coords.longitude);
  } catch {
    return { neighborhood: "Viana", confidence: 0 };
  }
}

// Hook React para geolocalização
import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [neighborhood, setNeighborhood] = useState<NeighborhoodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentNeighborhood();
      setNeighborhood(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao detectar localização");
      setNeighborhood({ neighborhood: "Viana", confidence: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return { neighborhood, loading, error, refresh: detect };
}