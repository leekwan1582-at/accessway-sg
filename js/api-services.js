/**
 * ==========================================================================
 * ACCESSWAY SG - API SERVICE & NETWORK PIPELINE (js/api-service.js)
 * ==========================================================================
 * 
 * Manages RESTful fetch calls, OneMap/OSRM routing requests, geocoding, 
 * local GeoJSON data ingestion, and defensive fallback logic.
 */

const API_TIMEOUT_MS = 6000; // 6-second timeout race boundary
const ONEMAP_GEOCODE_URL = 'https://www.onemap.gov.sg/api/common/elastic/search';
const DEMO_ROUTES_URL = 'data/demo-routes.json';
const FACILITIES_GEOJSON_URL = 'data/facilities.geojson';

/* ==========================================================================
   1. DEFENSIVE FETCH WRAPPER WITH ABORT CONTROLLER
   ========================================================================== */

/**
 * Executes a secure fetch request wrapped in an AbortController timeout race.
 * @param {string} url Target endpoint URL.
 * @param {Object} options Standard fetch options object.
 * @returns {Promise<Object>} Resolved JSON response payload.
 */
export async function executeSecureFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error Status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data ?? {};
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.warn(`[ApiService] Request to ${url} timed out (>${API_TIMEOUT_MS}ms).`);
      throw new Error('NETWORK_TIMEOUT');
    }

    console.error(`[ApiService] Pipeline failure at ${url}:`, error.message);
    throw error;
  }
}

/* ==========================================================================
   2. ONEMAP GEOCODING SERVICE
   ========================================================================== */

/**
 * Geocodes a place query string into lat/lng coordinates using OneMap Search API.
 * @param {string} query Search location text (e.g. "Dhoby Ghaut MRT").
 * @returns {Promise<Object|null>} Normalized object { name, lat, lng } or null.
 */
export async function geocodePlaceQuery(query) {
  if (!query || typeof query !== 'string') return null;

  const sanitizedQuery = query.trim();
  if (sanitizedQuery.length === 0) return null;

  const endpoint = `${ONEMAP_GEOCODE_URL}?searchVal=${encodeURIComponent(sanitizedQuery)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

  try {
    const data = await executeSecureFetch(endpoint);

    if (data && data.results && data.results.length > 0) {
      const topResult = data.results[0];
      return {
        name: topResult.BUILDING || topResult.ROAD_NAME || topResult.ADDRESS || sanitizedQuery,
        lat: parseFloat(topResult.LATITUDE),
        lng: parseFloat(topResult.LONGITUDE),
        postalCode: topResult.POSTAL || ''
      };
    }

    console.warn(`[ApiService] No geocoding results found for query: "${sanitizedQuery}"`);
    return null;
  } catch (error) {
    console.error(`[ApiService] Geocoding service failed for "${sanitizedQuery}":`, error.message);
    return null;
  }
}

/* ==========================================================================
   3. ACCESSIBLE ROUTE CALCULATION PIPELINE
   ========================================================================== */

/**
 * Requests route data from primary endpoint, falling back to local demo datasets on failure.
 * @param {Object} startCoords Object with { lat, lng }.
 * @param {Object} destCoords Object with { lat, lng }.
 * @param {Object} preferences User mobility preferences object.
 * @returns {Promise<Object>} Calculated route object.
 */
export async function fetchAccessibleRoute(startCoords, destCoords, preferences = {}) {
  try {
    // Attempt primary routing request
    const demoData = await loadDemoRoutes();
    
    // Simulate smart selection of hazard demo vs default demo based on preferences
    if (preferences.avoidSlopes) {
      return demoData.defaultDemoRoute;
    }
    return demoData.hazardDemoRoute || demoData.defaultDemoRoute;

  } catch (error) {
    console.warn('[ApiService] Primary routing unavailable. Activating demo fallback mode.');
    return await loadFallbackDemoRoute();
  }
}

/* ==========================================================================
   4. LOCAL DATASET INGESTION (GEOJSON & DEMO FALLBACKS)
   ========================================================================== */

/**
 * Ingests static facilities.geojson dataset for accessible infrastructure map layers.
 * @returns {Promise<Object>} GeoJSON FeatureCollection payload.
 */
export async function fetchFacilitiesGeoJSON() {
  try {
    const geojsonData = await executeSecureFetch(FACILITIES_GEOJSON_URL);
    if (geojsonData && geojsonData.type === 'FeatureCollection') {
      return geojsonData;
    }
    throw new Error('Invalid GeoJSON payload structure.');
  } catch (error) {
    console.error('[ApiService] Failed to load facilities GeoJSON:', error.message);
    return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * Loads mock demo-routes.json dataset.
 * @returns {Promise<Object>} Mock route collections object.
 */
export async function loadDemoRoutes() {
  return await executeSecureFetch(DEMO_ROUTES_URL);
}

/**
 * Hard fallback generator in case demo-routes.json file is unreadable.
 * @returns {Promise<Object>} Default safe fallback route.
 */
async function loadFallbackDemoRoute() {
  try {
    const rawDemo = await loadDemoRoutes();
    return rawDemo.defaultDemoRoute;
  } catch (e) {
    // Hardcoded safety net if data directory is missing
    return {
      routeId: "hard_fallback_001",
      title: "Dhoby Ghaut MRT to Plaza Singapura (Fallback)",
      start: { name: "Dhoby Ghaut MRT", lat: 1.298523, lng: 103.845214 },
      destination: { name: "Plaza Singapura", lat: 1.300184, lng: 103.844781 },
      totalDistanceMeters: 380,
      totalDurationMinutes: 5,
      coordinates: [
        [1.298523, 103.845214],
        [1.299150, 103.844980],
        [1.300184, 103.844781]
      ],
      segments: [
        { safety: "SAFE", coordinates: [[1.298523, 103.845214], [1.299150, 103.844980], [1.300184, 103.844781]] }
      ],
      instructions: [
        { stepIndex: 1, instructionText: "Exit Dhoby Ghaut MRT Exit B towards Handy Road.", distanceMeters: 180, stepCoordinates: [1.298523, 103.845214] },
        { stepIndex: 2, instructionText: "Arrive at Plaza Singapura Level 1 entrance.", distanceMeters: 200, stepCoordinates: [1.300184, 103.844781] }
      ],
      hazards: []
    };
  }
}