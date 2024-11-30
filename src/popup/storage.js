/**
 * Retrieves the list of selected texts from local storage and passes it to the displayList callback
 *
 * @param {function(Array<string>)} displayList - Callback function to handle the retrieved list
 * @return {void}
 */
export function getSelectedTextList(displayList) {
  chrome.storage.local.get({ selectedTextList: [] }, (data) => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving data:', chrome.runtime.lastError.message);
      return;
    }

    if (!data || data.selectedTextList === undefined) {
      console.error("The selected text doesn't exist in storage");
      return;
    }

    displayList(data.selectedTextList);
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
    if (chrome.runtime.lastError) {
      console.error('Error updating storage:', chrome.runtime.lastError);
    }

    console.log(updatedList);
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
    if (chrome.runtime.lastError) {
      console.error('Error removing key:', chrome.runtime.lastError);
      return;
    }

    callback();
  });
}
