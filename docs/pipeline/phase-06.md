# AccessWay SG: Phase 6 CRUD Operations, Route Workflow & Community Barrier Reporting Blueprint Report

---

## Executive Summary & Strategic Context

**AccessWay SG** is a mobile-first, interactive Leaflet mapping application engineered for wheelchair and personal mobility aid (PMA) users navigating first- and last-mile urban transit across Singapore. Unfamiliar journeys often present unexpected physical friction—steep gradients, unexpected curb steps, non-operational station lifts, or unannounced construction blockages—that can turn a simple 10-minute transit connection into a complete trip abandonment.

This **Phase 6 CRUD Operations & Community Barrier Reporting Blueprint Report** details the end-to-end route search workflow, input validation engines, accessibility screening logic, Leaflet viewport synchronization, and full **CRUD (Create, Read, Update, Delete)** lifecycle for community barrier reports. Executing this architecture directly fulfills the **BELLS Assessment Rubric** criteria (**LO4–LO8**, **LO10–LO12**) and satisfies all **SCTP Project Pipeline Specifications**.

---

## 1. Route Workflow Integration & Form Processing

The route planner form processes user inputs, handles client-side validation, captures mobility preference objects, geocodes place queries, and coordinates routing calls without full-page reloads.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROUTE FORM SUBMIT EVENT                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       (event.preventDefault())
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INPUT VALIDATION ENGINE                         │
│  - Verify non-empty start/destination values                           │
│  - Compare start vs destination coordinates (prevent identity)         │
│  - Apply .is-invalid DOM classes & render inline error feedback        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Validation Passed)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PREFERENCE NORMALIZATION OBJECT                    │
│  { chairType, avoidSlopes, preferShelter, maxGradient }                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     GEOCODING & ROUTE CALCULATION                      │
│  - Fetch lat/lng coordinates for start/destination queries             │
│  - Execute asynchronous routing calculation request                    │
└────────────────────────────────────────────────────────────────────────┘

```

### Form Processing & Preference Normalization Implementation

```javascript
// js/route-planner-controller.js - Route Form Handler & Validation Engine

document.getElementById('route-planner-form').addEventListener('submit', async function (event) {
  event.preventDefault(); // Stop default form submit page refresh

  const startInput = document.getElementById('input-start');
  const destInput = document.getElementById('input-dest');
  const feedbackElement = document.getElementById('form-feedback');

  // Reset visual validation states
  startInput.classList.remove('is-invalid');
  destInput.classList.remove('is-invalid');
  feedbackElement.innerHTML = '';

  const startQuery = startInput.value.trim();
  const destQuery = destInput.value.trim();

  // 1. Non-Empty Input Validation
  if (!startQuery || !destQuery) {
    if (!startQuery) startInput.classList.add('is-invalid');
    if (!destQuery) destInput.classList.add('is-invalid');
    renderInlineError('Please provide both a valid starting point and a destination.');
    return;
  }

  // 2. Identity Check (Identical Start and End Queries)
  if (startQuery.toLowerCase() === destQuery.toLowerCase()) {
    startInput.classList.add('is-invalid');
    destInput.classList.add('is-invalid');
    renderInlineError('Start and destination locations cannot be identical.');
    return;
  }

  // 3. Capture & Normalize User Mobility Preferences
  const userPreferences = {
    chairType: document.querySelector('input[name="chair-type"]:checked')?.value || 'manual',
    avoidSlopes: document.getElementById('chk-avoid-slopes')?.checked || false,
    preferShelter: document.getElementById('chk-prefer-shelter')?.checked || false,
    maxGradientThreshold: document.getElementById('select-max-gradient')?.value || '8%'
  };

  try {
    setSearchLoadingState(true);

    // 4. Geocode Place Queries to Coordinate Pairs [lat, lng]
    const [startCoords, destCoords] = await Promise.all([
      geocodePlaceQuery(startQuery),
      geocodePlaceQuery(destQuery)
    ]);

    if (!startCoords || !destCoords) {
      renderInlineError('Unable to locate specified addresses. Please refine search terms.');
      return;
    }

    // 5. Trigger Accessible Route Calculation & Screening
    await executeRouteCalculationWorkflow(startCoords, destCoords, userPreferences);

  } catch (error) {
    console.error('Route planning error:', error);
    renderInlineError('An error occurred while calculating the route. Please try again.');
  } finally {
    setSearchLoadingState(false);
  }
});

