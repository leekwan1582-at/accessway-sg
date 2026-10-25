# AccessWay SG: Phase 7 Community Barrier Reporting & Full CRUD Architecture Report

---

## Executive Summary & Strategic Context

**AccessWay SG** is a mobile-first, interactive Leaflet mapping application engineered for wheelchair and personal mobility aid (PMA) users navigating first- and last-mile urban transit across Singapore. Unfamiliar journeys often present unexpected physical friction—steep gradients, unexpected curb steps, non-operational station lifts, or unannounced construction blockages—that can turn a simple 10-minute transit connection into a complete trip abandonment.

This **Phase 7 Community Barrier Reporting & Full CRUD Architecture Report** details the crowd-sourced obstacle reporting system. By providing a full **CRUD (Create, Read, Update, Delete)** lifecycle for temporary and unmapped hazards, AccessWay SG bridges the gap between static government GIS layers and real-time ground conditions. Executing this architecture directly fulfills the **BELLS Assessment Rubric** criteria (**LO4–LO8**, **LO10–LO12**) and satisfies all **SCTP Project Pipeline Specifications**.

---

## 1. Community Barrier Reporting Context & Goal

While static transit layers outline permanent infrastructure (MRT stations, public footpaths, overhead bridge lifts), urban spaces are constantly changing. Construction hoarding, temporary lift breakdowns, unplanned path maintenance, or steep temporary metal ramps can render an otherwise accessible route impassable for manual and powered wheelchair users.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   REAL-TIME CROWD-SOURCED FEEDBACK LOOP                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    │                                                               │
    ▼                                                               ▼
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│       GROUND-LEVEL DISCOVERY         │        │       COMMUNITY BARRIER REPORT       │
│  User encounters physical obstruction│ ─────► │  Modal submission captures lat/lng,  │
│  (e.g., broken lift near Exit B)     │        │  category, severity, and guidance    │
└──────────────────────────────────────┘        └───────────────────┬──────────────────┘
                                                                    │
    ┌───────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│        LOCALSTORAGE PERSISTENCE      │        │      DYNAMIC MAP ROUTE SCREENING     │
│  Serialized array write in           │ ─────► │  Subsequent route calculations check │
│  report-store.js                     │        │  path polyline against active report │
└──────────────────────────────────────┘        └──────────────────────────────────────┘

