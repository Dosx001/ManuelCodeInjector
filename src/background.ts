browser.runtime.onMessage.addListener((req) => {
  browser.storage.local.get(req.key).then((res) => {
    const code = Object.values(res)[0];
    if (code) {
      browser.tabs.executeScript({
        code: code,
      });
    }
  });
});