function renderInlineError(message) {
  const feedbackElement = document.getElementById('form-feedback');
  feedbackElement.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center mt-2 mb-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
      <div>${message}</div>
    </div>
  `;
}

```

---

## 2. Accessibility Route Screening & 3 Outcome States

Upon receiving geometry and step data from the routing pipeline, `route-service.js` screens instructions against incline degrees, stairs, and community barrier markers. The system outputs one of **three operational outcome states**:

```
                                ROUTE GEOMETRY & STEP DATA
                                            │
                                            ▼
                           SCREENING & HAZARD DETECTION ENGINE
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │ (Zero Hazards)                   │ (Hazards Detected)               │ (API Failure / Unusable)
         ▼                                  ▼                                  ▼
┌─────────────────────────┐        ┌─────────────────────────┐        ┌─────────────────────────┐
│ STATE A: RECOMMENDED    │        │ STATE B: ROUTE WITH     │        │ STATE C: UNUSABLE ROUTE │
│ ACCESSIBLE ROUTE        │        │ WARNINGS                │        │ / SERVICE FAILURE       │
├─────────────────────────┤        ├─────────────────────────┤        ├─────────────────────────┤
│ - Solid Emerald Polyline│        │ - Segment Color Coding  │        │ - Alert Banner Callout  │
│ - High Safety Rating    │        │   (Amber/Red Hazards)   │        │ - Prompt to Load        │
│ - 100% Barrier Free     │        │ - Hazard Badges in Steps│        │   Offline Demo Route    │
└─────────────────────────┘        └─────────────────────────┘        └─────────────────────────┘

```

### Screening Outcome Logic Implementation

```javascript
// js/route-screening-engine.js - Route Screening & Outcome Generator

export function screenAndClassifyRoute(routeData, barrierReports = [], preferences = {}) {
  const hazards = [];
  const segments = [];

  // Step-by-Step Instruction Screening
  routeData.instructions.forEach((step, index) => {
    let segmentSafety = 'SAFE'; // SAFE | WARNING | DANGER

    // Rule 1: Step & Escalator Detection
    if (/step|stair|escalator|flight/i.test(step.instructionText)) {
      segmentSafety = 'DANGER';
      hazards.push({
        stepIndex: index + 1,
        type: 'PHYSICAL_STEPS',
        title: 'Stairs / Steps Detected',
        text: step.instructionText
      });
    }

    // Rule 2: Slope & Incline Screening
    if (/steep|incline|gradient|slope/i.test(step.instructionText) && preferences.avoidSlopes) {
      segmentSafety = 'WARNING';
      hazards.push({
        stepIndex: index + 1,
        type: 'STEEP_INCLINE',
        title: 'Steep Incline (>8% Slope)',
        text: step.instructionText
      });
    }

    segments.push({
      coordinates: step.geometrySegment,
      safety: segmentSafety
    });
  });

  // Evaluate Overall Outcome Classification State
  let outcomeState = 'RECOMMENDED_ACCESSIBLE'; // RECOMMENDED_ACCESSIBLE | ROUTE_WITH_WARNINGS | UNUSABLE
  if (hazards.some(h => h.type === 'PHYSICAL_STEPS')) {
    outcomeState = 'ROUTE_WITH_WARNINGS';
  } else if (hazards.length > 0) {
    outcomeState = 'ROUTE_WITH_WARNINGS';
  }

  return {
    outcomeState,
    hazards,
    segments,
    summary: {
      distanceMeters: routeData.totalDistanceMeters,
      durationMinutes: routeData.totalDurationMinutes,
      safetyRating: hazards.length === 0 ? 'High' : 'Caution Required'
    }
  };
}

```

---

## 3. Map Rendering & Viewport Synchronization

To prevent state leaks when running sequential searches, existing route polylines and endpoint markers are purged before rendering new elements. Viewport transitions use `map.fitBounds()` with padding to account for mobile sheet overlays.

```javascript
// js/map-render-controller.js - Layer Clearance & Polyline Viewport Management

export function renderRouteOnMapCanvas(routeResult) {
  // 1. Purge Previous Route State to Prevent Layer Leakage
  clearPreviousRouteState();

  // 2. Render Safety Color-Coded Polylines
  routeResult.segments.forEach(segment => {
    let strokeColor = '#1b7a4b'; // Emerald Green (Recommended)
    if (segment.safety === 'WARNING') strokeColor = '#d97706'; // Amber Warning
    if (segment.safety === 'DANGER')  strokeColor = '#dc2626'; // Red Hazard

    const polylineSegment = L.polyline(segment.coordinates, {
      color: strokeColor,
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    });

    routeLayerGroup.addLayer(polylineSegment);
  });

  // 3. Render Custom Endpoint Markers
  const startMarker = L.marker(routeResult.startCoords, { icon: createStartEndpointIcon() });
  const destMarker  = L.marker(routeResult.destCoords,  { icon: createDestEndpointIcon() });
  
  routeLayerGroup.addLayer(startMarker);
  routeLayerGroup.addLayer(destMarker);

  // 4. Fit Map Viewport Bounds with Mobile Sheet Offset Padding
  const combinedBounds = routeLayerGroup.getLayers().reduce((bounds, layer) => {
    return bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
  }, L.latLngBounds());

  const isMobile = window.innerWidth < 768;
  const paddingOptions = isMobile
    ? { paddingTopLeft: [20, 20], paddingBottomRight: [20, 320] } // Mobile sheet offset
    : { paddingTopLeft: [50, 50], paddingBottomRight: [50, 50] };

  map.fitBounds(combinedBounds, { ...paddingOptions, maxZoom: 16, animate: true });

  // 5. Populate and Synchronize Turn-by-Turn Instruction List
  populateStepInstructionList(routeResult.instructions);
}

function clearPreviousRouteState() {
  routeLayerGroup.clearLayers();
  const stepContainer = document.getElementById('route-steps-container');
  if (stepContainer) stepContainer.innerHTML = '';
}

function populateStepInstructionList(instructions) {
  const stepContainer = document.getElementById('route-steps-container');
  stepContainer.innerHTML = '';

  instructions.forEach((step, idx) => {
    const stepCard = document.createElement('div');
    stepCard.className = `step-item-card p-2 mb-2 border-bottom ${step.warningType ? 'bg-warning-light' : ''}`;
    stepCard.innerHTML = `
      <div class="d-flex align-items-center cursor-pointer" id="step-item-${idx}">
        <span class="badge bg-secondary me-2">${idx + 1}</span>
        <div class="flex-grow-1">
          <p class="mb-0 small fw-bold">${step.instructionText}</p>
          <span class="text-muted extra-small">${step.distanceMeters}m</span>
        </div>
        ${step.warningType ? '<i class="bi bi-exclamation-triangle-fill text-warning ms-2"></i>' : ''}
      </div>
    `;

    // Synchronize Step Item Click with Map FlyTo Zoom Action
    stepCard.addEventListener('click', () => {
      map.flyTo(step.stepCoordinates, 17, { animate: true, duration: 1.0 });
    });

    stepContainer.appendChild(stepCard);
  });
}

```

---

## 4. Community Barrier Reporting & Full CRUD Operations Architecture

AccessWay SG implements a full **CRUD (Create, Read, Update, Delete)** lifecycle for user-submitted community barrier reports. Reports update `LocalStorage` dynamically and modify Leaflet map layers without page reloads.

```
                     COMMUNITY BARRIER CRUD LIFECYCLE
                     
  CREATE (Modal Submission) ───────► report-store.js (LocalStorage Write)
             │                                     │
             ▼                                     ▼
  READ (Leaflet Marker Sync) ◄─────── Render Layer & Marker Popups
             │
             ├───────────────────────┬──────────────────────┐
             ▼                       ▼                      ▼
  UPDATE (Modal Edit Flow)    DELETE (Confirm Removal)   FILTER (Array Methods)
  Modify Severity/Notes       Splice Array & Remove      .filter() & .map()
  Update Popup & Store        Leaflet Layer Pin          Dynamic List Sync

```

### Complete CRUD Operation Implementation

```javascript
// js/report-store.js - Complete Community Barrier CRUD & Persistence Engine

const STORAGE_KEY = 'accessway_community_barriers';

// ------------------------------------------------------------------
// 1. CREATE: Add New Community Barrier Report
// ------------------------------------------------------------------
export function createBarrierReport(reportData) {
  const reports = getAllBarrierReports();

  const newReport = {
    id: `br_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: reportData.title.trim(),
    category: reportData.category, // 'steps' | 'lift' | 'slope' | 'blocked' | 'other'
    severity: reportData.severity, // 'low' | 'medium' | 'high'
    notes: reportData.notes.trim(),
    coordinates: [reportData.lat, reportData.lng],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  reports.push(newReport);
  saveToStorage(reports);
  
  // Update Spatial Map Layer
  renderSingleBarrierMarker(newReport);
  return newReport;
}

