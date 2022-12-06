const TBODY = document.querySelector("tbody")!;
const CLONE = document.getElementById("clone")!;
let LIST: string[];

const getInfo = (ele: HTMLElement) => {
  const key = ele.querySelector<HTMLSelectElement>("#key")!.value;
  return {
    id: `${key}${Array.from(
      ele.querySelector("#mods")!.querySelectorAll<HTMLInputElement>("input")
    )
      .map((ele) => Number(ele.checked))
      .reduce((sum, cur, i) =>
        cur ? (i === 2 ? sum + 4 : sum + i + 1) : sum
      )}`,
    key: key,
    sync: ele.querySelector<HTMLInputElement>("#sync")!.checked,
    code: ele.querySelector<HTMLTextAreaElement>("#code")!.value,
  };
};

const replace = (tr: HTMLElement, id: string) => {
  tr.children[0].innerHTML = "";
  const save = document.createElement("button");
  save.innerText = "Save";
  save.style.marginBottom = ".5rem";
  save.onclick = (ev) => {
    const parent = (ev.target as HTMLElement).parentElement!.parentElement!;
    const info = getInfo(parent);
    if (parent.id !== info.id && document.getElementById(info.id)) {
      alert("Hotkey are ready exists!");
      return;
    }
    LIST[LIST.findIndex((val) => val === parent.id)] = info.id;
    browser.storage.local.set({ list: LIST }).then(() => {
      const data = new Map();
      data.set(info.id, info.code);
      browser.storage.local.set(Object.fromEntries(data));
      if (parent.id !== info.id) {
        browser.storage.local.remove(parent.id);
        parent.id = info.id;
      }
    });
  };
  tr.children[0].append(save);
  const del = document.createElement("button");
  del.onclick = (ev) => {
    const parent = (ev.target as HTMLElement).parentElement!.parentElement!;
    parent.remove();
    LIST = LIST.filter((val) => val !== parent.id);
    browser.storage.local.set({ list: LIST }).then(() => {
      browser.storage.local.remove(id);
    });
  };
  del.innerText = "Delete";
  tr.children[0].append(del);
  tr.id = id;
};

browser.storage.local.get("list").then((res) => {
  LIST = res.list ?? [];
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
      case "5":
        opts = [0, 2];
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
  const info = getInfo(document.body);
  if (document.getElementById(info.id)) {
    alert("Hotkey are ready exists!");
    return;
  }
  const tr = CLONE.cloneNode(true) as HTMLElement;
  replace(tr, info.id);
  tr.querySelector<HTMLSelectElement>("#key")!.value = info.key;
  TBODY.append(tr);
  LIST.push(info.id);
  info.sync
    ? browser.storage.sync.set({ list: LIST })
    : browser.storage.local.set({ list: LIST }).then(() => {
      const data = new Map();
      data.set(info.id, info.code);
      browser.storage.local.set(Object.fromEntries(data));
    });
};
