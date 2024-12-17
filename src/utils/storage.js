/**
 * Retrieves the list of notes from Chrome local storage.
 *
 * @returns {Promise<Array<{id: string, text: string}>>}
 */
export async function getNotes() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ selectedTextList: [] }, (data) => {
      const err = chrome.runtime.lastError;

      if (err) {
        console.error('Error retrieving data: ', err.message);
        reject(err);
      } else {
        resolve(data.selectedTextList);
      }
    });
  });
}

/**
 * Saves the given list of notes to Chrome local storage.
 *
 * @param {Array<{id: string, text: string}>} notes
 * @returns {Promise<void>}
 */
export async function saveNotes(notes) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ selectedTextList: notes }, () => {
      const err = chrome.runtime.lastError;

      if (err) {
        console.error('Error updating storage: ', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Clears all notes from Chrome local storage.
 *
 * @returns {Promise<void>}
 */
export async function clearNotes() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove('selectedTextList', () => {
      const err = chrome.runtime.lastError;

      if (err) {
        console.error('Error removing key: ', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