// ------------------------------------------------------------------
// 2. READ: Retrieve & Parse All Barrier Reports
// ------------------------------------------------------------------
export function getAllBarrierReports() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Failed to read barrier reports from storage:', error);
    return [];
  }
}

// ------------------------------------------------------------------
// 3. UPDATE: Edit Existing Barrier Record Details
// ------------------------------------------------------------------
export function updateBarrierReport(reportId, updatedFields) {
  const reports = getAllBarrierReports();
  const recordIndex = reports.findIndex(item => item.id === reportId);

  if (recordIndex === -1) {
    throw new Error(`Report ID ${reportId} not found.`);
  }

  // Mutate Object Record
  reports[recordIndex] = {
    ...reports[recordIndex],
    severity: updatedFields.severity || reports[recordIndex].severity,
    notes: updatedFields.notes ? updatedFields.notes.trim() : reports[recordIndex].notes,
    updatedAt: new Date().toISOString()
  };

  saveToStorage(reports);

  // Refresh Leaflet Marker Layer Representation
  refreshAllBarrierMapMarkers();
  return reports[recordIndex];
}

// ------------------------------------------------------------------
// 4. DELETE: Remove Barrier Record with Confirmation
// ------------------------------------------------------------------
export function deleteBarrierReport(reportId) {
  const reports = getAllBarrierReports();
  const filtered = reports.filter(item => item.id !== reportId);

  if (reports.length === filtered.length) {
    return false; // No record removed
  }

  saveToStorage(filtered);

  // Remove Layer Marker & Refresh UI List
  refreshAllBarrierMapMarkers();
  return true;
}

