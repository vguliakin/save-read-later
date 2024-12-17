function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'saveToBrain',
    title: 'Add random color to Popup',
    contexts: ['selection'],
  });
}

/**
 * Generates a simple unique ID if crypto.randomUUID is not available.
 * @returns {string}
 */
function generateUniqueID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Handles the click event for the context menu item.
 * Adds the selected text to the stored list in a local storage.
 *
 * @param info - Information about the item clicked and the selected text.
 * @param tab - The details of the active tab at the time of the click event
 */
function handleContextMenuClick(info, tab) {
  if (info.menuItemId === 'saveToBrain' && info.selectionText) {
    chrome.storage.local.get({ selectedTextList: [] }, (data) => {
      const existingNotes = data.selectedTextList || [];

      const newNote = {
        id: generateUniqueID(),
        text: info.selectionText.trim(),
      };

      const updatedList = [...existingNotes, newNote];

      chrome.storage.local.set({ selectedTextList: updatedList }, () => {
        const err = chrome.runtime.lastError;
        if (err) {
          console.error('Error saving data:', err.message);
        } else {
          chrome.tabs.sendMessage(tab.id, { action: 'showFeedback' });
        }
      });
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    setupContextMenu,
    handleContextMenuClick,
  };
}
