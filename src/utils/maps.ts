const PRESET_ROUTES: Record<string, number> = {
  'coimbatore airport|rathinam grand hall': 22.5,
  'rathinam grand hall|coimbatore airport': 22.5,
  'coimbatore airport|pondy': 380.0,
  'pondy|coimbatore airport': 380.0,
  'coimbatore airport|pondicherry': 380.0,
  'pondicherry|coimbatore airport': 380.0,
  'coimbatore railway station|rathinam grand hall': 12.5,
  'rathinam grand hall|coimbatore railway station': 12.5,
  'coimbatore airport|ooty': 95.0,
  'ooty|coimbatore airport': 95.0,
  'coimbatore airport|gandhipuram': 11.5,
  'gandhipuram|coimbatore airport': 11.5,
  'coimbatore airport|ghandipuram': 11.5,
  'ghandipuram|coimbatore airport': 11.5,
};

/**
 * Normalizes input location names to look for predefined route combinations.
 * Supports bidirectional matching and fuzzy substring lookup.
 */
export function getPresetDistance(pickup: string, drop: string): number | null {
  const normPickup = pickup.toLowerCase().trim().replace(/\s+/g, ' ');
  const normDrop = drop.toLowerCase().trim().replace(/\s+/g, ' ');
  
  if (!normPickup || !normDrop) return null;

  // 1. Try exact lookup in both directions
  const key1 = `${normPickup}|${normDrop}`;
  if (PRESET_ROUTES[key1] !== undefined) {
    return PRESET_ROUTES[key1];
  }
  const key2 = `${normDrop}|${normPickup}`;
  if (PRESET_ROUTES[key2] !== undefined) {
    return PRESET_ROUTES[key2];
  }
  
  // 2. Try fuzzy matching (sub-strings) in both directions
  for (const presetKey of Object.keys(PRESET_ROUTES)) {
    const [p, d] = presetKey.split('|');
    
    // Check direction 1: pickup matches p, drop matches d
    const match1 = 
      (normPickup.includes(p) || p.includes(normPickup)) &&
      (normDrop.includes(d) || d.includes(normDrop));

    // Check direction 2: pickup matches d, drop matches p
    const match2 = 
      (normPickup.includes(d) || d.includes(normPickup)) &&
      (normDrop.includes(p) || p.includes(normDrop));

    if (match1 || match2) {
      return PRESET_ROUTES[presetKey];
    }
  }
  
  return null;
}

/**
 * Calculates road driving distance dynamically between two string locations.
 * Routes the API call through the Express backend to set proper headers
 * required by the OpenStreetMap Nominatim API.
 */
export async function calculateRouteDistance(pickup: string, drop: string): Promise<number | null> {
  // 1. Check presets first (instant offline lookup)
  const preset = getPresetDistance(pickup, drop);
  if (preset !== null) {
    return preset;
  }

  // 2. Call backend proxy which handles Nominatim + OSRM with proper User-Agent
  try {
    const url = `/api/distance?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json() as { success: boolean; distanceKm?: number };
    if (data.success && data.distanceKm !== undefined) {
      return data.distanceKm;
    }
  } catch (err) {
    console.error('Error fetching route distance from backend:', err);
  }

  return null;
}
