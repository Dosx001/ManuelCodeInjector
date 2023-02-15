browser.runtime.onMessage.addListener(async (req) => {
  const sync = (await browser.storage.sync.get(req.key))[req.key];
  if (sync) return browser.tabs.executeScript({ code: sync });
  const local = (await browser.storage.local.get(req.key))[req.key];
  if (local) browser.tabs.executeScript({ code: local });
});
