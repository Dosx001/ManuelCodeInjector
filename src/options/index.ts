const TBODY = document.querySelector("tbody")!;
const CLONE = document.getElementById("clone")!;
let LOCAL: string[];
let SYNC: string[];

const getInfo = (ele: HTMLElement) => {
  const key = ele.querySelector<HTMLSelectElement>(".key")!.value;
  return {
    id: `${key}${Array.from(
      ele.querySelector(".mods")!.querySelectorAll("input")
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
            tr.querySelector<HTMLElement>(".size")!.innerText = `${res} B`;
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
  const parent = (ev.target as HTMLElement)!.parentElement!.parentElement!;
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
          parent.querySelector<HTMLElement>(".size")!.innerText = `${res} B`;
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
  } else if (ev.key === "Escape") (ev.target as HTMLElement).blur();
};

const updateSize = (ev: Event) => {
  (
    ev.target as HTMLElement
  ).parentElement!.parentElement!.querySelector<HTMLElement>(
    ".size"
  )!.innerText = `~${new Blob([(ev.target as HTMLTextAreaElement).value]).size + 4
    } B`;
};

const mkTr = (list: string[], sync: boolean) => {
  for (const id of list) {
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
    const text = tr.querySelector("textarea")!;
    text.onkeydown = tab;
    text.oninput = (ev) => {
      (
        ev.target as HTMLElement
      ).parentElement!.parentElement!.querySelector<HTMLInputElement>(
        ".sync"
      )!.disabled = true;
      updateSize(ev);
    };
    const size = tr.querySelector<HTMLElement>(".size")!;
    const syncEle = tr.querySelector<HTMLInputElement>(".sync")!;
    syncEle.oninput = syncInput;
    if (sync) {
      syncEle.checked = sync;
      browser.storage.sync
        .get(id)
        .then((res) => (text.value = Object.values(res)[0] ?? ""));
      browser.storage.sync
        .getBytesInUse(id)
        .then((res) => (size.innerText = `${res} B`));
    } else
      browser.storage.local.get(id).then((res) => {
        text.value = Object.values(res)[0] ?? "";
        size.innerText = `~${new Blob([text.value.valueOf()]).size} B`;
      });

    const mods = tr.querySelector(".mods")!.querySelectorAll("input")!;
    for (const el of mods)
      el.onchange = (ev) => {
        (
          ev.target as HTMLElement
        ).parentElement!.parentElement!.parentElement!.querySelector<HTMLInputElement>(
          ".sync"
        )!.disabled = true;
      };
    const fn = (nums: number[]) => {
      for (const i of nums) mods[i].checked = true;
    };
    switch (id.charAt(id.length - 1)) {
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
    replace(tr, id);
    TBODY.append(tr);
  }
};

const code = document.querySelector<HTMLTextAreaElement>(".code")!;
code.oninput = updateSize;
code.onkeydown = tab;

document.getElementById("submit")!.onclick = () => {
  const info = getInfo(TBODY);
  if (document.getElementById(info.id))
    return alert("Hotkey are ready exists!");
  document.querySelector<HTMLSelectElement>(".key")!.value = "A";
  document.querySelector<HTMLTextAreaElement>(".code")!.value = "";
  document.querySelector<HTMLInputElement>(".sync")!.checked = false;
  document.querySelector<HTMLElement>(".size")!.innerText = "-";
  for (const el of document.querySelector(".mods")!.querySelectorAll("input"))
    el.checked = false;
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
  LOCAL = Object.values(res)[0] ?? [];
  mkTr(LOCAL, false);
});

browser.storage.sync.get("sync").then((res) => {
  SYNC = Object.values(res)[0] ?? [];
  mkTr(SYNC, true);
});

const update = async () => {
  const store = document.querySelector("#storage")!.children;
  (store[store.length - 1] as HTMLElement).innerText = `${(102400 - (await browser.storage.sync.getBytesInUse())) / 1000
    } kB`;
};
update();
browser.storage.onChanged.addListener(update);
