/**
 * ==========================================================================
 * ACCESSWAY SG - ROUTE & HAZARD SCREENING SERVICE (js/route-service.js)
 * ==========================================================================
 * 
 * Processes route geometry, parses step-by-step instructions, screens 
 * path segments against physical hazards (steps, steep gradients, barriers),
 * and classifies outcomes into 3 explicit states.
 */

/* ==========================================================================
   1. ACCESSIBILITY ROUTE SCREENING & OUTCOME CLASSIFICATION
   ========================================================================== */

/**
 * Screens route instructions and spatial polyline segments against user 
 * preferences and active community barrier reports.
 * 
 * @param {Object} rawRoute Data object from api-service.
 * @param {Array<Object>} activeBarriers Persisted barrier reports array.
 * @param {Object} preferences User mobility preferences object.
 * @returns {Object} Classified route result object.
 */
export function screenAndClassifyRoute(rawRoute, activeBarriers = [], preferences = {}) {
  if (!rawRoute) {
    return {
      outcomeState: 'UNUSABLE_SERVICE_FAILURE',
      hazards: [],
      segments: [],
      instructions: [],
      summary: { distanceMeters: 0, durationMinutes: 0, safetyRating: 'Unavailable' }
    };
  }

  const detectedHazards = [];
  const processedSegments = [];
  const processedInstructions = [];

  const avoidSlopes = preferences.avoidSlopes ?? true;
  const chairType = preferences.chairType || 'manual';

  // 1. Screen Turn-by-Turn Instructions
  if (Array.isArray(rawRoute.instructions)) {
    rawRoute.instructions.forEach((step, idx) => {
      let stepWarning = step.warningType || null;
      let stepText = String(step.instructionText || '').trim();

      // Rule A: Physical Steps / Escalators Detection
      if (/step|stair|escalator|flight/i.test(stepText)) {
        stepWarning = 'PHYSICAL_STEPS';
        detectedHazards.push({
          stepIndex: idx + 1,
          type: 'PHYSICAL_STEPS',
          title: 'Stairs / Escalator Detected',
          text: stepText,
          coordinates: step.stepCoordinates
        });
      }

      // Rule B: Steep Incline / Gradient Screening
      if (/steep|incline|gradient|slope/i.test(stepText) && avoidSlopes) {
        stepWarning = 'STEEP_INCLINE';
        detectedHazards.push({
          stepIndex: idx + 1,
          type: 'STEEP_INCLINE',
          title: 'Steep Gradient (>8% Slope)',
          text: stepText,
          coordinates: step.stepCoordinates
        });
      }

      processedInstructions.push({
        ...step,
        stepIndex: idx + 1,
        warningType: stepWarning
      });
    });
  }

  // 2. Screen Spatial Segments Against Active Community Barrier Reports
  if (Array.isArray(rawRoute.segments)) {
    rawRoute.segments.forEach(segment => {
      let segmentSafety = segment.safety || 'SAFE';

      // Check proximity of segment coordinates to active community hazard reports
      if (Array.isArray(activeBarriers) && activeBarriers.length > 0) {
        const hasNearbyBarrier = activeBarriers.some(barrier => {
          return segment.coordinates.some(coord => {
            return calculateHaversineDistance(coord[0], coord[1], barrier.lat, barrier.lng) < 30; // 30m radius
          });
        });

        if (hasNearbyBarrier) {
          segmentSafety = 'DANGER';
          detectedHazards.push({
            type: 'COMMUNITY_BARRIER',
            title: 'Reported Path Blockage',
            text: 'An active community barrier report overlaps this segment.'
          });
        }
      }

      processedSegments.push({
        ...segment,
        safety: segmentSafety
      });
    });
  }

  // 3. Classify Overall Outcome Branching State
  let outcomeState = 'RECOMMENDED_ACCESSIBLE'; // Outcome State A

  const hasPhysicalSteps = detectedHazards.some(h => h.type === 'PHYSICAL_STEPS');
  const hasBlockage = detectedHazards.some(h => h.type === 'COMMUNITY_BARRIER');

  if (hasPhysicalSteps || (hasBlockage && chairType === 'manual')) {
    outcomeState = 'ROUTE_WITH_WARNINGS'; // Outcome State B
  } else if (detectedHazards.length > 0) {
    outcomeState = 'ROUTE_WITH_WARNINGS'; // Outcome State B
  }

  return {
    outcomeState,
    routeId: rawRoute.routeId || `route_${Date.now()}`,
    title: rawRoute.title || 'Accessible Route',
    start: rawRoute.start,
    destination: rawRoute.destination,
    coordinates: rawRoute.coordinates || [],
    segments: processedSegments.length > 0 ? processedSegments : [{ safety: 'SAFE', coordinates: rawRoute.coordinates || [] }],
    instructions: processedInstructions,
    hazards: detectedHazards,
    summary: {
      distanceMeters: rawRoute.totalDistanceMeters || 0,
      durationMinutes: rawRoute.totalDurationMinutes || 0,
      safetyRating: detectedHazards.length === 0 ? 'High (100% Barrier Free)' : 'Caution Required',
      hazardCount: detectedHazards.length
    }
  };
}

/* ==========================================================================
   2. SPATIAL GEOMETRY & DISTANCE UTILITIES
   ========================================================================== */

/**
 * Calculates straight-line Haversine distance between two lat/lng points in meters.
 * @param {number} lat1 Latitude 1.
 * @param {number} lon1 Longitude 1.
 * @param {number} lat2 Latitude 2.
 * @param {number} lon2 Longitude 2.
 * @returns {number} Distance in meters.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}