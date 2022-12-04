const tbody = document.querySelector("tbody")!;
document.getElementById("submit")!.onclick = (ev) => {
  const key = document.querySelector<HTMLSelectElement>("#key")!.value;
  const mods = Array.from(
    document.getElementById("mods")!.querySelectorAll<HTMLInputElement>("input")
  ).map((ele) => ele.checked);
  const sync = document.querySelector<HTMLInputElement>("#sync")!.checked;
  const code = document.querySelector<HTMLTextAreaElement>("#code")!.value;
  let val = 0;
  for (let i = 0; i < 3; i++) {
    if (mods[i]) {
      val += i + 1;
    }
  }
  const tr = (ev.target as HTMLElement).parentNode!.parentNode!.cloneNode(
    true
  ) as HTMLElement;
  tr.children[0].innerHTML = "";
  const save = document.createElement("button");
  save.innerText = "Save";
  save.style.marginBottom = ".5rem";
  tr.children[0].append(save);
  const del = document.createElement("button");
  del.innerText = "Delete";
  tr.children[0].append(del);
  tbody.append(tr);
  // const obj = new Map();
  // obj.set(`${key}${val}`, code);
  // if (sync) {
  //   browser.storage.sync.set(Object.fromEntries(obj));
  // } else {
  //   browser.storage.local.set(Object.fromEntries(obj));
  // }
};
