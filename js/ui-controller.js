/**
 * ==========================================================================
 * ACCESSWAY SG - DOM UI CONTROLLER (js/ui-controller.js)
 * ==========================================================================
 * 
 * Manages DOM updates, renders step-by-step turn lists, handles loading 
 * state animations, displays error banners, and controls mobile bottom-sheet.
 */

/* ==========================================================================
   1. ROUTE RESULTS & INSTRUCTION LIST RENDERING
   ========================================================================== */

/**
 * Renders calculated route results, summary badges, and step lists into the DOM.
 * @param {Object} routeResult Processed route object from route-service.
 */
export function renderRouteResults(routeResult) {
  const container = document.getElementById('route-results-panel');
  if (!container) return;

  if (!routeResult) {
    container.innerHTML = '';
    return;
  }

  const { outcomeState, title, summary, instructions, hazards } = routeResult;

  // Determine Alert Banner Styling Based on Outcome State Branch
  let bannerClass = 'alert-success-accessway';
  let bannerIcon = 'bi-check-circle-fill';
  let bannerTitle = 'Barrier-Free Route Confirmed';

  if (outcomeState === 'ROUTE_WITH_WARNINGS') {
    bannerClass = 'alert-warning-accessway';
    bannerIcon = 'bi-exclamation-triangle-fill';
    bannerTitle = 'Route Contains Accessibility Warnings';
  } else if (outcomeState === 'UNUSABLE_SERVICE_FAILURE') {
    bannerClass = 'alert-danger-accessway';
    bannerIcon = 'bi-x-circle-fill';
    bannerTitle = 'Route Calculation Failed';
  }

  // Build Turn-by-Step HTML List
  let stepsHtml = '';
  if (Array.isArray(instructions) && instructions.length > 0) {
    stepsHtml = instructions.map((step) => {
      const isWarning = Boolean(step.warningType);
      const bgClass = isWarning ? 'bg-warning-light border-warning' : 'bg-light border-0';
      const badgeIcon = isWarning ? 'bi-exclamation-triangle-fill text-warning' : 'bi-arrow-right-circle-fill text-success';

      return `
        <div class="step-item-card p-2.5 mb-2 border rounded-3 ${bgClass} d-flex align-items-start gap-2.5">
          <div class="mt-0.5">
            <i class="bi ${badgeIcon} fs-5"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-bold extra-small text-uppercase text-muted">Step ${step.stepIndex}</span>
              <span class="badge bg-secondary extra-small">${step.distanceMeters || 0}m</span>
            </div>
            <p class="mb-0 small fw-medium text-slate-800">${escapeHtml(step.instructionText)}</p>
            ${isWarning ? `<p class="mb-0 extra-small text-danger fw-bold mt-1"><i class="bi bi-shield-exclamation me-1"></i>Caution: Physical Barrier Ahead</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } else {
    stepsHtml = '<p class="small text-muted text-center py-3">No step details available.</p>';
  }

  // Render Consolidated Summary & Steps Markup
  container.innerHTML = `
    <div class="card border-0 shadow-sm rounded-3 mt-3 overflow-hidden">
      <div class="alert ${bannerClass} m-0 rounded-0 d-flex align-items-center gap-2 py-2.5 px-3">
        <i class="bi ${bannerIcon} fs-5"></i>
        <div>
          <h6 class="fw-bold mb-0 small">${bannerTitle}</h6>
          <span class="extra-small">${summary.safetyRating || 'Screening Complete'}</span>
        </div>
      </div>

      <div class="card-body p-3">
        <h6 class="fw-bold font-serif mb-2 text-slate-900">${escapeHtml(title)}</h6>
        
        <div class="d-flex gap-3 mb-3 pb-2 border-bottom text-muted extra-small">
          <div><i class="bi bi-clock me-1 text-primary-accessway"></i><b>${summary.durationMinutes}</b> mins</div>
          <div><i class="bi bi-geo me-1 text-primary-accessway"></i><b>${summary.distanceMeters}</b> meters</div>
          <div><i class="bi bi-shield-check me-1 text-primary-accessway"></i><b>${hazards.length}</b> hazards</div>
        </div>

        <h6 class="extra-small fw-bold text-uppercase text-muted mb-2">Turn-by-Turn Navigation</h6>
        <div class="steps-scroll-container overflow-y-auto style-scrollbar" style="max-height: 280px;">
          ${stepsHtml}
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   2. LOADING SKELETONS & ERROR FEEDBACK
   ========================================================================== */

/**
 * Renders animated skeleton placeholders while routing calculations execute.
 */
export function showRouteLoadingSkeleton() {
  const container = document.getElementById('route-results-panel');
  if (!container) return;

  container.innerHTML = `
    <div class="card border-0 shadow-sm rounded-3 mt-3 p-3">
      <div class="skeleton-pulse mb-2" style="height: 24px; width: 60%;"></div>
      <div class="skeleton-pulse mb-3" style="height: 16px; width: 40%;"></div>
      <div class="skeleton-pulse mb-2" style="height: 48px; width: 100%;"></div>
      <div class="skeleton-pulse mb-2" style="height: 48px; width: 100%;"></div>
      <div class="skeleton-pulse" style="height: 48px; width: 100%;"></div>
    </div>
  `;
}

/**
 * Displays user-facing alert messages inside form feedback containers.
 * @param {string} message Error text to display.
 * @param {string} type Alert style variant ('danger' | 'warning' | 'success').
 * @param {string} containerId Target container DOM ID.
 */
export function displayFormFeedback(message, type = 'danger', containerId = 'form-feedback') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!message) {
    container.innerHTML = '';
    return;
  }

  const alertClass = type === 'danger' ? 'alert-danger-accessway' : 'alert-warning-accessway';
  const iconClass = type === 'danger' ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill';

  container.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show my-2 py-2 px-3 extra-small d-flex align-items-center gap-2" role="alert">
      <i class="bi ${iconClass} fs-6"></i>
      <div class="flex-grow-1">${escapeHtml(message)}</div>
      <button type="button" class="btn-close py-2 px-2" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

/* ==========================================================================
   3. MOBILE BOTTOM SHEET & OVERLAY CONTROLS
   ========================================================================== */

/**
 * Initializes mobile bottom-sheet behavior, mirroring desktop sidebar controls.
 */
export function setupMobileSheetSync() {
  const btnOpen = document.getElementById('btn-open-mobile-planner');
  const sheetElement = document.getElementById('mobileSheet');

  if (!btnOpen || !sheetElement) return;

  btnOpen.addEventListener('click', () => {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(sheetElement);
    bsOffcanvas.toggle();
  });
}

/* ==========================================================================
   4. SECURITY SANITIZER HELPER
   ========================================================================== */

/**
 * Escapes user inputs to prevent persistent Cross-Site Scripting (XSS).
 * @param {string} str Raw untrusted string.
 * @returns {string} Sanitized string.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}