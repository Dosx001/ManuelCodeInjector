const TBODY = document.querySelector("tbody")!;
const CLONE = document.getElementById("clone")!;
let LOCAL: string[];
let SYNC: string[];

const getInfo = (ele: HTMLElement) => {
  const key = ele.querySelector<HTMLSelectElement>(".key")!.value;
  return {
    id: `${key}${Array.from(
      ele.querySelector(".mods")!.querySelectorAll<HTMLInputElement>("input")
    )
      .map((ele) => Number(ele.checked))
      .reduce((sum, cur, i) =>
        cur ? (i === 2 ? sum + 4 : sum + i + 1) : sum
      )}`,
    key: key,
    sync: ele.querySelector<HTMLInputElement>(".sync")!.checked,
    code: ele.querySelector<HTMLTextAreaElement>(".code")!.value,
  };
};

const replace = (tr: HTMLElement, id: string) => {
  tr.children[0].innerHTML = "";
  const save = document.createElement("button");
  save.innerText = "Save";
  save.style.marginBottom = ".5rem";
  save.onclick = (ev) => {
    (
      ev.target as HTMLElement
    ).parentElement!.parentElement!.querySelector<HTMLInputElement>(
      ".sync"
    )!.disabled = false;
    const parent = (ev.target as HTMLElement).parentElement!.parentElement!;
    const info = getInfo(parent);
    if (parent.id !== info.id && document.getElementById(info.id)) {
      alert("Hotkey are ready exists!");
      return;
    }
    const data = new Map();
    data.set(info.id, info.code);
    if (info.sync) {
      SYNC[SYNC.findIndex((val) => val === parent.id)] = info.id;
      browser.storage.sync
        .set({ sync: SYNC })
        .then(() => {
          browser.storage.sync.set(Object.fromEntries(data));
          if (parent.id !== info.id) {
            browser.storage.sync.remove(parent.id);
            parent.id = info.id;
          }
        })
        .then(() => {
          browser.storage.sync.getBytesInUse(info.id).then((res) => {
            tr.querySelector<HTMLElement>(
              ".size"
            )!.innerText = `${res.toString()} B`;
          });
        });
    } else {
      LOCAL[LOCAL.findIndex((val) => val === parent.id)] = info.id;
      browser.storage.local.set({ local: LOCAL }).then(() => {
        browser.storage.local.set(Object.fromEntries(data));
        if (parent.id !== info.id) {
          browser.storage.local.remove(parent.id);
          parent.id = info.id;
        }
      });
    }
  };
  tr.children[0].append(save);
  const del = document.createElement("button");
  del.onclick = (ev) => {
    const parent = (ev.target as HTMLElement).parentElement!.parentElement!;
    if (parent.querySelector<HTMLInputElement>(".sync")!.checked) {
      SYNC = SYNC.filter((val) => val !== parent.id);
      browser.storage.sync.set({ sync: SYNC }).then(() => {
        browser.storage.sync.remove(id);
      });
    } else {
      LOCAL = LOCAL.filter((val) => val !== parent.id);
      browser.storage.local.set({ local: LOCAL }).then(() => {
        browser.storage.local.remove(id);
      });
    }
    parent.remove();
  };
  del.innerText = "Delete";
  tr.children[0].append(del);
  tr.id = id;
};

const syncInput = (ev: Event) => {
  const parent = (ev.target as HTMLButtonElement)!.parentElement!
    .parentElement!;
  const info = getInfo(parent);
  const data = new Map();
  data.set(info.id, info.code);
  if (info.sync) {
    LOCAL = LOCAL.filter((val) => val !== info.id);
    browser.storage.local.set({ local: LOCAL }).then(() => {
      browser.storage.local.remove(parent.id);
    });
    SYNC.push(info.id);
    browser.storage.sync
      .set({ sync: SYNC })
      .then(() => {
        browser.storage.sync.set(Object.fromEntries(data));
      })
      .then(() => {
        browser.storage.sync.getBytesInUse(info.id).then((res) => {
          parent.querySelector<HTMLElement>(
            ".size"
          )!.innerText = `${res.toString()} B`;
        });
      });
  } else {
    SYNC = SYNC.filter((val) => val !== info.id);
    browser.storage.sync.set({ sync: SYNC }).then(() => {
      browser.storage.sync.remove(parent.id);
    });
    LOCAL.push(info.id);
    browser.storage.local.set({ local: LOCAL }).then(() => {
      browser.storage.local.set(Object.fromEntries(data));
    });
  }
};

