// General communication logic for any ShinyLive app
export const shinyliveCommunicator = {
  initialize(iframeSelector) {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver((mutations, observerInstance) => {
        const iframe = document.querySelector(iframeSelector);
        if (iframe) {
          observerInstance.disconnect(); // Stop observing once iframe is found

          // Wait for Shiny-ready message
          this.waitForMessage(iframe, 'shiny-ready').then(() => resolve(iframe));
        }
      });

      // Observe the DOM for the iframe
      const target = document.querySelector(iframeSelector.split(' ')[0]);
      if (target) {
        observer.observe(target, { childList: true, subtree: true });
      } else {
        reject(new Error('Target for iframe not found.'));
      }
    });
  },

  sendMessage(iframe, action, body) {
    iframe.contentWindow.postMessage({ action, body }, '*');
  },

  waitForMessage(iframe, action) {
    return new Promise((resolve) => {
      const handleMessage = (event) => {
        if (
          event.data.action === action &&
          event.origin === window.location.origin &&
          event.source === iframe.contentWindow
        ) {
          resolve(event.data);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },
};
