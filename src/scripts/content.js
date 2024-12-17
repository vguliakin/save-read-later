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

/**
 * Returns a random feedback message.
 *
 * @param {string} messages
 */
function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'getSelection') {
    const selected = window.getSelection().toString();
    sendResponse({ selectedText: selected });
  } else if (request.action === 'showFeedback') {
    showToast(getRandomMessage());
  }
});

/**
 * Shows a toast message.
 *
 * @param {string} message
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'toast';

  const style = document.createElement('style');
  style.textContent = `
    .toast {
      all: unset;
      font-family: Arial, sans-serif;
      font-size: 1rem;
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

    .toast.hide {
      opacity: 0;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(toast);

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
