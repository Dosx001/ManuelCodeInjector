import { onMount } from "solid-js";
import browser from "webextension-polyfill";

const Row = (props: { key: string }) => {
  let key!: HTMLSelectElement;
  let mods!: HTMLTableCellElement;
  let size!: HTMLTableCellElement;
  let textarea!: HTMLTextAreaElement;
  onMount(async () => {
    if (!props.key) return;
    key.value = props.key.substring(0, props.key.length - 1);
    textarea.value = (
      (await browser.storage.sync.get(props.key)) as { [key: string]: string }
    )[props.key];
    size.innerText = `${await browser.storage.sync.getBytesInUse(props.key)} B`;
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
  return (
    <tr>
      <td>
        {(props.key.length === 0 && (
          <button type="button" id="submit">
            Add
          </button>
        )) || (
            <>
              <button class="mb-2">Save</button>
              <button>Delete</button>
            </>
          )}
      </td>
      <td>
        <select ref={key} autocomplete="off">
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
          <option value="H">H</option>
          <option value="I">I</option>
          <option value="J">J</option>
          <option value="K">K</option>
          <option value="L">L</option>
          <option value="M">M</option>
          <option value="N">N</option>
          <option value="O">O</option>
          <option value="P">P</option>
          <option value="Q">Q</option>
          <option value="R">R</option>
          <option value="S">S</option>
          <option value="T">T</option>
          <option value="U">U</option>
          <option value="V">V</option>
          <option value="W">W</option>
          <option value="X">X</option>
          <option value="Y">Y</option>
          <option value="Z">Z</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="0">0</option>
          <option value="F1">F1</option>
          <option value="F2">F2</option>
          <option value="F3">F3</option>
          <option value="F4">F4</option>
          <option value="F5">F5</option>
          <option value="F6">F6</option>
          <option value="F7">F7</option>
          <option value="F8">F8</option>
          <option value="F9">F9</option>
          <option value="F10">F10</option>
          <option value="F11">F11</option>
          <option value="F12">F12</option>
        </select>
      </td>
      <td ref={mods}>
        <div>
          <input type="checkbox" autocomplete="off" />
          Shift
        </div>
        <div>
          <input type="checkbox" autocomplete="off" />
          Ctrl
        </div>
        <div>
          <input type="checkbox" autocomplete="off" />
          Alt
        </div>
      </td>
      <td>
        <input class="sync" type="checkbox" autocomplete="off" />
      </td>
      <td ref={size}>-</td>
      <td>
        <textarea
          ref={textarea}
          cols="40"
          rows="5"
          placeholder="Type code here"
          autocomplete="off"
          spellcheck={false}
        />
      </td>
    </tr>
  );
};

export default Row;
