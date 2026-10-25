/**
 * ==========================================================================
 * ACCESSWAY SG - BARRIER CONTROLLER & COMMUNITY REPORTING (js/barrier-controller.js)
 * ==========================================================================
 * 
 * Manages physical hazard reporting, modal validation, Leaflet hazard pin 
 * rendering, popup interaction delegates (edit/delete), and CRUD synchronization.
 */

import { 
  getAllBarrierReports, 
  createBarrierReport, 
  updateBarrierReport, 
  deleteBarrierReport, 
  getBarrierReportById 
} from './report-store.js';

import { getBarrierLayerGroup, getMapInstance } from './map-service.js';
import { displayFormFeedback } from './ui-controller.js';

let activeModalInstance = null;

/* ==========================================================================
   1. CONTROLLER INITIALIZATION & EVENT DELEGATION
   ========================================================================== */

/**
 * Initializes barrier reporting forms, FAB triggers, and map popup listeners.
 */
export function initBarrierController() {
  const fabBtn = document.getElementById('fab-report-barrier');
  const reportForm = document.getElementById('barrier-report-form');
  const modalEl = document.getElementById('barrierModal');

  if (modalEl) {
    activeModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  }

  // Floating Action Button (FAB) Trigger: Click map to place hazard pin
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      const map = getMapInstance();
      if (!map) return;

      const center = map.getCenter();
      openBarrierModal({ lat: center.lat, lng: center.lng });
    });
  }

  // Form Submission Event Listener
  if (reportForm) {
    reportForm.addEventListener('submit', handleBarrierFormSubmit);
  }

  // Initial Sync: Render all stored barrier hazard pins on startup
  syncBarrierMarkersOnMap();

  // Map Popup Event Delegation for Dynamic "Edit" / "Delete" Clicks
  document.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.btn-edit-barrier');
    const deleteBtn = event.target.closest('.btn-delete-barrier');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      handleEditBarrierClick(id);
    }

    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      handleDeleteBarrierClick(id);
    }
  });
}

/* ==========================================================================
   2. MODAL STATE & FORM PROCESSING
   ========================================================================== */

/**
 * Opens the barrier report modal populated with coordinates or existing data.
 * @param {Object} coords Lat/Lng location coordinates.
 * @param {Object|null} existingReport Optional barrier object for edit mode.
 */
export function openBarrierModal(coords, existingReport = null) {
  const form = document.getElementById('barrier-report-form');
  const titleInput = document.getElementById('barrier-title');
  const severitySelect = document.getElementById('barrier-severity');
  const notesInput = document.getElementById('barrier-notes');
  const editIdInput = document.getElementById('barrier-edit-id');
  const latInput = document.getElementById('barrier-lat');
  const lngInput = document.getElementById('barrier-lng');
  const modalLabel = document.getElementById('barrierModalLabel');

  if (!form) return;

  form.reset();
  displayFormFeedback('', 'danger', 'barrier-form-feedback');

  if (existingReport) {
    // Edit Mode
    modalLabel.innerHTML = '<i class="bi bi-pencil-square me-2"></i> Edit Physical Barrier Hazard';
    editIdInput.value = existingReport.id;
    titleInput.value = existingReport.title;
    severitySelect.value = existingReport.severity;
    notesInput.value = existingReport.notes || '';
    latInput.value = existingReport.lat;
    lngInput.value = existingReport.lng;

    // Check category radio
    const catRadio = document.querySelector(`input[name="barrier-category"][value="${existingReport.category}"]`);
    if (catRadio) catRadio.checked = true;
  } else {
    // New Report Mode
    modalLabel.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Report Physical Barrier Hazard';
    editIdInput.value = '';
    latInput.value = coords ? coords.lat : '';
    lngInput.value = coords ? coords.lng : '';
  }

  if (activeModalInstance) {
    activeModalInstance.show();
  }
}

/**
 * Handles validation and persistence of barrier form submissions.
 * @param {Event} event Form submit event.
 */
function handleBarrierFormSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById('barrier-edit-id').value;
  const title = document.getElementById('barrier-title').value.trim();
  const category = document.querySelector('input[name="barrier-category"]:checked')?.value || 'steps';
  const severity = document.getElementById('barrier-severity').value;
  const notes = document.getElementById('barrier-notes').value.trim();
  const lat = parseFloat(document.getElementById('barrier-lat').value);
  const lng = parseFloat(document.getElementById('barrier-lng').value);
  const confirmed = document.getElementById('barrier-confirm-check').checked;

  // Defensive Form Validation
  if (!title) {
    displayFormFeedback('Please provide a descriptive title for the barrier.', 'danger', 'barrier-form-feedback');
    return;
  }

  if (!confirmed) {
    displayFormFeedback('Please check the confirmation box to verify the hazard.', 'danger', 'barrier-form-feedback');
    return;
  }

  try {
    if (editId) {
      // Execute Update
      updateBarrierReport(editId, { title, category, severity, notes });
    } else {
      // Execute Create
      createBarrierReport({ title, category, severity, notes, lat, lng });
    }

    // Refresh Spatial Layer Pins
    syncBarrierMarkersOnMap();

    if (activeModalInstance) {
      activeModalInstance.hide();
    }
  } catch (error) {
    displayFormFeedback(error.message || 'Failed to save barrier report.', 'danger', 'barrier-form-feedback');
  }
}

/* ==========================================================================
   3. SPATIAL MARKER SYNCHRONIZATION & POPUPS
   ========================================================================== */

/**
 * Synchronizes stored community barriers with Leaflet hazard pins.
 */
export function syncBarrierMarkersOnMap() {
  const barrierLayerGroup = getBarrierLayerGroup();
  if (!barrierLayerGroup) return;

  barrierLayerGroup.clearLayers();
  const reports = getAllBarrierReports();

  reports.forEach(report => {
    const marker = L.marker([report.lat, report.lng], {
      icon: createHazardPinIcon(report.category, report.severity)
    });

    const popupHtml = `
      <div class="custom-barrier-popup">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="badge bg-danger extra-small text-uppercase">${report.category}</span>
          <span class="extra-small text-muted">${new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
        <h6 class="popup-title mb-1 fs-6">${escapeHtml(report.title)}</h6>
        <p class="small text-muted mb-2">${escapeHtml(report.notes || 'No extra guidance notes provided.')}</p>
        <div class="d-flex gap-2 border-top pt-2 mt-2">
          <button class="btn btn-xs btn-outline-secondary btn-edit-barrier w-50" data-id="${report.id}">
            <i class="bi bi-pencil me-1"></i> Edit
          </button>
          <button class="btn btn-xs btn-outline-danger btn-delete-barrier w-50" data-id="${report.id}">
            <i class="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 280 });
    barrierLayerGroup.addLayer(marker);
  });
}

/**
 * Handles inline "Edit" clicks from marker popups.
 */
function handleEditBarrierClick(id) {
  const report = getBarrierReportById(id);
  if (report) {
    openBarrierModal({ lat: report.lat, lng: report.lng }, report);
  }
}

/**
 * Handles inline "Delete" clicks from marker popups.
 */
function handleDeleteBarrierClick(id) {
  if (confirm('Are you sure you want to remove this community hazard report?')) {
    deleteBarrierReport(id);
    syncBarrierMarkersOnMap();
  }
}

/* ==========================================================================
   4. HAZARD PIN ICON FACTORY
   ========================================================================== */

function createHazardPinIcon(category, severity) {
  let bgColor = '#dc2626'; // High Severity Red
  if (severity === 'medium') bgColor = '#ea580c'; // Medium Orange
  if (severity === 'low')    bgColor = '#d97706'; // Low Amber

  let iconClass = 'bi-exclamation-triangle-fill';
  if (category === 'steps')   iconClass = 'bi-segmented-nav';
  if (category === 'lift')    iconClass = 'bi-box-arrow-down';
  if (category === 'slope')   iconClass = 'bi-graph-up-arrow';
  if (category === 'blocked') iconClass = 'bi-slash-circle';

  return L.divIcon({
    className: 'custom-hazard-pin',
    html: `
      <div class="hazard-pin-bubble" style="background-color: ${bgColor};">
        <i class="bi ${iconClass} text-white"></i>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}