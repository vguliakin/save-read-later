import { getNotes, saveNotes } from './utils/storage.js';
import { generateUniqueID } from './utils/uuid.js';

function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'saveToBrain',
    title: 'Add random color to Popup',
    contexts: ['selection'],
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'selectedArea') {
    const { startX, startY, width, height } = message;

    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!currentTab) return;

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, async (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Capture error:', chrome.runtime.lastError);
        return;
      }

      await ensureOffscreenDocument();

      const handleCropResult = async (response) => {
        if (response.action === 'croppedResult') {
          chrome.runtime.onMessage.removeListener(handleCropResult);

          const notes = await getNotes();
          notes.push({
            id: generateUniqueID(),
            text: 'Screenshot Note',
            image: response.dataUrl,
          });

          await saveNotes(notes);

          chrome.tabs.sendMessage(currentTab.id, { action: 'showFeedback' });
        } else if (response.action === 'cropError') {
          chrome.runtime.onMessage.removeListener(handleCropResult);
          console.error('Error cropping image:', response.error);
        }
      };

      chrome.runtime.onMessage.addListener(handleCropResult);

      chrome.runtime.sendMessage({
        action: 'cropImage',
        dataUrl,
        sx: startX,
        sy: startY,
        sw: width,
        sh: height,
      });
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'add_text') {
    try {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!currentTab?.id) return;

      chrome.tabs.sendMessage(
        currentTab.id,
        { action: 'getSelection' },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error sending message to content script:',
              chrome.runtime.lastError
            );
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
            url: currentTab.url,
          };
          const updatedNotes = [...notes, newNote];

          await saveNotes(updatedNotes);
          console.log('Note saved via shortcut:', newNote);

          chrome.tabs.sendMessage(currentTab.id, { action: 'showFeedback' });
        }
      );
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
        url: tab.url,
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

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  const hasOffScreen = await chrome.offscreen.hasDocument();
  if (!hasOffScreen) {
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.BLOBS],
      justification: 'Crop screenshot images',
    });
  }
}

// async function cropImageDataUrl(fullDataUrl, sx, sy, sw, sh) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.src = fullDataUrl;
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       canvas.width = sw;
//       canvas.height = sh;
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
//       resolve(canvas.toDataURL('image/png'));
//     };

//     img.onerror = reject;
//   });
// }

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
