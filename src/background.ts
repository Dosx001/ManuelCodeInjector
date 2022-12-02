browser.runtime.onMessage.addListener((req) => {
  if (req.key === "Z" && req.ctrl) {
    browser.tabs.executeScript({
      code: 'document.body.style.background="green"',
    });
  }
  if (req.key === "Z" && req.alt) {
    browser.tabs.executeScript({
      code: 'document.body.style.background="black"',
    });
  }
});
