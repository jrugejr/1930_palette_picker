const DATA = window.COLOR_ART_DATA;

const storageKey = "ronan_owned_paints_v2";
const bgSelect = document.getElementById("backgroundSelect");
const mainSelect = document.getElementById("mainSelect");
const results = document.getElementById("results");
const resultMeta = document.getElementById("resultMeta");
const paintBox = document.getElementById("paintBox");
const formulaBox = document.getElementById("formulaBox");
const ownedOnly = document.getElementById("ownedOnly");
const randomResult = document.getElementById("randomResult");
const randomMeta = document.getElementById("randomMeta");
const archiveResults = document.getElementById("archiveResults");
const buildResults = document.getElementById("buildResults");
const buildMeta = document.getElementById("buildMeta");
const buildSearch = document.getElementById("buildSearch");

let ownedPaints = JSON.parse(localStorage.getItem(storageKey) || "[]");
let currentRandomPalette = null;

function saveOwned(){ localStorage.setItem(storageKey, JSON.stringify(ownedPaints)); }
function normalizeMatch(match){ return (match || "").toLowerCase(); }
function confidenceClass(conf){
  const c = (conf || "unknown").toLowerCase();
  if (c.includes("high")) return "conf-high";
  if (c.includes("medium") || c.includes("med")) return "conf-medium";
  if (c.includes("low")) return "conf-low";
  return "conf-unknown";
}
function getColorInfo(colorName){ return DATA.dictionary[colorName] || {}; }
function swatchFor(colorName){
  const info = getColorInfo(colorName);
  if(info.uiColor) return info.uiColor;
  if(info.primaryFamily && DATA.familySwatches[info.primaryFamily]) return DATA.familySwatches[info.primaryFamily];
  return "#718096";
}
function isOwnedStockName(name){
  return ownedPaints.includes(name);
}
function isOwnedColor(colorName){
  const builds = DATA.colorBuilds[colorName] || [];
  return builds.some(build => build.ingredients.every(isOwnedStockName));
}
function paletteOwnedScore(palette){
  const colors = [palette.background, palette.main, ...palette.accents];
  const owned = colors.filter(isOwnedColor).length;
  return { owned, total: colors.length };
}
function buildSummary(colorName){
  const builds = DATA.colorBuilds[colorName] || [];
  if(!builds.length) return "Build: not mapped yet";
  const best = builds[0];
  return `${best.type}: ${best.ronanColor}`;
}
function colorBlock(role, color){
  const info = getColorInfo(color);
  const confidence = info.confidence || "Unknown";
  const swatch = swatchFor(color);
  return `
    <div class="color-row" style="border-left-color:${swatch}">
      <div class="swatch" style="background:${swatch}" title="${color}"></div>
      <div>
        <span class="role">${role}</span>
        <strong>${color}</strong>
        <span class="match">${buildSummary(color)} <span class="${confidenceClass(confidence)}">(${confidence})</span></span>
      </div>
    </div>
  `;
}
function paletteStrip(p){
  const colors = [p.background, p.main, ...p.accents];
  return `<div class="palette-strip">${colors.map(c => `<div class="strip-swatch" style="background:${swatchFor(c)}" title="${c}"></div>`).join("")}</div>`;
}
function paletteCard(p){
  const score = paletteOwnedScore(p);
  const accentHtml = p.accents.map((a,i) => colorBlock(`Accent ${i+1}`, a)).join("");
  return `
    <article class="card">
      <h3>Palette #${p.id} <span class="badge">${score.owned}/${score.total} makeable</span></h3>
      ${paletteStrip(p)}
      <div class="color-list">
        ${colorBlock("Background", p.background)}
        ${colorBlock("Main Copy", p.main)}
        ${accentHtml}
      </div>
      <div class="owned-summary">
        ${score.owned === score.total ? "You appear to have stock anchors for this full palette." : `Currently makeable from mapped stock anchors: ${score.owned} of ${score.total}`}
      </div>
    </article>
  `;
}

function paintItem(color, checkbox=false){
  const id = color.name;
  const checked = ownedPaints.includes(id) ? "checked" : "";
  const input = checkbox ? `<input type="checkbox" value="${id}" ${checked}>` : "";
  return `
    <label class="paint-check">
      ${input}
      <span class="mini-swatch" style="background:${color.hex || "#718096"}"></span>
      <span>
        <strong>${color.name}</strong>
        <span class="build-note">${color.hex || "No valid hex"} · ${color.hexDescription || ""}</span>
      </span>
    </label>
  `;
}

function populatePaintBox(){
  paintBox.innerHTML = DATA.ronanStock.map(c => paintItem(c, true)).join("");
  paintBox.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", e => {
      if(e.target.checked){
        if(!ownedPaints.includes(e.target.value)) ownedPaints.push(e.target.value);
      } else {
        ownedPaints = ownedPaints.filter(p => p !== e.target.value);
      }
      saveOwned();
      renderAll();
    });
  });
  formulaBox.innerHTML = DATA.ronanFormulas.map(c => paintItem(c, false)).join("");
}

function setAllPaints(checked){
  ownedPaints = checked ? DATA.ronanStock.map(s => s.name) : [];
  saveOwned();
  populatePaintBox();
  renderAll();
}