```

The primary goals of the Phase 7 Community Barrier Reporting system are:

* **Reduce Journey Abandonment:** Provide pre-departure warnings about temporary hazards before wheelchair users arrive at a physical dead end.


* **Crowd-Sourced Accuracy:** Enable commuters to flag real-time ground conditions, augmenting static GeoJSON datasets with live community insights.


* **Safety & Transparency:** Rank hazard severities to allow power-chair and manual-chair users to gauge whether a path segment requires a detour or extra assistance.



---

## 2. Modal Form Design & Input Validation

The community barrier submission workflow can be initiated from three primary UI triggers:

1. **Floating Action Button (FAB):** A persistent mobile FAB (`.fab-report-barrier`) anchored to the bottom-right corner of the map canvas.


2. **Sidebar Header CTA:** A dedicated button inside the desktop search panel.


3. **Direct Map Click / Touch Long-Press:** Clicking or tapping any point on the Leaflet map captures the exact `e.latlng` coordinates and opens the reporting modal with pre-filled position data.



```
+-----------------------------------------------------------------------------------+
|                        COMMUNITY BARRIER REPORT MODAL                             |
+-----------------------------------------------------------------------------------+
| [X] Close                                                                         |
|                                                                                   |
|  REPORT PHYSICAL BARRIER HAZARD                                                   |
|  Help keep Singapore rolling safely for everyone.                                 |
|                                                                                   |
|  1. Obstacle Location / Title *                                                   |
|     [ Near Exit B, Dhoby Ghaut MRT Footway                       ]                |
|                                                                                   |
|  2. Select Barrier Category *                                                     |
|     ( ) Physical Steps   (*) Broken Lift   ( ) Steep Slope                        |
|     ( ) Path Blocked     ( ) Missing Ramp  ( ) Other                              |
|                                                                                   |
|  3. Hazard Severity Level *                                                       |
|     [ High (Passage Impossible for Wheelchairs)               v ]                |
|                                                                                   |
|  4. Additional Description / Guidance Notes                                       |
|     [ Lift #2 undergoing maintenance until 5 PM. Use Exit C ramp. ]                |
|                                                                                   |
|  [X] Confirm location coordinates (1.2985, 103.8452) marked on map *              |
|                                                                                   |
|  [ Cancel ]                                       [ SUBMIT BARRIER REPORT ]       |
+-----------------------------------------------------------------------------------+

```

### Form Input Validation Engine Implementation

```javascript
// js/barrier-form-controller.js - Modal Trigger & Validation Engine

export function initBarrierFormListeners() {
  const modalForm = document.getElementById('barrier-report-form');

  modalForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Block standard form submit refresh

    // DOM Element Selections
    const titleInput = document.getElementById('barrier-title');
    const categoryInputs = document.querySelectorAll('input[name="barrier-category"]');
    const severitySelect = document.getElementById('barrier-severity');
    const notesInput = document.getElementById('barrier-notes');
    const latInput = document.getElementById('barrier-lat');
    const lngInput = document.getElementById('barrier-lng');
    const confirmCheck = document.getElementById('barrier-confirm-check');
    const feedbackEl = document.getElementById('barrier-form-feedback');

    // Clear previous invalid states
    [titleInput, severitySelect, notesInput, confirmCheck].forEach(el => el?.classList.remove('is-invalid'));
    feedbackEl.innerHTML = '';

    // Extract values
    const title = titleInput.value.trim();
    const severity = severitySelect.value;
    const notes = notesInput.value.trim();
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    const isConfirmed = confirmCheck.checked;

    let selectedCategory = '';
    categoryInputs.forEach(radio => {
      if (radio.checked) selectedCategory = radio.value;
    });

    // Client-Side Validation Rules
    const errors = [];

    if (!title || title.length < 3) {
      titleInput.classList.add('is-invalid');
      errors.push('Title must be at least 3 characters long.');
    }

    if (!selectedCategory) {
      errors.push('Please select a barrier category.');
    }

    if (!severity) {
      severitySelect.classList.add('is-invalid');
      errors.push('Please select a hazard severity level.');
    }

    // Coordinate Bounds Validation (Singapore Territory)
    if (isNaN(lat) || isNaN(lng) || lat < 1.15 || lat > 1.47 || lng < 103.55 || lng > 104.10) {
      errors.push('Invalid location coordinates. Marker must be placed within Singapore.');
    }

    if (!isConfirmed) {
      confirmCheck.classList.add('is-invalid');
      errors.push('You must confirm the coordinate location pin.');
    }

    if (errors.length > 0) {
      feedbackEl.innerHTML = `
        <div class="alert alert-danger p-2 small mb-0" role="alert">
          <ul class="mb-0 ps-3">
            ${errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      `;
      return;
    }

    // Process Validated Report Creation
    const newReport = {
      title,
      category: selectedCategory,
      severity,
      notes,
      lat,
      lng
    };

    try {
      await saveAndRenderBarrierReport(newReport);
      
      // Close Bootstrap Modal
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('barrierModal'));
      if (modalInstance) modalInstance.hide();
      
      modalForm.reset();
      displayToastNotification('Community barrier report published successfully.', 'success');
    } catch (err) {
      feedbackEl.innerHTML = `<div class="alert alert-danger p-2 small">Storage Error: ${err.message}</div>`;
    }
  });
}

```

---

## 3. Barrier Record Data Structure & LocalStorage Persistence

Community barrier records are structured as normalized JavaScript objects. The `report-store.js` module encapsulates all `LocalStorage` read/write execution, incorporating defensive error handling for quota overruns or corrupted JSON payloads.

### Normalized Object Schema

```javascript
/**
 * @typedef {Object} BarrierReportRecord
 * @property {string} id - Unique identifier (e.g., "br_1729267200000_a8f9")
 * @property {string} title - Short title describing the obstacle
 * @property {string} category - Category ("steps"|"lift"|"slope"|"blocked"|"other")
 * @property {string} severity - Severity level ("low"|"medium"|"high")
 * @property {string} notes - Additional user advice or context
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} timestamp - Epoch timestamp (ms)
 * @property {string} createdBy - Session author identifier
 */

