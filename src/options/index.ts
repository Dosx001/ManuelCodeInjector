const TBODY = document.querySelector("tbody")!;
const CLONE = document.getElementById("clone")!;
let LIST: string[];
const replace = (tr: HTMLElement, id: string) => {
  tr.children[0].innerHTML = "";
  const save = document.createElement("button");
  save.innerText = "Save";
  save.style.marginBottom = ".5rem";
  tr.children[0].append(save);
  const del = document.createElement("button");
  del.innerText = "Delete";
  tr.children[0].append(del);
  tr.id = id;
};

browser.storage.local.get("list").then((res) => {
  LIST = Object.values(res)[0] ?? [];
  LIST.forEach((id) => {
    const tr = CLONE.cloneNode(true) as HTMLElement;
    tr.querySelector<HTMLSelectElement>("#key")!.value = id.substring(
      0,
      id.length - 1
    );
    browser.storage.local.get(id).then((res) => {
      const code = Object.values(res)[0] ?? "";
      tr.querySelector<HTMLTextAreaElement>("textarea")!.value = code;
    });
    const mods = tr
      .querySelector("#mods")!
      .querySelectorAll<HTMLInputElement>("input")!;
    let opts: number[];
    switch (id.charAt(id.length - 1)) {
      case "1":
        opts = [0];
        break;
      case "2":
        opts = [1];
        break;
      case "3":
        opts = [0, 1];
        break;
      case "4":
        opts = [2];
        break;
      case "6":
        opts = [1, 2];
        break;
      case "7":
        opts = [0, 1, 2];
        break;
      default:
        opts = [];
    }
    opts.forEach((i) => (mods[i].checked = true));
    replace(tr, id);
    TBODY.append(tr);
  });
});

document.getElementById("submit")!.onclick = () => {
  const key = document.querySelector<HTMLSelectElement>("#key")!.value;
  const mods = Array.from(
    document.getElementById("mods")!.querySelectorAll<HTMLInputElement>("input")
  ).map((ele) => ele.checked);
  let id: number | string = 0;
  for (let i = 0; i < 3; i++) {
    if (mods[i]) {
      id += i + 1;
    }
  }
  id = `${key}${id}`;
  if (document.getElementById(id)) {
    alert("Hotkey are ready exists!");
    return;
  }
  const sync = document.querySelector<HTMLInputElement>("#sync")!.checked;
  const code = document.querySelector<HTMLTextAreaElement>("#code")!.value;
  const tr = CLONE.cloneNode(true) as HTMLElement;
  replace(tr, id);
  TBODY.append(tr);
  LIST.push(id);
  sync
    ? browser.storage.sync.set({ list: LIST })
    : browser.storage.local.set({ list: LIST }).then(() => {
      const data = new Map();
      data.set(id, code);
      browser.storage.local.set(Object.fromEntries(data));
    });
};
