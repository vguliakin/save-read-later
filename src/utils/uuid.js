/**
 * Generates a simple unique ID if crypto.randomUUID is not available.
 * @returns {string}
 */
export function generateUniqueID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
