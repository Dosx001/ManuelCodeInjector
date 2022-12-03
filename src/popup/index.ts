document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("opts")!.addEventListener("click", () => {
    window.open(browser.runtime.getURL("../options/index.html"));
  });
});
