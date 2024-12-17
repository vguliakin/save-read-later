import { getNotes, saveNotes } from "./utils/storage.js";
import { generateUniqueID } from "./utils/uuid.js";


function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'saveToBrain',
    title: 'Add random color to Popup',
    contexts: ['selection'],
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'add_text') {
    try {
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!currentTab?.id) return;

      chrome.tabs.sendMessage(currentTab.id, { action: 'getSelection' }, async (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to content script:', chrome.runtime.lastError);
          return;
        }

        if (!response?.selectedText) {
          console.log('No text selected');
          return;
        }

        // TODO : maybe separate it
        const notes = await getNotes();
        const newNote = {
          id: generateUniqueID(),
          text: response.selectedText.trim(),
          url: currentTab.url
        };
        const updatedNotes = [...notes, newNote];

        await saveNotes(updatedNotes);
        console.log('Note saved via shortcut:', newNote);

        chrome.tabs.sendMessage(currentTab.id, { action: 'showFeedback' });
      });
    } catch (err) {
      console.error('Error in onCommand add_text:', err);
    }
  }
});

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
        url: tab.url
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
