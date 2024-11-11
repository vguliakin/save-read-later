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

export function updateSelectedTextList(updatedList, callback) {
  chrome.storage.local.set({ selectedTextList: updatedList }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error updating storage:', chrome.runtime.lastError);
    }
    
    callback();
  });
}

export function clearSelectedTextList(callback) {
  chrome.storage.local.remove('selectedTextList', () => {
    if (chrome.runtime.lastError) {
      console.error('Error removing key:', chrome.runtime.lastError);
      return;
    }

    callback();
  });
}