const tab = (ev: KeyboardEvent) => {
  if (ev.key === "Tab") {
    ev.preventDefault();
    const ele = ev.target as HTMLTextAreaElement;
    const start = ele.selectionStart;
    ele.value =
      ele.value.substring(0, start) +
      "\t" +
      ele.value.substring(ele.selectionEnd);
    ele.selectionStart = ele.selectionEnd = start + 1;
  } else if (ev.key === "Escape") {
    (ev.target as HTMLElement).blur();
  }
};

const updateSize = (ev: Event) => {
  (
    ev.target as HTMLElement
  ).parentElement!.parentElement!.querySelector<HTMLElement>(
    ".size"
  )!.innerText = `~${(
    new Blob([(ev.target as HTMLTextAreaElement).value]).size + 4
  ).toString()} B`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mkTr = (list: string[], sync: boolean) => {
  list.forEach((id) => {
    const tr = CLONE.cloneNode(true) as HTMLElement;
    const key = tr.querySelector<HTMLSelectElement>(".key")!;
    key.value = id.substring(0, id.length - 1);
    key.onchange = (ev) => {
      (
        ev.target as HTMLElement
      ).parentElement!.parentElement!.querySelector<HTMLInputElement>(
        ".sync"
      )!.disabled = true;
    };
    const text = tr.querySelector<HTMLTextAreaElement>("textarea")!;
    text.oninput = (ev) => {
      (
        ev.target as HTMLElement
      ).parentElement!.parentElement!.querySelector<HTMLInputElement>(
        ".sync"
      )!.disabled = true;
      updateSize(ev);
    };
    text.onkeydown = (ev) => tab(ev);
    const size = tr.querySelector<HTMLElement>(".size")!;
    const syncEle = tr.querySelector<HTMLInputElement>(".sync")!;
    syncEle.oninput = (ev) => syncInput(ev);
    if (sync) {
      syncEle.checked = sync;
      browser.storage.sync.get(id).then((res) => {
        text.value = Object.values(res)[0] ?? "";
      });
      browser.storage.sync.getBytesInUse(id).then((res) => {
        size.innerText = `${res.toString()} B`;
      });
    } else {
      browser.storage.local.get(id).then((res) => {
        const txt = Object.values(res)[0] ?? "";
        text.value = txt;
        size.innerText = `~${new Blob([txt.value]).size.toString()} B`;
      });
    }
    const mods = tr
      .querySelector(".mods")!
      .querySelectorAll<HTMLInputElement>("input")!;
    mods.forEach((el) => {
      el.onchange = (ev) => {
        (
          ev.target as HTMLElement
        ).parentElement!.parentElement!.parentElement!.querySelector<HTMLInputElement>(
          ".sync"
        )!.disabled = true;
      };
    });
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
};

const code = document.querySelector<HTMLTextAreaElement>(".code")!;
code.oninput = (ev) => {
  updateSize(ev);
};

code.onkeydown = (ev) => {
  tab(ev);
};

document.getElementById("submit")!.onclick = () => {
  const info = getInfo(document.body);
  if (document.getElementById(info.id)) {
    alert("Hotkey are ready exists!");
    return;
  }
  const data = new Map();
  data.set(info.id, info.code);
  if (info.sync) {
    SYNC.push(info.id);
    browser.storage.sync.set({ sync: SYNC }).then(() => {
      browser.storage.sync
        .set(Object.fromEntries(data))
        .then(() => mkTr([info.id], true));
    });
  } else {
    LOCAL.push(info.id);
    browser.storage.local.set({ local: LOCAL }).then(() => {
      browser.storage.local
        .set(Object.fromEntries(data))
        .then(() => mkTr([info.id], false));
    });
  }
};

browser.storage.local.get("local").then((res) => {
  const list: string[] = Object.values(res)[0] ?? [];
  LOCAL = list;
  mkTr(list, false);
});

browser.storage.sync.get("sync").then((res) => {
  const list: string[] = Object.values(res)[0] ?? [];
  SYNC = list;
  mkTr(list, true);
});

const update = () => {
  browser.storage.sync.getBytesInUse(undefined).then((res) => {
    const store = document.querySelector<HTMLElement>("#storage")!.children;
    (store[store.length - 1] as HTMLElement).innerText = `${(
      (102400 - res) /
      1000
    ).toString()} kB`;
  });
};

update();
browser.storage.onChanged.addListener(() => {
  update();
});
