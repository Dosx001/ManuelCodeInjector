document.addEventListener("keydown", (ev) => {
  let sum = 0;
  if (ev.shiftKey) sum += 1;
  if (ev.ctrlKey) sum += 2;
  if (ev.altKey) sum += 4;
  const key = ev.code;
  browser.runtime.sendMessage({
    key: `${key.search("Key") + key.search("Digit") === -1 ? key.at(-1) : key
      }${sum}`,
  });
});
