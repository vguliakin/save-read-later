chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showFeedback') {
    showToast(`Successfully added: "${message.text}"`);
  }
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.background = '#4CAF50';
  toast.style.color = 'white';
  toast.style.padding = '10px 15px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.zIndex = '10000';
  toast.style.transition = 'opacity 0.5s ease';
  toast.style.opacity = '1';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000)
}
