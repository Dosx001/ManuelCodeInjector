import { Component, createSignal, onMount } from "solid-js";
import browser from "webextension-polyfill";
import "./styles.scss";

const App: Component = () => {
  const [bytes, setBytes] = createSignal("0 kB");
  onMount(async () => {
    setBytes(
      `${(102400 - (await browser.storage.sync.getBytesInUse())) / 1000} kB`
    );
  });
  return (
    <>
      <div>Remaining online storage: {bytes()}</div>
    </>
  );
};

export default App;
