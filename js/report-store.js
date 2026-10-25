/**
 * ==========================================================================
 * ACCESSWAY SG - REPORT STORE & PERSISTENCE ENGINE (js/report-store.js)
 * ==========================================================================
 * 
 * Provides full LocalStorage CRUD management for community barrier reports,
 * search history, and user preferences.
 */

const BARRIERS_STORAGE_KEY = 'accessway_community_barriers';
const PREFS_STORAGE_KEY = 'accessway_user_preferences';
const HISTORY_STORAGE_KEY = 'accessway_search_history';

// Default User Mobility Preferences
const DEFAULT_PREFERENCES = {
  chairType: 'manual',        // 'manual' | 'power' | 'pma'
  avoidSlopes: true,          // Avoid >8% gradient slopes
  preferShelter: false,       // Prefer covered walkways
  maxGradientThreshold: '8%'  // Normalized threshold tag
};

/* ==========================================================================
   1. COMMUNITY BARRIER REPORTS - CRUD OPERATIONS
   ========================================================================== */

/**
 * READ: Retrieves all stored community barrier reports.
 * Includes defensive fallback for broken JSON or uninitialized storage.
 * @returns {Array<Object>} Array of barrier report objects.
 */
export function getAllBarrierReports() {
  try {
    const rawData = localStorage.getItem(BARRIERS_STORAGE_KEY);
    if (!rawData) return [];

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      console.warn('[ReportStore] Anomaly detected: Expected array payload. Resetting storage.');
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('[ReportStore] Failed to parse LocalStorage payload:', error);
    return []; // Return safe empty array on corruption
  }
}

/**
 * READ: Gets a single barrier report by its unique ID.
 * @param {string} id Unique report ID.
 * @returns {Object|null} Found barrier object or null.
 */
export function getBarrierReportById(id) {
  if (!id) return null;
  const reports = getAllBarrierReports();
  return reports.find(report => report.id === id) || null;
}

/**
 * CREATE: Persists a new barrier report to LocalStorage.
 * @param {Object} reportData Validated report input payload.
 * @returns {Object} Newly generated barrier record with ID and timestamp.
 */
export function createBarrierReport(reportData) {
  const currentReports = getAllBarrierReports();

  const newReport = {
    id: `br_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: String(reportData.title || '').trim(),
    category: reportData.category || 'other', // 'steps' | 'lift' | 'slope' | 'blocked' | 'other'
    severity: reportData.severity || 'medium', // 'low' | 'medium' | 'high'
    notes: String(reportData.notes || '').trim(),
    lat: parseFloat(reportData.lat),
    lng: parseFloat(reportData.lng),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: getSessionUserId()
  };

  const updatedReports = [newReport, ...currentReports];
  saveBarriersToStorage(updatedReports);

  return newReport;
}

/**
 * UPDATE: Mutates an existing barrier report in LocalStorage.
 * @param {string} id Unique report ID.
 * @param {Object} updatedFields Object containing properties to modify.
 * @returns {Object} Updated report object.
 */
export function updateBarrierReport(id, updatedFields) {
  const currentReports = getAllBarrierReports();
  const targetIndex = currentReports.findIndex(report => report.id === id);

  if (targetIndex === -1) {
    throw new Error(`[ReportStore] Barrier record with ID "${id}" not found.`);
  }

  // Preserve ID and creation timestamp while merging updated fields
  const existingRecord = currentReports[targetIndex];
  const mutatedRecord = {
    ...existingRecord,
    title: updatedFields.title ? String(updatedFields.title).trim() : existingRecord.title,
    category: updatedFields.category || existingRecord.category,
    severity: updatedFields.severity || existingRecord.severity,
    notes: updatedFields.notes !== undefined ? String(updatedFields.notes).trim() : existingRecord.notes,
    updatedAt: new Date().toISOString()
  };

  currentReports[targetIndex] = mutatedRecord;
  saveBarriersToStorage(currentReports);

  return mutatedRecord;
}

/**
 * DELETE: Removes a barrier report from LocalStorage by ID.
 * @param {string} id Unique report ID.
 * @returns {boolean} True if successfully removed, false otherwise.
 */
export function deleteBarrierReport(id) {
  const currentReports = getAllBarrierReports();
  const filteredReports = currentReports.filter(report => report.id !== id);

  if (currentReports.length === filteredReports.length) {
    return false; // No record was matched/removed
  }

  saveBarriersToStorage(filteredReports);
  return true;
}

/**
 * Internal helper to safely write array data to LocalStorage with quota handling.
 * @param {Array<Object>} reportsArray 
 */
function saveBarriersToStorage(reportsArray) {
  try {
    localStorage.setItem(BARRIERS_STORAGE_KEY, JSON.stringify(reportsArray));
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error('[ReportStore] LocalStorage quota limit reached!');
      throw new Error('Storage quota exceeded. Please remove older reports before adding new ones.');
    }
    throw error;
  }
}

/* ==========================================================================
   2. USER MOBILITY PREFERENCES MANAGEMENT
   ========================================================================== */

/**
 * Retrieves persisted user preferences, returning default settings if unset.
 * @returns {Object} Preference object.
 */
export function getUserPreferences() {
  try {
    const rawPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!rawPrefs) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(rawPrefs) };
  } catch (error) {
    console.error('[ReportStore] Failed to load preferences:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Saves updated mobility preferences to LocalStorage.
 * @param {Object} preferences Partial or full preference updates.
 * @returns {Object} Consolidated preferences object.
 */
export function saveUserPreferences(preferences) {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };

  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[ReportStore] Failed to save preferences:', error);
  }

  return updated;
}

/* ==========================================================================
   3. SEARCH HISTORY UTILITIES
   ========================================================================== */

/**
 * Retrieves recently searched route pairs.
 * @returns {Array<Object>} Array of recent search objects.
 */
export function getRecentSearchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Appends a search query pair to recent history (capped at 5 recent items).
 * @param {string} start Search start point text.
 * @param {string} destination Search destination text.
 */
export function pushSearchHistory(start, destination) {
  if (!start || !destination) return;

  const history = getRecentSearchHistory();
  const newEntry = { start, destination, timestamp: Date.now() };

  // Filter duplicate recent entries
  const filtered = history.filter(
    item => !(item.start.toLowerCase() === start.toLowerCase() && item.destination.toLowerCase() === destination.toLowerCase())
  );

  const updatedHistory = [newEntry, ...filtered].slice(0, 5); // Keep top 5

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.warn('[ReportStore] Failed to save search history:', e);
  }
}

/* ==========================================================================
   4. SESSION IDENTIFIER HELPER
   ========================================================================== */

/**
 * Generates or retrieves an anonymous session user ID for author tracking.
 * @returns {string} Anonymous author ID string.
 */
function getSessionUserId() {
  let userId = sessionStorage.getItem('accessway_session_user_id');
  if (!userId) {
    userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
    sessionStorage.setItem('accessway_session_user_id', userId);
  }
  return userId;
}