function populateBackgrounds(){
  bgSelect.innerHTML = `<option value="">Pick a background...</option>` + DATA.backgrounds.map(bg => `<option value="${bg}">${bg}</option>`).join("");
}
function populateMains(){
  const bg = bgSelect.value;
  if(!bg){
    mainSelect.innerHTML = `<option value="">Pick a background first</option>`;
    mainSelect.disabled = true;
    return;
  }
  let mains = DATA.palettes.filter(p => p.background === bg).map(p => p.main);
  mains = [...new Set(mains)].sort();
  mainSelect.disabled = false;
  mainSelect.innerHTML = `<option value="">Any main copy</option>` + mains.map(m => `<option value="${m}">${m}</option>`).join("");
}
function getFilteredPalettes(){
  const bg = bgSelect.value;
  const main = mainSelect.value;
  if(!bg) return [];
  let filtered = DATA.palettes.filter(p => p.background === bg && (!main || p.main === main));
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
  const bg = bgSelect.value;
  const filtered = getFilteredPalettes();
  document.getElementById("paletteCount").textContent = DATA.palettes.length;
  if(!bg){
    resultMeta.textContent = "Pick a background color to begin.";
    results.innerHTML = `<div class="empty-state"><strong>Start with the panel.</strong><br>Choose a background color above and the matching Phalen palettes will appear here.</div>`;
    return;
  }
  resultMeta.textContent = `${filtered.length} matching palette${filtered.length === 1 ? "" : "s"} for ${bg}`;
  results.innerHTML = filtered.length ? filtered.map(paletteCard).join("") : `<div class="card"><h3>No palettes found</h3><p class="muted">Try a different main copy color.</p></div>`;
}
function renderBuilds(){
  const q = (buildSearch.value || "").toLowerCase();
  const names = Object.keys(DATA.dictionary).sort().filter(name => !q || name.toLowerCase().includes(q));
  buildMeta.textContent = `${names.length} canonical color${names.length === 1 ? "" : "s"} shown`;
  buildResults.innerHTML = names.map(name => {
    const info = DATA.dictionary[name] || {};
    const builds = DATA.colorBuilds[name] || [];
    const swatch = swatchFor(name);
    const buildHtml = builds.length ? builds.map(b => `
      <div class="build-note">
        <strong>${b.type}</strong><br>
        <span class="mini-swatch" style="display:inline-block;vertical-align:middle;background:${b.hex || "#718096"}"></span>
        ${b.ronanColor}<br>
        <span class="${confidenceClass(b.confidence)}">Confidence: ${b.confidence || "Unknown"}</span><br>
        ${b.method}
      </div>
    `).join("") : `<span class="build-note">No Ronan build mapped yet. Future row goes here.</span>`;
    return `
      <article class="build-card">
        <span class="mini-swatch" style="background:${swatch}"></span>
        <div>
          <strong>${name}</strong>
          <span class="build-note">${info.primaryFamily || ""}${info.secondaryFamily ? " / " + info.secondaryFamily : ""}</span>
          ${buildHtml}
        </div>
      </article>
    `;
  }).join("");
}
function renderRandom(palette){
  currentRandomPalette = palette;
  randomMeta.textContent = `Palette #${palette.id}: ${palette.background} background with ${palette.main} main copy`;
  randomResult.innerHTML = paletteCard(palette);
}
function generateRandomPalette(){
  const p = DATA.palettes[Math.floor(Math.random() * DATA.palettes.length)];
  renderRandom(p);
}
function renderArchive(){
  const groups = {};
  DATA.palettes.forEach(p => {
    if(!groups[p.background]) groups[p.background] = [];
    groups[p.background].push(p);
  });
  archiveResults.innerHTML = DATA.backgrounds.map(bg => {
    const group = groups[bg] || [];
    return `
      <section class="archive-group">
        <button class="archive-toggle" type="button">
          <strong>${bg}</strong>
          <span>${group.length} palette${group.length === 1 ? "" : "s"}</span>
        </button>
        <div class="archive-content"><div class="palette-grid">${group.map(paletteCard).join("")}</div></div>
      </section>
    `;
  }).join("");
  archiveResults.querySelectorAll(".archive-toggle").forEach(button => {
    button.addEventListener("click", () => button.closest(".archive-group").classList.toggle("open"));
  });
}
function renderAll(){
  renderResults();
  renderBuilds();
  renderArchive();
  if(currentRandomPalette) renderRandom(currentRandomPalette);
}
function setupTabs(){
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

bgSelect.addEventListener("change", () => { populateMains(); renderResults(); });
mainSelect.addEventListener("change", renderResults);
ownedOnly.addEventListener("change", renderResults);
buildSearch.addEventListener("input", renderBuilds);
document.getElementById("clearBtn").addEventListener("click", () => {
  bgSelect.value = "";
  populateMains();
  renderResults();
});
document.getElementById("randomBtn").addEventListener("click", generateRandomPalette);
document.getElementById("selectAllPaints").addEventListener("click", () => setAllPaints(true));
document.getElementById("clearAllPaints").addEventListener("click", () => setAllPaints(false));

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

setupTabs();
populatePaintBox();
populateBackgrounds();
populateMains();
renderResults();
renderBuilds();
renderArchive();
generateRandomPalette();
