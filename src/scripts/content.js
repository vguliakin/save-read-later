/**
 * A class to handle the creation of a selection overlay
 *
 * The User can select are on the page
 */
class SelectionOverlay {
  constructor() {
    this.overlay = null;
    // rectangle box that user can drag
    this.box = null;
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    // for scaled cropping (fixed the size)
    this.dpr = window.devicePixelRatio || 1;
  }

  /**
   * Creates the selection overlay
   */
  create() {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.style = `
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0;
      background: rgba(0,0,0,0.2);
      cursor: crosshair;
      z-index: 999999;
    `;

    this.box = document.createElement('div');
    this.box.style = 'position:absolute; border:2px dashed #fff;';

    this.overlay.appendChild(this.box);
    document.body.appendChild(this.overlay);

    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);

    this.overlay.addEventListener('mousedown', this.onMouseDownBound);
    this.overlay.addEventListener('mousemove', this.onMouseMoveBound);
    this.overlay.addEventListener('mouseup', this.onMouseUpBound);
  }

  /**
   * Removes the overlay
   */
  remove() {
    if (!this.overlay) return;

    this.overlay.removeEventListener('mousedown', this.onMouseDownBound);
    this.overlay.removeEventListener('mousemove', this.onMouseMoveBound);
    this.overlay.removeEventListener('mouseup', this.onMouseUpBound);

    this.overlay.remove();
    this.overlay = null;
    this.box = null;
  }

  onMouseDown(e) {
    this.isSelecting = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.box.style.left = `${this.startX}px`;
    this.box.style.top = `${this.startY}px`;
    this.box.style.width = '0px';
    this.box.style.height = '0px';
  }

  onMouseMove(e) {
    if (!this.isSelecting) return;

    this.currentX = e.clientX;
    this.currentY = e.clientY;

    const width = this.currentX - this.startX;
    const height = this.currentY - this.startY;
    this.box.style.left = `${Math.min(this.startX, this.currentX)}px`;
    this.box.style.top = `${Math.min(this.startY, this.currentY)}px`;
    this.box.style.width = `${Math.abs(width)}px`;
    this.box.style.height = `${Math.abs(height)}px`;
  }

  onMouseUp(e) {
    this.isSelecting = false;

    const finalX = Math.min(this.startX, this.currentX);
    const finalY = Math.min(this.startY, this.currentY);
    const width = Math.abs(this.currentX - this.startX);
    const height = Math.abs(this.currentY - this.startY);

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // fix coords by DPR
    const scaledX = (finalX + scrollX) * this.dpr;
    const scaledY = (finalY + scrollY) * this.dpr;
    const scaledW = width * this.dpr;
    const scaledH = height * this.dpr;

    // sends message to backround script
    chrome.runtime.sendMessage({
      action: 'selectedArea',
      startX: scaledX,
      startY: scaledY,
      width: scaledW,
      height: scaledH,
    });

    this.remove();
  }
}

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

const selectionOverlay = new SelectionOverlay();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startSelection':
      selectionOverlay.create();
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
