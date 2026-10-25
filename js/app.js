/**
 * ==========================================================================
 * ACCESSWAY SG - MAIN APPLICATION ORCHESTRATOR (js/app.js)
 * ==========================================================================
 * 
 * Main ES module entry point that initializes services, registers global DOM 
 * event listeners, coordinates the route planning pipeline, and launches 
 * the app lifecycle on DOMContentLoaded.
 */

// 1. Module Imports
import { initMapEngine, renderRoutePolylines, renderFacilityGeoJSON, clearRouteLayers } from './map-service.js';
import { geocodePlaceQuery, fetchAccessibleRoute, fetchFacilitiesGeoJSON } from './api-services.js';
import { screenAndClassifyRoute } from './route-service.js';
import { getAllBarrierReports, getUserPreferences, saveUserPreferences, pushSearchHistory } from './report-store.js';
import { renderRouteResults, showRouteLoadingSkeleton, displayFormFeedback, setupMobileSheetSync } from './ui-controller.js';
import { initBarrierController } from './barrier-controller.js';

// Cache GeoJSON data in memory to avoid redundant network requests
let cachedFacilitiesGeoJSON = null;

/* ==========================================================================
   2. APP LIFECYCLE INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[AccessWay SG] Initializing Application Core System...');

  try {
    // Step A: Initialize Leaflet Map Engine
    initMapEngine('map-container');

    // Step B: Initialize Barrier Controller & Modal Listeners
    initBarrierController();

    // Step C: Setup Mobile Bottom-Sheet Interactions
    setupMobileSheetSync();

    // Step D: Load User Preferences into UI Controls
    loadSavedUserPreferences();

    // Step E: Fetch Accessible Facilities & Render Default Overlay
    await loadAndRenderFacilitiesOverlay();

    // Step F: Register Main Form & UI Event Listeners
    registerGlobalEventListeners();

    console.log('[AccessWay SG] System Initialization Complete. Active & Ready.');
  } catch (error) {
    console.error('[AccessWay SG] Critical Error during application startup:', error);
    displayFormFeedback('Failed to initialize application mapping services. Please reload.', 'danger', 'route-form-feedback');
  }
});

/* ==========================================================================
   3. ROUTE PLANNING PIPELINE
   ========================================================================== */

/**
 * Coordinates geocoding, routing calculation, screening, and UI rendering.
 * @param {Event} event Form submission event.
 */
async function handleRouteSearch(event) {
  if (event) event.preventDefault();

  const startInput = document.getElementById('input-start-location');
  const destInput = document.getElementById('input-dest-location');

  const startQuery = startInput ? startInput.value.trim() : '';
  const destQuery = destInput ? destInput.value.trim() : '';

  // Clear previous inline errors
  displayFormFeedback('', 'danger', 'route-form-feedback');

  // Input Validation
  if (!startQuery || !destQuery) {
    displayFormFeedback('Please enter both a starting location and destination.', 'danger', 'route-form-feedback');
    return;
  }

  // Display Animated Skeleton Placeholders
  showRouteLoadingSkeleton();

  try {
    // 1. Geocode Start & Destination Queries
    const [startCoords, destCoords] = await Promise.all([
      geocodePlaceQuery(startQuery),
      geocodePlaceQuery(destQuery)
    ]);

    if (!startCoords) {
      displayFormFeedback(`Could not locate "${startQuery}". Please check the spelling or try a landmark like "Dhoby Ghaut MRT".`, 'danger', 'route-form-feedback');
      renderRouteResults(null);
      return;
    }

    if (!destCoords) {
      displayFormFeedback(`Could not locate "${destQuery}". Please check the spelling or try a landmark like "Plaza Singapura".`, 'danger', 'route-form-feedback');
      renderRouteResults(null);
      return;
    }

    // 2. Fetch Accessible Route Data
    const preferences = getUserPreferences();
    const rawRoute = await fetchAccessibleRoute(startCoords, destCoords, preferences);

    // 3. Screen Route Geometry & Step Instructions Against Community Hazards
    const activeBarriers = getAllBarrierReports();
    const classifiedRoute = screenAndClassifyRoute(rawRoute, activeBarriers, preferences);

    // 4. Render Spatial Polylines and DOM Instruction Cards
    renderRoutePolylines(classifiedRoute);
    renderRouteResults(classifiedRoute);

    // 5. Save Query Pair to Local Recent History
    pushSearchHistory(startQuery, destQuery);

  } catch (error) {
    console.error('[AccessWay SG] Route execution error:', error);
    displayFormFeedback('Unable to compute route at this time. Please check your network connection.', 'danger', 'route-form-feedback');
    renderRouteResults(null);
  }
}

