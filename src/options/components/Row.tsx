import { Accessor, onMount, Setter, Show } from "solid-js";
import { drag, safe, setDrag, setSafe } from "../App";
import Keys from "./Keys";

const Row = (props: {
  index: number;
  key: string;
  sync: boolean;
  get: Accessor<string[]> | null;
  set: Setter<string[]> | null;
}) => {
  let key!: HTMLSelectElement;
  let mods!: HTMLTableCellElement;
  let sync!: HTMLInputElement;
  let size!: HTMLTableCellElement;
  let code!: HTMLTextAreaElement;
  onMount(async () => {
    if (!props.key) return;
    key.value = props.key.substring(0, props.key.length - 1);
    if (props.sync) {
      sync.checked = true;
      code.value = (
        (await browser.storage.sync.get(props.key)) as { [key: string]: string }
      )[props.key];
      size.innerText = `${await browser.storage.sync.getBytesInUse(
        props.key,
      )} B`;
    } else {
      code.value = (
        (await browser.storage.local.get(props.key)) as {
          [key: string]: string;
        }
      )[props.key];
      size.innerText = `~${new Blob([code.value.valueOf()]).size} B`;
    }
    const fn = (nums: number[]) => {
      const m = mods.querySelectorAll("input");
      for (const i of nums) {
        m[i].checked = true;
      }
    };
    switch (props.key.charAt(props.key.length - 1)) {
      case "1":
        fn([0]);
        break;
      case "2":
        fn([1]);
        break;
      case "3":
        fn([0, 1]);
        break;
      case "4":
        fn([2]);
        break;
      case "5":
        fn([0, 2]);
        break;
      case "6":
        fn([1, 2]);
        break;
      case "7":
        fn([0, 1, 2]);
        break;
    }
  });
  const getModKey = () =>
    `${key.value}${Array.from(mods.querySelectorAll("input")).reduce(
      (sum, el, i) => (el.checked ? (i === 2 ? sum + 4 : sum + i + 1) : sum),
      0,
    )}`;
  const disable = () => {
    if (props.key !== "") sync.disabled = true;
  };
  return (
    <tr
      id={props.key}
      draggable={props.key !== ""}
      style={{ cursor: props.key.length ? "grab" : "" }}
      onDragStart={(ev) => {
        setDrag(props.index);
        setSafe(props.sync);
        ev.currentTarget.classList.add("hide");
      }}
      onDragOver={() => {
        if (props.index === -1 || props.sync !== safe()) return;
        const keys = Array.from(props.get!());
        const i = props.index;
        const dg = drag();
        setDrag(i);
        [keys[i], keys[dg]] = [keys[dg]!, keys[i]!];
        props.set!(keys);
      }}
      onDragEnd={(ev) => {
        ev.currentTarget.classList.remove("hide");
        props.sync
          ? browser.storage.sync.set({ sync: props.get!() })
          : browser.storage.local.set({ local: props.get!() });
      }}
    >
      <td class="w-16 text-center">
        <Show
          when={props.get}
          fallback={
            <button
              type="button"
              onClick={async () => {
                const mkey = getModKey();
                if (document.getElementById(mkey))
                  return alert("Hotkey are ready exists!");
                const txt = code.value;
                if (sync.checked) {
                  const keys: string[] =
                    (await browser.storage.sync.get("sync"))["sync"] || [];
                  keys.unshift(mkey);
                  browser.storage.sync.set({ [mkey]: txt, sync: keys });
                } else {
                  const keys: string[] =
                    (await browser.storage.local.get("local"))["local"] || [];
                  keys.unshift(mkey);
                  browser.storage.local.set({ [mkey]: txt, local: keys });
                }
                key.value = "A";
                mods
                  .querySelectorAll("input")
                  .forEach((e) => (e.checked = false));
                sync.checked = false;
                size.innerText = "-";
                code.value = "";
              }}
            >
              Add
            </button>
          }
        >
          <button
            class="mb-2"
            onClick={() => {
              const mkey = getModKey();
              if (props.key !== mkey && document.getElementById(mkey))
                return alert("Hotkey are ready exists!");
              props.get!()[props.get!().findIndex((id) => id === props.key)] =
                mkey;
              if (sync.checked) {
                browser.storage.sync.set({
                  [mkey]: code.value,
                  sync: props.get!(),
                });
                if (props.key !== mkey) browser.storage.sync.remove(props.key);
              } else {
                browser.storage.local.set({
                  [mkey]: code.value,
                  local: props.get!(),
                });
                if (props.key !== mkey) browser.storage.local.remove(props.key);
              }
              sync.disabled = false;
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              const keys = props.get!().filter((id) => id !== props.key);
              if (sync.checked) {
                browser.storage.sync.set({ sync: keys });
                browser.storage.sync.remove(props.key);
              } else {
                browser.storage.local.set({ local: keys });
                browser.storage.local.remove(props.key);
              }
            }}
          >
            Delete
          </button>
        </Show>
      </td>
      <td class="w-16 text-center">
        <select
          ref={key}
          autocomplete="off"
          class="cursor-pointer rounded border border-[#484848] bg-black text-[darkgray]"
          onChange={disable}
        >
          <Keys />
        </select>
      </td>
      <td ref={mods} class="w-16 text-left">
        <div>
          <input type="checkbox" autocomplete="off" onChange={disable} />
          Shift
        </div>
        <div>
          <input type="checkbox" autocomplete="off" onChange={disable} />
          Ctrl
        </div>
        <div>
          <input type="checkbox" autocomplete="off" onChange={disable} />
          Alt
        </div>
      </td>
      <td class="w-16 text-center">
        <input
          ref={sync}
          type="checkbox"
          autocomplete="off"
          onInput={async () => {
            if (props.key === "") return;
            const filter = props.get!().filter((id) => id !== props.key);
            if (props.sync) {
              const keys: string[] =
                (await browser.storage.local.get("local"))["local"] || [];
              keys.unshift(props.key);
              browser.storage.local.set({
                [props.key]: code.value,
                local: keys,
              });
              browser.storage.sync.set({ sync: filter });
              browser.storage.sync.remove(props.key);
            } else {
              const keys: string[] =
                (await browser.storage.sync.get("sync"))["sync"] || [];
              keys.unshift(props.key);
              browser.storage.sync.set({
                [props.key]: code.value,
                sync: keys,
              });
              browser.storage.local.set({ local: filter });
              browser.storage.local.remove(props.key);
            }
          }}
        />
      </td>
      <td ref={size} class="w-16 text-center">
        -
      </td>
      <td>
        <textarea
          ref={code}
          cols="40"
          rows="5"
          placeholder="Type code here"
          autocomplete="off"
          spellcheck={false}
          class="w-[99%] border border-[#484848] bg-black text-[darkgray]"
          onInput={() => {
            disable();
            size.innerText = `~${new Blob([code.value]).size + 4} B`;
          }}
        />
      </td>
    </tr>
  );
};

export default Row;
