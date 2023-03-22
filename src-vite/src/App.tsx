import { Component, createSignal, For, onCleanup, onMount } from "solid-js";
import Row from "./components/Row";
import "./styles.scss";

export const [drag, setDrag] = createSignal(0);
export const [safe, setSafe] = createSignal(false);

const App: Component = () => {
  const [bytes, setBytes] = createSignal("0 kB");
  const [sync, setSync] = createSignal<string[]>([]);
  const [local, setLocal] = createSignal<string[]>([]);
  const handle = async () => {
    setBytes(
      `${(102400 - (await browser.storage.sync.getBytesInUse())) / 1000} kB`
    );
    setLocal((await browser.storage.local.get("local"))["local"] as string[]);
    setSync((await browser.storage.sync.get("sync"))["sync"] as string[]);
  };
  onMount(() => {
    handle();
    browser.storage.onChanged.addListener(handle);
  });
  onCleanup(() => browser.storage.onChanged.removeListener(handle));
  return (
    <>
      <div>Remaining online storage: {bytes()}</div>
      <div class="mt-1 max-h-[93vh] overflow-auto border-y border-[gray]">
        <table class="w-full border-separate border-spacing-0 border-x border-[gray] bg-[#181a1b]">
          <thead class="sticky top-0 bg-[#181a1b]">
            <tr>
              <th>Actions</th>
              <th>Key</th>
              <th>Modifier</th>
              <th>
                Sync{" "}
                <span
                  class="cursor-help rounded-full border-x-[7px] border-[darkgray] bg-[darkgray] text-black"
                  title="Check to sync hotkey to your Firefox account, limited space is available. If not, hotkey is saved to your local machine."
                >
                  ?
                </span>
              </th>
              <th>Size</th>
              <th>Script</th>
            </tr>
            <Row index={-1} key="" sync={false} get={null} set={null} />
          </thead>
          <tbody>
            <For each={local()}>
              {(key, i) => (
                <Row
                  index={i()}
                  key={key}
                  sync={false}
                  get={local}
                  set={setLocal}
                />
              )}
            </For>
          </tbody>
          <tfoot>
            <For each={sync()}>
              {(key, i) => (
                <Row
                  index={i()}
                  key={key}
                  sync={true}
                  get={sync}
                  set={setSync}
                />
              )}
            </For>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default App;