/* ==========================================================================
   4. EVENT LISTENERS & USER CONTROLS
   ========================================================================== */

function registerGlobalEventListeners() {
  // Main Navigation Form Submission
  const routeForm = document.getElementById('route-planner-form');
  if (routeForm) {
    routeForm.addEventListener('submit', handleRouteSearch);
  }

  // Swap Location Input Values
  const btnSwap = document.getElementById('btn-swap-locations');
  if (btnSwap) {
    btnSwap.addEventListener('click', () => {
      const startInput = document.getElementById('input-start-location');
      const destInput = document.getElementById('input-dest-location');

      if (startInput && destInput) {
        const temp = startInput.value;
        startInput.value = destInput.value;
        destInput.value = temp;
      }
    });
  }

  // Current GPS Geolocation Trigger
  const btnGPS = document.getElementById('btn-use-gps');
  if (btnGPS) {
    btnGPS.addEventListener('click', handleGPSCurrentLocation);
  }

  // Preference Form Controls (Save on Change)
  const prefForm = document.getElementById('preferences-form');
  if (prefForm) {
    prefForm.addEventListener('change', handlePreferenceChange);
  }

  // Facility Filter Checkboxes
  const facilityFilterContainer = document.getElementById('facility-filter-group');
  if (facilityFilterContainer) {
    facilityFilterContainer.addEventListener('change', applyFacilityFilters);
  }
}

/**
 * Geolocates user position and populates the start location input.
 */
function handleGPSCurrentLocation() {
  const startInput = document.getElementById('input-start-location');
  if (!navigator.geolocation) {
    displayFormFeedback('Geolocation is not supported by your browser.', 'warning', 'route-form-feedback');
    return;
  }

  if (startInput) startInput.value = 'Locating...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (startInput) startInput.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    },
    (error) => {
      console.warn('[AccessWay SG] Geolocation denied or unavailable:', error.message);
      if (startInput) startInput.value = '';
      displayFormFeedback('Unable to retrieve your current location. Please type a location manually.', 'warning', 'route-form-feedback');
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

/**
 * Synchronizes mobility preference updates with LocalStorage.
 */
function handlePreferenceChange() {
  const chairTypeEl = document.getElementById('pref-chair-type');
  const avoidSlopesEl = document.getElementById('pref-avoid-slopes');

  const updatedPrefs = {
    chairType: chairTypeEl ? chairTypeEl.value : 'manual',
    avoidSlopes: avoidSlopesEl ? avoidSlopesEl.checked : true
  };

  saveUserPreferences(updatedPrefs);
}

/**
 * Loads saved user preferences into input controls on startup.
 */
function loadSavedUserPreferences() {
  const prefs = getUserPreferences();
  const chairTypeEl = document.getElementById('pref-chair-type');
  const avoidSlopesEl = document.getElementById('pref-avoid-slopes');

  if (chairTypeEl) chairTypeEl.value = prefs.chairType || 'manual';
  if (avoidSlopesEl) avoidSlopesEl.checked = prefs.avoidSlopes ?? true;
}

/**
 * Ingests GeoJSON facility data and renders markers based on checked filters.
 */
async function loadAndRenderFacilitiesOverlay() {
  if (!cachedFacilitiesGeoJSON) {
    cachedFacilitiesGeoJSON = await fetchFacilitiesGeoJSON();
  }
  applyFacilityFilters();
}

/**
 * Filters facility clusters based on checked category chips.
 */
function applyFacilityFilters() {
  if (!cachedFacilitiesGeoJSON) return;

  const checkedFilters = Array.from(
    document.querySelectorAll('.facility-filter-chip:checked')
  ).map(cb => cb.value);

  renderFacilityGeoJSON(cachedFacilitiesGeoJSON, checkedFilters);
}