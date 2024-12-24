chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'cropImage') {
    const { dataUrl, sx, sy, sw, sh } = message;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const croppedDataUrl = canvas.toDataURL('image/png');

      // Send the cropped result back to background
      chrome.runtime.sendMessage({
        action: 'croppedResult',
        dataUrl: croppedDataUrl,
      });
    };
    img.onerror = (err) => {
      console.error('Error loading image in offscreen doc:', err);
      chrome.runtime.sendMessage({ action: 'cropError', error: err.message });
    };
    img.src = dataUrl;
  }
});
