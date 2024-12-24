const messages = [
  'Noted.',
  'Got it.',
  'Boom. Stored.',
  'Done. What’s next?',
  'Nice. It’s in.',
  'Added. Next move?',
  'Boom. It’s saved.',
  'Snagged it!',
  'Locked and loaded.',
  'Noted for posterity.',
  'Idea secured. Carry on.',
  'Another win. Stored.',
  'Clean save. Nice work.',
  'Consider it done.',
  'Good move. It’s safe.',
  'All set. What’s next?',
  'Done deal.',
  'Cool. It’s saved.',
  'Stacking ideas like pros.',
];

let selectionOverlay = null;
let selectionBox = null;
let isSelecting = false;
let startX, startY, currentX, currentY;
const devicePixelRatio = window.devicePixelRatio || 1;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startSelection':
      createSelectionOverlay();
      break;
    case 'getSelection':
      const selected = window.getSelection().toString();
      sendResponse({ selectedText: selected });
      break;
    case 'showFeedback':
      showToast(getRandomMessage());
      break;
    default:
      break;
  }
});

function createSelectionOverlay() {
  // is it already exists
  if (selectionOverlay) return;
  console.log('Selection in progress..');
  // css style
  selectionOverlay = document.createElement('div');
  selectionOverlay.style = `
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.2);
    cursor: crosshair;
    z-index: 999999;
  `;

  selectionBox = document.createElement('div');
  selectionBox.style = `position:absolute; border:2px dashed #fff;`;

  selectionOverlay.append(selectionBox);
  document.body.appendChild(selectionOverlay);

  selectionOverlay.addEventListener('mousedown', onMouseDown);
  selectionOverlay.addEventListener('mousemove', onMouseMove);
  selectionOverlay.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
}

function onMouseMove(e) {
  if (!isSelecting) return;

  currentX = e.clientX;
  currentY = e.clientY;

  const width = currentX - startX;
  const height = currentY - startY;

  selectionBox.style.left = Math.min(startX, currentX) + 'px';
  selectionBox.style.top = Math.min(startY, currentY) + 'px';
  selectionBox.style.width = Math.abs(width) + 'px';
  selectionBox.style.height = Math.abs(height) + 'px';
}

function onMouseUp(e) {
  isSelecting = false;

  const finalX = Math.min(startX, currentX);
  const finalY = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const scaledX = (finalX + scrollX) * devicePixelRatio;
  const scaledY = (finalY + scrollY) * devicePixelRatio;
  const scaledW = width * devicePixelRatio;
  const scaledH = height * devicePixelRatio;

  const data = {
    action: 'selectedArea',
    startX: scaledX,
    startY: scaledY,
    width: scaledW,
    height: scaledH,
  };

  chrome.runtime.sendMessage(data);

  selectionOverlay.remove();
  selectionOverlay = null;
}

/**
 * Returns a random feedback message from the global 'messages' array
 *
 * @returns {string}
 */
function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Shows a toast message.
 *
 * @param {string} message
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'note-toast';

  document.body.appendChild(toast);

  const style = document.createElement('style');
  style.textContent = `
    .note-toast {
      all: unset;
      font-family: Arial, sans-serif;
      font-size: 14px;
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      transition: opacity 0.5s ease;
      opacity: 1;
    }

    .note-toast.hide {
      opacity: 0;
    }
  `;

  document.head.appendChild(style);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 500);
  }, 3000);
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { showToast };
}
