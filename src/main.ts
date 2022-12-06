document.addEventListener("keydown", (ev) => {
  let sum = 0;
  if (ev.shiftKey) {
    sum += 1;
  }
  if (ev.ctrlKey) {
    sum += 2;
  }
  if (ev.altKey) {
    sum += 4;
  }
  const code = ev.code;
  browser.runtime.sendMessage({
    key: `${code.search("Key") + code.search("Digit") === -1 ? code.at(-1) : code
      }${sum}`,
  });
});
