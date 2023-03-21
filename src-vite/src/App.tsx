import { Component, createSignal, For, onMount } from "solid-js";
import browser from "webextension-polyfill";
import Row from "./components/Row";
import "./styles.scss";

const App: Component = () => {
  const [bytes, setBytes] = createSignal("0 kB");
  const [sync, setSync] = createSignal<string[]>([]);
  const [local, setLocal] = createSignal<string[]>([]);
  onMount(async () => {
    setBytes(
      `${(102400 - (await browser.storage.sync.getBytesInUse())) / 1000} kB`
    );
    setLocal((await browser.storage.local.get("local"))["local"] as string[]);
    setSync((await browser.storage.sync.get("sync"))["sync"] as string[]);
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
            <Row key="" sync={false} />
          </thead>
          <tbody>
            <For each={local()}>{(key) => <Row key={key} sync={false} />}</For>
          </tbody>
          <tfoot>
            <For each={sync()}>{(key) => <Row key={key} sync={true} />}</For>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default App;