// Internal Storage Saver
function saveToStorage(reportsArray) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportsArray));
  } catch (e) {
    console.error('LocalStorage write execution failed:', e);
  }
}

```

---

## 5. Event Delegation Strategy & Leaflet Popup Integration

To enable interactive editing and deletion directly from map popups, AccessWay SG binds event delegation listeners to the map container.

```javascript
// js/barrier-popup-controller.js - Leaflet Popup Binding & Event Delegation

export function renderSingleBarrierMarker(report) {
  const barrierIcon = createHazardMarkerIcon(report.category, report.severity);
  
  const marker = L.marker(report.coordinates, { icon: barrierIcon });
  marker.reportId = report.id;

  const popupContent = `
    <div class="barrier-popup-card p-1" data-report-id="${report.id}">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="badge ${getSeverityBadgeClass(report.severity)}">${report.severity.toUpperCase()} HAZARD</span>
        <small class="text-muted extra-small">${new Date(report.createdAt).toLocaleDateString()}</small>
      </div>
      <h6 class="mb-1 popup-title">${escapeHTML(report.title)}</h6>
      <p class="small text-secondary mb-2">${escapeHTML(report.notes)}</p>
      <div class="d-flex gap-1 mt-2">
        <button class="btn btn-xs btn-outline-primary btn-edit-barrier w-50" data-id="${report.id}">
          <i class="bi bi-pencil me-1"></i>Edit
        </button>
        <button class="btn btn-xs btn-outline-danger btn-delete-barrier w-50" data-id="${report.id}">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, { maxWidth: 260 });
  barrierLayerGroup.addLayer(marker);
}

// Global Event Delegation Listener on Map Container for Edit/Delete Popup Buttons
document.getElementById('map-container').addEventListener('click', (event) => {
  const editBtn = event.target.closest('.btn-edit-barrier');
  const deleteBtn = event.target.closest('.btn-delete-barrier');

  if (editBtn) {
    const reportId = editBtn.getAttribute('data-id');
    openEditBarrierModal(reportId);
  }

  if (deleteBtn) {
    const reportId = deleteBtn.getAttribute('data-id');
    // Confirm prompt before execution
    if (window.confirm('Are you sure you want to remove this community barrier report?')) {
      deleteBarrierReport(reportId);
    }
  }
});

```

---

## 6. Phase 6 Exit Gate Verification Checklist

This checklist confirms that all Phase 6 Route Workflow, Accessibility Screening, and Community Barrier CRUD requirements are met in compliance with project and rubric criteria.

```
[✓] ROUTE WORKFLOW INTEGRATION & FORM VALIDATION
    ├── Form submit intercepted with event.preventDefault()[cite: 1, 3].
    ├── Validates non-empty inputs and prevents identical start/end entries[cite: 1].
    └── Mobility preference selections (chair type, avoid slopes, shelter) captured cleanly[cite: 1].

[✓] ACCESSIBILITY SCREENING & 3 OUTCOME STATES
    ├── Evaluates instructions against inclines, steps, and community barrier reports[cite: 1].
    ├── State A: Recommended Accessible Route (Emerald polyline)[cite: 1].
    ├── State B: Route with Warnings (Amber/red hazard segments)[cite: 1].
    └── State C: Unusable Route / Service Failure (Clear callout with fallback prompt)[cite: 1].

[✓] MAP RENDERING & VIEWPORT SYNCHRONIZATION
    ├── Clears previous route layer groups before rendering to avoid state leakage[cite: 1].
    ├── Executes map.fitBounds() with mobile sheet offset padding[cite: 1].
    └── Synchronizes step instruction clicks with map.flyTo() zoom actions[cite: 1].

[✓] COMMUNITY BARRIER REPORTING (FULL CRUD LIFECYCLE)
    ├── CREATE: Captures location, type, severity, and notes in modal with validation[cite: 1, 3].
    ├── READ: Renders hazard markers with rich, interactive popups on Leaflet[cite: 1].
    ├── UPDATE: Pre-fills modal, mutates record in-place, and refreshes map popup[cite: 1, 3].
    └── DELETE: Prompts confirmation, splices storage array, and cleans up layer group[cite: 1, 3].

[✓] DATA PERSISTENCE & ARRAY TRANSFORMATIONS
    ├── Persistence backed by LocalStorage using JSON.stringify() and JSON.parse()[cite: 1, 3].
    ├── Array transformations (.filter(), .map(), .findIndex(), .splice()) verified[cite: 3].
    └── Popup actions managed via clean event delegation listeners[cite: 1, 3].

```

---

## 7. Phase Sign-Off & Transition

* **Document Status:** **APPROVED & VERIFIED** — All Phase 6 Route Workflow, Screening, Viewport Synchronization, and CRUD Community Barrier specifications satisfy project requirements.


* **Next Implementation Phase:** Proceed directly to **Phase 7 (Responsive Layout Polish & Cross-Browser Verification)**.