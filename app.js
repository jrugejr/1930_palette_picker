const DATA = window.COLOR_ART_DATA;

const storageKey = "ronan_owned_paints_v1";
const bgSelect = document.getElementById("backgroundSelect");
const mainSelect = document.getElementById("mainSelect");
const results = document.getElementById("results");
const resultMeta = document.getElementById("resultMeta");
const paintBox = document.getElementById("paintBox");
const ownedOnly = document.getElementById("ownedOnly");

let ownedPaints = JSON.parse(localStorage.getItem(storageKey) || "[]");

function saveOwned(){
  localStorage.setItem(storageKey, JSON.stringify(ownedPaints));
}

function normalizeMatch(match){
  return (match || "").toLowerCase();
}

function isOwnedColor(colorName){
  const info = DATA.dictionary[colorName] || {};
  const match = normalizeMatch(info.ronanMatch);
  if (!match) return false;

  return DATA.ronanStock.some(stock => {
    const owned = ownedPaints.includes(`${stock.name} - ${stock.code}`);
    if (!owned) return false;
    return match.includes(stock.name.toLowerCase()) || match.includes(stock.code.toLowerCase());
  });
}

function paletteOwnedScore(palette){
  const colors = [palette.background, palette.main, ...palette.accents];
  const owned = colors.filter(isOwnedColor).length;
  return { owned, total: colors.length };
}

function confidenceClass(conf){
  const c = (conf || "unknown").toLowerCase();
  if (c.includes("high")) return "conf-high";
  if (c.includes("medium")) return "conf-medium";
  if (c.includes("low")) return "conf-low";
  return "conf-unknown";
}

function colorBlock(role, color){
  const info = DATA.dictionary[color] || {};
  const match = info.ronanMatch || "No Ronan match yet";
  const confidence = info.confidence || "Unknown";
  return `
    <div class="color-row">
      <span class="role">${role}</span>
      <strong>${color}</strong>
      <span class="match">Ronan: ${match} <span class="${confidenceClass(confidence)}">(${confidence})</span></span>
    </div>
  `;
}

function populatePaintBox(){
  paintBox.innerHTML = DATA.ronanStock.map(stock => {
    const id = `${stock.name} - ${stock.code}`;
    const checked = ownedPaints.includes(id) ? "checked" : "";
    return `
      <label class="paint-check">
        <input type="checkbox" value="${id}" ${checked}>
        <span>${stock.name}</span>
        <span class="paint-code">${stock.code}</span>
      </label>
    `;
  }).join("");

  paintBox.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", e => {
      if(e.target.checked){
        if(!ownedPaints.includes(e.target.value)) ownedPaints.push(e.target.value);
      } else {
        ownedPaints = ownedPaints.filter(p => p !== e.target.value);
      }
      saveOwned();
      renderResults();
    });
  });
}

function populateBackgrounds(){
  bgSelect.innerHTML = `<option value="">Any background</option>` + DATA.backgrounds.map(bg => `<option value="${bg}">${bg}</option>`).join("");
}

function populateMains(){
  const bg = bgSelect.value;
  let mains = DATA.palettes
    .filter(p => !bg || p.background === bg)
    .map(p => p.main);
  mains = [...new Set(mains)].sort();
  mainSelect.innerHTML = `<option value="">Any main copy</option>` + mains.map(m => `<option value="${m}">${m}</option>`).join("");
}

function getFilteredPalettes(){
  const bg = bgSelect.value;
  const main = mainSelect.value;
  let filtered = DATA.palettes.filter(p => (!bg || p.background === bg) && (!main || p.main === main));

  if(ownedOnly.checked){
    filtered = filtered.slice().sort((a,b) => {
      const sa = paletteOwnedScore(a);
      const sb = paletteOwnedScore(b);
      return (sb.owned / sb.total) - (sa.owned / sa.total);
    });
  }
  return filtered;
}

function renderResults(){
  const filtered = getFilteredPalettes();
  document.getElementById("paletteCount").textContent = DATA.palettes.length;
  resultMeta.textContent = `${filtered.length} matching palette${filtered.length === 1 ? "" : "s"}`;

  if(!filtered.length){
    results.innerHTML = `<div class="card"><h3>No palettes found</h3><p class="muted">Try a different background or main copy color.</p></div>`;
    return;
  }

  results.innerHTML = filtered.map(p => {
    const score = paletteOwnedScore(p);
    const accentHtml = p.accents.map((a,i) => colorBlock(`Accent ${i+1}`, a)).join("");
    return `
      <article class="card">
        <h3>Palette #${p.id} <span class="badge">${score.owned}/${score.total} owned</span></h3>
        <div class="color-list">
          ${colorBlock("Background", p.background)}
          ${colorBlock("Main Copy", p.main)}
          ${accentHtml}
        </div>
        <div class="owned-summary">
          ${score.owned === score.total ? "You appear to own matches for this palette." : `Known owned matches: ${score.owned} of ${score.total}`}
        </div>
      </article>
    `;
  }).join("");
}

bgSelect.addEventListener("change", () => {
  populateMains();
  renderResults();
});
mainSelect.addEventListener("change", renderResults);
ownedOnly.addEventListener("change", renderResults);

document.getElementById("clearBtn").addEventListener("click", () => {
  bgSelect.value = "";
  populateMains();
  mainSelect.value = "";
  renderResults();
});

document.getElementById("randomBtn").addEventListener("click", () => {
  const p = DATA.palettes[Math.floor(Math.random() * DATA.palettes.length)];
  bgSelect.value = p.background;
  populateMains();
  mainSelect.value = p.main;
  renderResults();
  window.scrollTo({top: document.querySelector(".results-panel").offsetTop - 16, behavior:"smooth"});
});

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

populatePaintBox();
populateBackgrounds();
populateMains();
renderResults();