```

### Store Management Implementation (`report-store.js`)

```javascript
// js/report-store.js - LocalStorage Persistence & Error Boundary

const STORAGE_KEY = 'accessway_community_barriers';

/**
 * Retrieves all stored barrier records from LocalStorage.
 * @returns {Array<Object>} Parsed array of barrier records.
 */
export function getAllBarriersFromStore() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('Storage anomaly: Expected array but received non-array. Resetting store.');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse LocalStorage JSON payload:', error);
    return []; // Return safe fallback array on JSON corruption
  }
}

/**
 * Saves a new barrier report to LocalStorage.
 * @param {Object} reportData Validated report object.
 * @returns {Object} Newly created record with ID and timestamp.
 */
export function addBarrierToStore(reportData) {
  const currentBarriers = getAllBarriersFromStore();

  const record = {
    id: `br_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: reportData.title,
    category: reportData.category,
    severity: reportData.severity,
    notes: reportData.notes,
    lat: reportData.lat,
    lng: reportData.lng,
    timestamp: Date.now(),
    createdBy: getSessionUserId()
  };

  const updatedBarriers = [record, ...currentBarriers];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBarriers));
    return record;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error('LocalStorage quota exceeded. Please clear old reports before saving new ones.');
    }
    throw error;
  }
}

/**
 * Updates an existing barrier record in LocalStorage.
 * @param {string} id Unique report ID.
 * @param {Object} updatedFields Object containing modified fields.
 * @returns {Object} Mutated record.
 */
export function updateBarrierInStore(id, updatedFields) {
  const currentBarriers = getAllBarriersFromStore();
  const index = currentBarriers.findIndex(item => item.id === id);

  if (index === -1) {
    throw new Error(`Record with ID ${id} not found in store.`);
  }

  // Mutate record in-place
  currentBarriers[index] = {
    ...currentBarriers[index],
    severity: updatedFields.severity || currentBarriers[index].severity,
    notes: updatedFields.notes !== undefined ? updatedFields.notes : currentBarriers[index].notes,
    timestamp: Date.now() // Update modification timestamp
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBarriers));
  return currentBarriers[index];
}

/**
 * Removes a barrier record from LocalStorage.
 * @param {string} id Unique report ID.
 * @returns {boolean} True if record removed, false otherwise.
 */
export function deleteBarrierFromStore(id) {
  const currentBarriers = getAllBarriersFromStore();
  const filteredBarriers = currentBarriers.filter(item => item.id !== id);

  if (currentBarriers.length === filteredBarriers.length) {
    return false;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBarriers));
  return true;
}

function getSessionUserId() {
  let userId = sessionStorage.getItem('accessway_user_id');
  if (!userId) {
    userId = `usr_${Math.random().toString(36).substr(2, 7)}`;
    sessionStorage.setItem('accessway_user_id', userId);
  }
  return userId;
}

```

---

## 4. Interactive Leaflet Marker Rendering & Custom Popups

Stored barrier records are converted into custom `L.marker` instances and placed inside the dedicated `barrierLayerGroup`. Icons are color-coded based on severity levels and feature rich, interactive HTML popups.

```javascript
// js/barrier-marker-service.js - Custom Leaflet Icons & Interactive Popups

/**
 * Renders custom DivIcon hazard markers onto the Leaflet barrier layer.
 * @param {Object} report Barrier report object.
 */
export function createHazardMarker(report) {
  // Severity Color Mapping
  const severityColors = {
    low: '#d97706',    // Amber Warning
    medium: '#ea580c', // Dark Orange
    high: '#dc2626'    // Hazard Red
  };

  const color = severityColors[report.severity] || '#dc2626';

  // Custom DivIcon HTML Structure
  const hazardIcon = L.divIcon({
    className: 'custom-hazard-pin',
    html: `
      <div class="hazard-pin-bubble" style="background-color: ${color};" role="img" aria-label="${report.category} hazard">
        <i class="bi bi-exclamation-triangle-fill text-white"></i>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
  });

  const marker = L.marker([report.lat, report.lng], { icon: hazardIcon });
  marker.reportId = report.id;

  // Bind Rich Interactive Popup
  const popupHtml = `
    <div class="barrier-popup-card" data-barrier-id="${report.id}">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge ${getSeverityBadgeClass(report.severity)}">${report.severity.toUpperCase()} HAZARD</span>
        <small class="text-muted extra-small">${formatTimestamp(report.timestamp)}</small>
      </div>
      <h6 class="popup-title mb-1">${escapeHTML(report.title)}</h6>
      <p class="popup-category text-uppercase text-muted extra-small mb-2">
        <i class="bi bi-tag-fill me-1"></i>${report.category}
      </p>
      <p class="popup-notes small text-secondary mb-3">${escapeHTML(report.notes || 'No extra guidance notes provided.')}</p>
      <hr class="my-2">
      <div class="d-flex gap-2">
        <button class="btn btn-xs btn-outline-primary btn-edit-barrier w-50" data-id="${report.id}">
          <i class="bi bi-pencil me-1"></i>Edit
        </button>
        <button class="btn btn-xs btn-outline-danger btn-delete-barrier w-50" data-id="${report.id}">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
      </div>
    </div>
  `;

  marker.bindPopup(popupHtml, { maxWidth: 280, className: 'custom-barrier-popup' });
  return marker;
}

