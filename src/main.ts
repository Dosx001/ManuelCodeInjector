const fix = (code: string) => {
  if (code.search("Key") + code.search("Digit") === -1) {
    return code.charAt(code.length - 1);
  }
  return code;
};

document.addEventListener("keydown", (ev) => {
  browser.runtime.sendMessage({
    key: fix(ev.code),
    ctrl: ev.ctrlKey,
    alt: ev.altKey,
    shift: ev.shiftKey,
  });
});
