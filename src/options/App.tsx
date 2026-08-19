import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import Row from "./components/Row";
import "./styles.scss";

export const [drag, setDrag] = createSignal(0);
export const [safe, setSafe] = createSignal(false);

const App: Component = () => {
  const [bytes, setBytes] = createSignal("0 kB");
  const [sync, setSync] = createSignal<string[]>([]);
  const [local, setLocal] = createSignal<string[]>([]);
  const [toggle, setToggle] = createSignal(true);
  const handle = async () => {
    setBytes(
      `${(102400 - (await browser.storage.sync.getBytesInUse())) / 1000} kB`,
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
      <div class="mt-2 flex w-max border-2 border-y border-t-2 border-[gray]">
        <div class="border-r-2 border-[gray]">
          <input
            type="radio"
            id="sync"
            name="toggle"
            class="peer hidden"
            checked={toggle()}
            onClick={() => setToggle(true)}
          />
          <label
            for="sync"
            class="cursor-pointer px-2 peer-checked:bg-slate-600"
          >
            Online
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="local"
            name="toggle"
            class="peer hidden"
            checked={!toggle()}
            onClick={() => setToggle(false)}
          />
          <label
            for="local"
            class="cursor-pointer px-2 peer-checked:bg-slate-600"
          >
            Local
          </label>
        </div>
      </div>
      <div class="max-h-[93vh] overflow-auto border-y border-[gray]">
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
            <Show
              when={toggle()}
              fallback={
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
              }
            >
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
            </Show>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default App;
