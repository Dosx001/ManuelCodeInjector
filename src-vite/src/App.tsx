import { Component, createSignal, onMount } from "solid-js";
import browser from "webextension-polyfill";
import Row from "./components/Row";
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
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Actions</th>
              <th>Key</th>
              <th>Modifier</th>
              <th>
                Sync
                <span
                  class="bubble"
                  title="Check to sync hotkey to your Firefox account, limited space is available. If not, hotkey is saved to your local machine."
                >
                  ?
                </span>
              </th>
              <th>Size</th>
              <th>Script</th>
            </tr>
            <Row key="" />
          </thead>
          <tbody />
        </table>
      </div>
    </>
  );
};

export default App;
