/**
 * ==========================================================================
 * ACCESSWAY SG - SPATIAL LEAFLET MAP SERVICE (js/map-service.js)
 * ==========================================================================
 * 
 * Manages the Leaflet map instance, tile layers, polyline rendering, 
 * marker cluster groups for facilities, and community hazard pins.
 */


let map = null;
let routeLayerGroup = null;
let facilityClusterGroup = null;
let barrierLayerGroup = null;

// Singapore Centroid & Geographic Bounds
const SINGAPORE_CENTROID = [1.290270, 103.851959];
const SINGAPORE_BOUNDS = L.latLngBounds(
  L.latLng(1.150000, 103.550000),
  L.latLng(1.470000, 104.100000)
);

/* ==========================================================================
   1. MAP ENGINE INITIALIZATION
   ========================================================================== */

/**
 * Initializes the Leaflet map canvas and layer groups.
 * @param {string} containerId DOM element ID for map mount point.
 * @returns {Object} Leaflet map instance.
 */
export function initMapEngine(containerId = 'map-container') {
  if (map !== null) return map;

  // Instantiate Leaflet Map with Singapore Constrained Viewport
  map = L.map(containerId, {
    center: SINGAPORE_CENTROID,
    zoom: 13,
    minZoom: 11,
    maxZoom: 18,
    maxBounds: SINGAPORE_BOUNDS,
    zoomControl: false
  });

// OPENSTREETMAP TILE LAYER:
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

  // Re-position Zoom Controls to Top-Right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Initialize Isolated Layer Groups to Prevent State Leakage
  routeLayerGroup = L.layerGroup().addTo(map);
  barrierLayerGroup = L.layerGroup().addTo(map);

  // Initialize MarkerCluster Group for Accessible Facilities
  facilityClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    iconCreateFunction: (cluster) => {
      return L.divIcon({
        html: `<div class="accessway-cluster"><span>${cluster.getChildCount()}</span></div>`,
        className: 'custom-cluster-marker',
        iconSize: [40, 40]
      });
    }
  }).addTo(map);

  // Force Viewport Size Invalidation
  setTimeout(() => map.invalidateSize(), 200);
  window.addEventListener('resize', () => map.invalidateSize());

  return map;
}

/**
 * Returns the active Leaflet map instance.
 */
export function getMapInstance() {
  return map;
}

/* ==========================================================================
   2. ROUTE POLYLINE & ENDPOINT RENDERING
   ========================================================================== */

/**
 * Renders safety color-coded polylines and endpoint markers on the map.
 * @param {Object} routeResult Processed route object from route-service.
 */
export function renderRoutePolylines(routeResult) {
  clearRouteLayers();

  if (!routeResult || !Array.isArray(routeResult.segments)) return;

  // 1. Draw Polyline Segments with Safety Color Codes
  routeResult.segments.forEach(segment => {
    let strokeColor = '#1b7a4b'; // Emerald Green (Recommended / Safe)
    if (segment.safety === 'WARNING') strokeColor = '#d97706'; // Amber Warning
    if (segment.safety === 'DANGER')  strokeColor = '#dc2626'; // Hazard Red

    const polyline = L.polyline(segment.coordinates, {
      color: strokeColor,
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    });

    routeLayerGroup.addLayer(polyline);
  });

  // 2. Add Start & Destination Custom Endpoint Pins
  if (routeResult.start && routeResult.start.lat) {
    const startPin = L.marker([routeResult.start.lat, routeResult.start.lng], {
      icon: createEndpointIcon('start', 'Start Point')
    }).bindPopup(`<b>${routeResult.start.name || 'Starting Point'}</b>`);
    routeLayerGroup.addLayer(startPin);
  }

  if (routeResult.destination && routeResult.destination.lat) {
    const destPin = L.marker([routeResult.destination.lat, routeResult.destination.lng], {
      icon: createEndpointIcon('dest', 'Destination')
    }).bindPopup(`<b>${routeResult.destination.name || 'Destination'}</b>`);
    routeLayerGroup.addLayer(destPin);
  }

  // 3. Adjust Viewport Bounds with Mobile Sheet Offset Padding
  const layers = routeLayerGroup.getLayers();
  if (layers.length > 0) {
    const bounds = L.featureGroup(layers).getBounds();
    const isMobile = window.innerWidth < 768;
    
    const paddingOptions = isMobile
      ? { paddingTopLeft: [20, 20], paddingBottomRight: [20, 300] } // Padding for mobile sheet
      : { paddingTopLeft: [50, 50], paddingBottomRight: [50, 50] };

    map.fitBounds(bounds, { ...paddingOptions, maxZoom: 16, animate: true });
  }
}

/**
 * Clears active route polylines and endpoint pins.
 */
export function clearRouteLayers() {
  if (routeLayerGroup) {
    routeLayerGroup.clearLayers();
  }
}

/* ==========================================================================
   3. FACILITY GEOJSON OVERLAY & CLUSTERING
   ========================================================================== */

/**
 * Loads GeoJSON facility features into the marker cluster group.
 * @param {Object} geojsonData FeatureCollection object.
 * @param {Array<string>} activeCategories Filter array (e.g. ['toilet', 'lift', 'ramp']).
 */
export function renderFacilityGeoJSON(geojsonData, activeCategories = ['toilet', 'lift', 'ramp']) {
  if (!facilityClusterGroup) return;

  facilityClusterGroup.clearLayers();

  if (!geojsonData || !Array.isArray(geojsonData.features)) return;

  const geoJsonLayer = L.geoJSON(geojsonData, {
    filter: (feature) => activeCategories.includes(feature.properties.category),
    pointToLayer: (feature, latlng) => {
      const category = feature.properties.category || 'facility';
      return L.marker(latlng, { icon: createFacilityIcon(category) });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const popupHtml = `
        <div class="custom-leaflet-popup">
          <h6 class="popup-title mb-1">${props.name}</h6>
          <p class="small text-muted mb-1">${props.address}</p>
          <div class="d-flex gap-1 mt-2">
            ${props.accessibleToilet ? '<span class="badge bg-info">Accessible Washroom</span>' : ''}
            ${props.liftAccess ? '<span class="badge bg-success">Step-Free Lift</span>' : ''}
          </div>
        </div>
      `;
      layer.bindPopup(popupHtml, { maxWidth: 260 });
    }
  });

  facilityClusterGroup.addLayer(geoJsonLayer);
}

/* ==========================================================================
   4. ICON FACTORY HELPERS
   ========================================================================== */

function createEndpointIcon(type, title) {
  const isStart = type === 'start';
  const bgColor = isStart ? '#1b7a4b' : '#dc2626';
  const iconClass = isStart ? 'bi-geo-alt-fill' : 'bi-flag-fill';

  return L.divIcon({
    className: 'custom-endpoint-marker',
    html: `
      <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" title="${title}">
        <i class="bi ${iconClass} text-white"></i>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

function createFacilityIcon(category) {
  let iconClass = 'bi-geo-alt-fill';
  let bgColor = '#0284c7';

  if (category === 'toilet') { iconClass = 'bi-person-wheelchair'; bgColor = '#0284c7'; }
  if (category === 'lift')   { iconClass = 'bi-box-arrow-up-right'; bgColor = '#1b7a4b'; }
  if (category === 'ramp')   { iconClass = 'bi-sign-post-split'; bgColor = '#d97706'; }

  return L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div class="marker-pin" style="background-color: ${bgColor};">
        <i class="bi ${iconClass} text-white"></i>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
}

/**
 * Returns the barrier layer group for dynamic CRUD updates.
 */
export function getBarrierLayerGroup() {
  return barrierLayerGroup;
}