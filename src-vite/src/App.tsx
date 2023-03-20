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
            <tr id="clone">
              <td>
                <button type="button" id="submit">
                  Add
                </button>
              </td>
              <td>
                <select class="key" autocomplete="off">
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
              <td class="mods">
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
              <td class="size">-</td>
              <td>
                <textarea
                  class="code"
                  cols="40"
                  rows="5"
                  placeholder="Type code here"
                  autocomplete="off"
                  spellcheck={false}
                />
              </td>
            </tr>
          </thead>
          <tbody />
        </table>
      </div>
    </>
  );
};

export default App;
