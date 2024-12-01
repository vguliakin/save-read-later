import { checkExistingInStorage, checkLastError } from '../utils/error_checker.js'

/**
 * Retrieves the list of selected texts from local storage and passes it to the displayList callback
 *
 * @param {function(Array<string>)} callback - Callback function to handle the retrieved list
 * @return {void}
 */
export function getSelectedTextList(callback) {
  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    checkLastError(chrome.runtime.lastError, 'Error retrieval data:');

    checkExistingInStorage(data);

    callback(data.selectedTextList);
  });
}

/**
 * Updates the list of selected texts in local storage.
 *
 * @param {Array<string>} updatedList - The new list of selected textx to store.
 * @param callback - Callback function to execute after the storage update completes.
 * @returns {void}
 */
export function updateSelectedTextList(updatedList, callback) {

  chrome.storage.local.set({ selectedTextList: updatedList }, () => {
    checkLastError(chrome.runtime.lastError, 'Error updating storage:');
    
    callback();
  });
}

/**
 * Removes the selected text list from local storage.
 * @param callback - Callback function to execute after the storage update completes.
 * @returns {void}
 */
export function clearSelectedTextList(callback) {
  chrome.storage.local.remove('selectedTextList', () => {
    checkLastError(chrome.runtime.lastError, 'Error removing key:');

    callback();
  });
}
