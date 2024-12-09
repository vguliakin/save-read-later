
function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'saveToBrain',
    title: 'Add random color to Popup',
    contexts: ['selection'],
  });
}

/**
 * Handles the click event for the context menu item.
 * Adds the selected text to the stored list in a local storage.
 *
 * @param info - Information about the item clicked and the selected text.
 * @param tab - The details of the active tab at the time of the click event
 */
function handleContextMenuClick(info, tab) {
  try {
    if (info.menuItemId === 'saveToBrain' && info.selectionText) {
      chrome.storage.local.get({ selectedTextList: [] }, (data) => {
        const updatedList = [...data.selectedTextList, info.selectionText];

        chrome.storage.local.set({ selectedTextList: updatedList }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error saving data:',
              chrome.runtime.lastError.message
            );
          } else {
            chrome.tabs.sendMessage(tab.id, {
              action: 'showFeedback',
              text: info.selectionText,
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
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