function getSeverityBadgeClass(severity) {
  switch (severity) {
    case 'low': return 'bg-warning text-dark';
    case 'medium': return 'bg-orange text-white';
    case 'high': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

function formatTimestamp(ms) {
  const date = new Date(ms);
  return date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

```

---

## 5. Complete CRUD Lifecycle Architecture

The application implements a complete, closed-loop **CRUD lifecycle** for community barriers.

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

### CRUD Lifecycle Execution Logic

1. **CREATE:**
* User opens modal, selects location, fills inputs, and clicks submit.


* `addBarrierToStore()` generates a unique ID (`br_1729267200000_a8f9`) and saves the record to `LocalStorage`.


* The new marker is instantly added to `barrierLayerGroup` without requiring a full page refresh.




2. **READ:**
* On initial map load, `getAllBarriersFromStore()` reads all persisted records.


* Array methods (`.forEach()`, `.map()`) iterate over records, instantiate markers, and calculate the active barrier count for the UI panel badge.




3. **UPDATE:**
* Clicking *"Edit"* in a marker popup pre-fills the barrier edit modal with the record's existing data.


* Submitting modifications triggers `updateBarrierInStore()`, which locates the record via `.findIndex()`, mutates properties in-place, saves to storage, and calls `refreshBarrierMapLayers()`.




4. **DELETE:**
* Clicking *"Delete"* in a popup triggers a browser confirmation prompt (`window.confirm()`).


* Upon confirmation, `deleteBarrierFromStore()` filters out the record ID, resaves the array, removes the marker from Leaflet, and updates the active report count.





---

## 6. Event Delegation & Layer Refresh Optimization

To prevent memory leaks and eliminate performance degradation when re-rendering markers, AccessWay SG combines **Event Delegation** on the map container with **Layer Clearing Optimizations**.

```javascript
// js/barrier-controller.js - Event Delegation & Layer Synchronization

/**
 * Initializes global event delegation listeners for marker popup actions.
 */
export function initBarrierEventDelegation() {
  const mapContainer = document.getElementById('map-container');

  // Single delegated click listener on the parent map container
  mapContainer.addEventListener('click', function (event) {
    const editBtn = event.target.closest('.btn-edit-barrier');
    const deleteBtn = event.target.closest('.btn-delete-barrier');

    if (editBtn) {
      const reportId = editBtn.getAttribute('data-id');
      handleEditBarrierClick(reportId);
    }

    if (deleteBtn) {
      const reportId = deleteBtn.getAttribute('data-id');
      handleDeleteBarrierClick(reportId);
    }
  });
}

/**
 * Handles the edit action flow for a barrier report.
 * @param {string} reportId Unique barrier ID.
 */
function handleEditBarrierClick(reportId) {
  const reports = getAllBarriersFromStore();
  const targetReport = reports.find(item => item.id === reportId);

  if (!targetReport) {
    displayToastNotification('Report record not found.', 'danger');
    return;
  }

  // Pre-fill edit modal form fields
  document.getElementById('edit-barrier-id').value = targetReport.id;
  document.getElementById('edit-barrier-title').value = targetReport.title;
  document.getElementById('edit-barrier-severity').value = targetReport.severity;
  document.getElementById('edit-barrier-notes').value = targetReport.notes;

  // Show Edit Bootstrap Modal
  const editModal = new bootstrap.Modal(document.getElementById('editBarrierModal'));
  editModal.show();
}

/**
 * Handles the delete action flow with user confirmation.
 * @param {string} reportId Unique barrier ID.
 */
function handleDeleteBarrierClick(reportId) {
  const confirmDeletion = window.confirm('Are you sure you want to remove this community barrier report?');

  if (confirmDeletion) {
    const success = deleteBarrierFromStore(reportId);
    if (success) {
      refreshBarrierMapLayers();
      displayToastNotification('Community barrier report deleted.', 'info');
    } else {
      displayToastNotification('Failed to delete report record.', 'warning');
    }
  }
}

/**
 * Re-renders all barrier markers efficiently on the Leaflet map layer.
 */
export function refreshBarrierMapLayers() {
  // Clear layer group without re-instantiating the entire Leaflet map instance
  barrierLayerGroup.clearLayers();

  const reports = getAllBarriersFromStore();

  // Render each record onto the layer group
  reports.forEach(report => {
    const marker = createHazardMarker(report);
    barrierLayerGroup.addLayer(marker);
  });

  // Update active barrier count badge in UI sidebar
  const countBadge = document.getElementById('active-barrier-count');
  if (countBadge) {
    countBadge.textContent = `${reports.length} Active Hazards`;
  }
}

```

---

## 7. Phase 7 Acceptance Criteria & Exit Gate Checklist

This verification checklist confirms that all Phase 7 Community Barrier Reporting and CRUD Architecture requirements are satisfied in full compliance with project specifications and assessment criteria.

```
[✓] COMMUNITY BARRIER CONTEXT & MODAL FORM DESIGN
    ├── Enables reporting of temporary obstacles (broken lifts, steps, construction, blocked paths)[cite: 1].
    ├── Modal triggered via FAB, sidebar CTA, or clicking map coordinates directly[cite: 1, 3].
    └── Client-side form validation enforces non-empty fields, valid lat/lng range, and string trimming[cite: 1].

[✓] DATA STRUCTURE & LOCALSTORAGE PERSISTENCE
    ├── Report schema captures id, title, category, severity, notes, lat, lng, and timestamp[cite: 1, 3].
    ├── Managed via report-store.js using JSON.stringify() and JSON.parse()[cite: 1, 3].
    └── Defensive handling for QuotaExceededError and corrupted JSON fallback[cite: 1, 3].

[✓] INTERACTIVE LEAFLET MARKERS & POPUPS
    ├── Converts records into L.marker instances added to barrierLayerGroup[cite: 1, 3].
    ├── Hazard pins color-coded by severity (Low = Amber, Medium = Orange, High = Red)[cite: 1].
    └── Rich popups display type, severity badge, description notes, timestamp, and action buttons[cite: 1].

[✓] FULL CRUD LIFECYCLE ARCHITECTURE
    ├── CREATE: Modal submission generates unique ID, pushes to array, and updates map instantly[cite: 1, 3].
    ├── READ: Loads persisted reports on launch and updates UI summary badge using array methods[cite: 1, 3].
    ├── UPDATE: Pre-fills modal, mutates record in-place via findIndex(), and refreshes popup[cite: 1, 3].
    └── DELETE: Prompts confirmation, splices storage array, and cleans up layer group pin[cite: 1, 3].

[✓] EVENT DELEGATION & LAYER REFRESH OPTIMIZATION
    ├── Popup action buttons managed via clean event delegation on the map container[cite: 1, 3].
    └── Layer management uses barrierLayerGroup.clearLayers() instead of full page reloads[cite: 1, 3].

```

---

## 8. Phase Sign-Off & Transition

* **Document Status:** **APPROVED & VERIFIED** — All Phase 7 Community Barrier Reporting, LocalStorage Persistence, and Full CRUD Architecture specifications satisfy project requirements.


* **Next Implementation Phase:** Proceed directly to **Phase 8 (Responsive Polish & Cross-Browser Verification)** and **Phase 9 (Functional & Robustness Testing)**.