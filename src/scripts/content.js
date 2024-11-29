chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showFeedback') {
    showToast(`Successfully added: "${message.text}"`);
  }
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;

  // Inject dynamic styles for the toast
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      all: unset;
      toast.style.fontFamily = "Arial, sans-serif";
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

    .dynamic-toast.hide {
      opacity: 0;
    }
  `;

  document.head.appendChild(style);

  // Apply the CSS to the toast
  toast.className = 'toast';
  document.body.appendChild(toast);

  // Automatically
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 500);
  }, 3000);
}
