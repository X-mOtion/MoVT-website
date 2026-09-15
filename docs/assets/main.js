
import { benchmarks } from './benchmarks.js';
import { samples as sourceSamples } from './samples.js';
import { stages } from './stages.js';
import { siteConfig } from './site-config.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const asset = path => new URL(path, document.baseURI).href;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const external = value => { try { const url = new URL(value); return /^(https?:)$/.test(url.protocol) ? url.href : null; } catch { return null; } };

// Publication metadata comes from the supplied paper, not the design reference.
if (Array.isArray(siteConfig.authors) && siteConfig.authors.length) {
  $('#author-list').innerHTML = siteConfig.authors.map(author => {
    const markers = [author.affiliation, author.corresponding ? '*' : ''].filter(Boolean).join(',');
    const name = `${escapeHTML(author.name)}${markers ? `<sup>${escapeHTML(markers)}</sup>` : ''}`;
    const label = `${author.name}${author.affiliation ? `, affiliation ${author.affiliation}` : ''}${author.corresponding ? ', corresponding author' : ''}`;
    const url = external(author.url);
    return url
      ? `<a class="author-person" aria-label="${escapeHTML(label)}" href="${escapeHTML(url)}" target="_blank" rel="noopener">${name}</a>`
      : `<span class="author-person" aria-label="${escapeHTML(label)}">${name}</span>`;
  }).join('');
  $('#author-list').hidden = false;
  if (siteConfig.authors.some(author => author.corresponding)) {
    $('#author-note').textContent = '* Corresponding author';
    $('#author-note').hidden = false;
  }
}
if (Array.isArray(siteConfig.affiliations) && siteConfig.affiliations.length) {
  $('#affiliations').innerHTML = siteConfig.affiliations.map(item =>
    `<span><sup>${escapeHTML(item.id)}</sup> ${escapeHTML(item.name)}</span>`
  ).join('');
  $('#affiliations').hidden = false;
} else if (typeof siteConfig.affiliations === 'string' && siteConfig.affiliations) {
  $('#affiliations').textContent = siteConfig.affiliations;
  $('#affiliations').hidden = false;
}
if (siteConfig.venue) {
  $('#venue').textContent = siteConfig.venue;
  $('#venue').hidden = false;
}
if (external(siteConfig.repository)) $('#repository-link').href = external(siteConfig.repository);
$('#repository-link .code-status').textContent = `· ${siteConfig.codeStatus || 'Coming soon'}`;
$('#bibtex').textContent = siteConfig.bibtex;
$('#citation-note').textContent = siteConfig.citationNote;

// Keyboard-operable tabs; only one selected item and one tab stop per group.
function tabs(selector, callback) {
  const items = $$(selector);
  function select(item, focus = false) {
    items.forEach(tab => { tab.setAttribute('aria-selected', String(tab === item)); tab.tabIndex = tab === item ? 0 : -1; });
    if (focus) item.focus();
    callback(item);
  }
  items.forEach((item, index) => {
    item.addEventListener('click', () => select(item));
    item.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % items.length, ArrowLeft: (index - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault(); select(items[next], true);
    });
  });
}

const stageTitles = ['3D motion tokenization', 'Cross-modal codebook alignment', 'Video-based codebook augmentation', 'Transfer the new codes to 3D', 'Text-conditioned motion generation'];
tabs('.stage-tabs [role="tab"]', tab => {
  const index = Number(tab.dataset.stage), stage = stages[index];
  $('#stage-panel').setAttribute('aria-labelledby', tab.id);
  $('#stage-panel').dataset.stage = String(index);
  $('#stage-title').textContent = stageTitles[index];
  $('#stage-description').textContent = stage.description;
  $('#stage-formula').innerHTML = stage.formula; // Authored, static markup; never external input.
  $('#stage-note').textContent = stage.note;
});

let dataset = 'humanml3d', allMethods = false;
const selectedMethods = new Set(['Real motion', 'MoMask', 'BAMM', 'ENERGYMOGEN', 'MotionGPT-2']);
function renderTable() {
  const rows = benchmarks[dataset].filter(row => allMethods || row.ours || selectedMethods.has(row.name));
  $('#benchmark-rows').innerHTML = rows.map(row => `<tr class="${row.ours ? 'ours' : row.name === 'Real motion' ? 'reference' : ''}"><th scope="row">${escapeHTML(row.name)}</th>${row.values.map(value => `<td>${value ? escapeHTML(value[0]) : '—'}</td>`).join('')}</tr>`).join('');
  $('#benchmark-caption').textContent = `${dataset === 'humanml3d' ? 'HumanML3D' : 'KIT-ML'} · ${allMethods ? 'All' : 'Selected'} methods from Table 1`;
  $('#benchmark-panel').dataset.dataset = dataset;
  $('#benchmark-panel').setAttribute('aria-labelledby', `dataset-${dataset}`);
  $('#toggle-methods').innerHTML = `${allMethods ? 'Show selected methods' : 'Show all methods'} ${icon(allMethods ? 'arrow' : 'plus')}`;
  $('#toggle-methods').setAttribute('aria-expanded', String(allMethods));
}
tabs('.dataset-tabs [role="tab"]', tab => { dataset = tab.dataset.dataset; renderTable(); });
$('#toggle-methods').addEventListener('click', () => { allMethods = !allMethods; renderTable(); });
renderTable();
tabs('.comparison-tabs [role="tab"]', tab => {
  for (const key of ['qualitative', 'reconstruction', 'codebook']) $(`#comparison-${key}`).hidden = key !== tab.dataset.comparison;
});

// Full-size original figures, with zoom and a direct vector-PDF link.
const dialog = $('#figure-dialog');
let figureOpener;
function openFigure(button, opener = button) {
  figureOpener = opener;
  $('#dialog-title').textContent = button.dataset.title;
  $('#dialog-image').src = asset(`figures/${button.dataset.figure}.webp`);
  $('#dialog-image').alt = button.querySelector('img').alt;
  $('#dialog-pdf').href = asset(`figures/source/${button.dataset.figure}.pdf`);
  $('#dialog-image-area').classList.remove('is-zoomed');
  $('#toggle-zoom').textContent = 'Actual size';
  dialog.showModal(); document.body.classList.add('dialog-open'); $('#close-figure').focus();
}
$$('[data-figure]').forEach(button => button.addEventListener('click', () => openFigure(button)));
$$('[data-open-figure]').forEach(button => button.addEventListener('click', () => openFigure($(`[data-figure="${button.dataset.openFigure}"]`), button)));
$('#close-figure').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); figureOpener?.focus({ preventScroll: true }); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
$('#toggle-zoom').addEventListener('click', () => { const zoomed = $('#dialog-image-area').classList.toggle('is-zoomed'); $('#toggle-zoom').textContent = zoomed ? 'Fit to screen' : 'Actual size'; });

// A single prompt registry and a single viewer. Dedupe again here to prevent
// accidental repetitions if someone adds the same prompt to samples.js later.
const normalizePrompt = text => text.trim().replace(/\s+/g, ' ').replace(/[.?!]+$/, '').toLowerCase();
const seen = new Set();
const samples = sourceSamples.filter(sample => {
  const key = normalizePrompt(sample.prompt);
  if (seen.has(key)) return false;
  seen.add(key); return true;
});
const shortNames = { boxing: 'Boxing', dance: 'Dance', squat: 'Squat' };
let currentSample = samples[0], activeDisplay = 'film';
const film = $('#motion-film');
let filmVisible = false, playIntent = !reduced.matches;
let viewer = null, viewerPromise = null, currentData = null, loadVersion = 0, lastToken = -1;
const cache = new Map();
const studio = $('.motion-studio');
const errorBox = $('#demo-error');
const loading = $('#motion-loading');

$('#sample-tabs').innerHTML = samples.map(sample => `<button type="button" class="sample-tab" data-sample="${escapeHTML(sample.id)}" aria-pressed="false">${escapeHTML(shortNames[sample.id] || sample.title)}</button>`).join('');
$('#sample-tabs').addEventListener('click', event => {
  const button = event.target.closest('[data-sample]');
  if (button) selectSample(button.dataset.sample);
});
$('#sample-tabs').addEventListener('keydown', event => {
  const buttons = $$('.sample-tab'), index = buttons.indexOf(document.activeElement);
  if (index < 0) return;
  const next = { ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index - 1 + buttons.length) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
  if (next === undefined) return;
  event.preventDefault(); buttons[next].focus(); selectSample(buttons[next].dataset.sample);
});
function updatePrompt() {
  $('#active-prompt').textContent = `“${currentSample.prompt}”`;
  $('#sample-counter').textContent = `${String(samples.indexOf(currentSample) + 1).padStart(2, '0')} / ${String(samples.length).padStart(2, '0')}`;
  $('#demo-surface').dataset.sample = currentSample.id;
  $('#download-video').href = asset(currentSample.video);
  $('#download-motion').href = asset(currentSample.file);
  $$('.sample-tab').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sample === currentSample.id)));
}
function selectSample(id) {
  const sample = samples.find(item => item.id === id);
  if (!sample) return;
  if (currentSample.id === id) { if (activeDisplay === 'studio' && !errorBox.hidden) void loadMotion(); return; }
  currentSample = sample; updatePrompt();
  // Cropped character-only render. Original paired videos remain downloadable.
  film.src = asset(`renders/${sample.id}.mp4`);
  film.poster = asset(`renders/${sample.id}.jpg`);
  film.load(); maybePlayFilm();
  if (viewer) void loadMotion();
}
updatePrompt();
film.controls = false; $('.film-controls').hidden = false;
function maybePlayFilm() {
  if (activeDisplay === 'film' && filmVisible && playIntent && !document.hidden) film.play().catch(() => {});
}
function updateFilmButton() {
  $('#film-play').innerHTML = icon(film.paused ? 'play' : 'pause');
  $('#film-play').setAttribute('aria-label', film.paused ? 'Play video' : 'Pause video');
  $('#film-play').setAttribute('aria-pressed', String(!film.paused));
}
function mmss(seconds) { const v = Number.isFinite(seconds) ? Math.max(0, seconds) : 0; return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`; }
function updateFilmTime() {
  $('#film-time').textContent = `${mmss(film.currentTime)} / ${mmss(film.duration)}`;
  $('#film-timeline').max = String(Number.isFinite(film.duration) ? film.duration : 4.8);
  $('#film-timeline').value = String(film.currentTime || 0);
}
film.addEventListener('play', updateFilmButton); film.addEventListener('pause', updateFilmButton);
film.addEventListener('timeupdate', updateFilmTime); film.addEventListener('loadedmetadata', updateFilmTime);
film.addEventListener('error', () => showToast('This video could not be loaded. Select another prompt, or open the 2D / 3D view.'));
$('#film-play').addEventListener('click', () => {
  playIntent = film.paused;
  if (playIntent) film.play().catch(() => showToast('Video playback was blocked. Please try again.')); else film.pause();
});
$('#film-timeline').addEventListener('input', event => { playIntent = false; film.pause(); film.currentTime = Number(event.target.value); updateFilmTime(); });
const filmObserver = new IntersectionObserver(([entry]) => { filmVisible = entry.isIntersecting; if (filmVisible) maybePlayFilm(); else film.pause(); }, { threshold: .15 });
filmObserver.observe(film);

function updateStudioPlay() {
  const playing = viewer?.playing ?? false;
  $('#play-button').innerHTML = icon(playing ? 'pause' : 'play');
  $('#play-button').setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
  studio.dataset.playing = String(playing);
}
function onFrame(frame, total) {
  if (!currentData) return;
  $('#timeline').value = String(frame); studio.dataset.frame = String(frame);
  $('#time-label').textContent = `${(frame / currentData.fps).toFixed(2)} / ${(total / currentData.fps).toFixed(2)}`;
  $('#timeline').setAttribute('aria-valuetext', `Frame ${frame + 1} of ${total}`);
  const index = Math.min(currentData.baseIndices.length - 1, Math.floor(frame / total * currentData.baseIndices.length));
  if (index === lastToken) return;
  const strip = $('#token-strip'); strip.children[lastToken]?.classList.remove('active');
  const token = strip.children[index]; token?.classList.add('active');
  if (token) { const left = token.offsetLeft; if (left < strip.scrollLeft || left + token.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = Math.max(0, left - strip.clientWidth * .4); }
  lastToken = index;
}
async function getMotion(sample) {
  if (!cache.has(sample.id)) cache.set(sample.id, fetch(asset(sample.file)).then(response => {
    if (!response.ok) throw new Error(`Motion request failed (${response.status}).`);
    return response.json();
  }).then(data => {
    if (!Number.isFinite(data.fps) || !Number.isFinite(data.frames) || !Array.isArray(data.baseIndices)) throw new Error('Motion data has an unexpected format.');
    return data;
  }).catch(error => { cache.delete(sample.id); throw error; }));
  return cache.get(sample.id);
}
async function loadMotion() {
  if (!viewer) return;
  const version = ++loadVersion, sample = currentSample;
  viewer.pause(); currentData = null;
  loading.hidden = false; errorBox.hidden = true; studio.setAttribute('aria-busy', 'true');
  try {
    const data = await getMotion(sample);
    if (version !== loadVersion) return;
    currentData = data; lastToken = -1;
    $('#token-strip').innerHTML = data.baseIndices.map(id => `<span class="token-chip">${escapeHTML(id)}</span>`).join('');
    $('#timeline').max = String(data.frames - 1);
    viewer.setMotion(data); viewer.setMode($('#mode-select').value); viewer.setSpeed(Number($('#speed-select').value));
    if (activeDisplay !== 'studio' || reduced.matches || document.hidden) viewer.pause();
    studio.dataset.sample = sample.id; studio.dataset.mode = $('#mode-select').value; updateStudioPlay();
  } catch (error) {
    if (version !== loadVersion) return;
    errorBox.textContent = `The interactive motion could not load. ${error.message} Select the current prompt to retry.`;
    errorBox.hidden = false; viewer.pause(); updateStudioPlay();
  } finally {
    if (version === loadVersion) { loading.hidden = true; studio.setAttribute('aria-busy', 'false'); }
  }
}
async function ensureViewer() {
  if (viewer) return viewer;
  if (viewerPromise) return viewerPromise;
  loading.hidden = false; errorBox.hidden = true; studio.setAttribute('aria-busy', 'true');
  viewerPromise = import('./motion-viewer.js').then(async ({ MotionViewer }) => {
    viewer = new MotionViewer({ threeContainer: $('#three-container'), twoCanvas: $('#two-canvas'), onFrame });
    await loadMotion(); return viewer;
  }).catch(error => {
    viewerPromise = null; loading.hidden = true; studio.setAttribute('aria-busy', 'false');
    errorBox.textContent = `The interactive view could not start. ${error.message} Return to Video and reopen this view to retry.`;
    errorBox.hidden = false; return null;
  });
  return viewerPromise;
}
tabs('.display-tabs [role="tab"]', async tab => {
  activeDisplay = tab.dataset.display;
  $('#film-panel').hidden = activeDisplay !== 'film'; $('#studio-panel').hidden = activeDisplay !== 'studio';
  if (activeDisplay === 'studio') {
    film.pause(); await ensureViewer();
    if (activeDisplay === 'studio' && !reduced.matches && errorBox.hidden && !document.hidden) viewer?.play();
    updateStudioPlay();
  } else { viewer?.pause(); updateStudioPlay(); maybePlayFilm(); }
});
$('#play-button').addEventListener('click', () => { viewer?.toggle(); updateStudioPlay(); });
$('#restart-button').addEventListener('click', () => { viewer?.seek(0); });
$('#timeline').addEventListener('input', event => { viewer?.pause(); viewer?.seek(Number(event.target.value)); updateStudioPlay(); });
$('#speed-select').addEventListener('change', event => viewer?.setSpeed(Number(event.target.value)));
$('#mode-select').addEventListener('change', event => { viewer?.setMode(event.target.value); studio.dataset.mode = event.target.value; });
$$('[data-view]').forEach(button => button.addEventListener('click', () => {
  viewer?.setView(button.dataset.view);
  $$('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
reduced.addEventListener('change', () => { if (reduced.matches) { playIntent = false; film.pause(); viewer?.pause(); updateStudioPlay(); } });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { film.pause(); viewer?.pause(); updateStudioPlay(); }
  else maybePlayFilm();
});
const studioObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting && viewer?.playing) { viewer.pause(); updateStudioPlay(); }
}, { threshold: .05 });
studioObserver.observe($('#studio-panel'));

window.addEventListener('pagehide', event => { film.pause(); if (!event.persisted) { viewer?.dispose(); filmObserver.disconnect(); studioObserver.disconnect(); } });

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4400);
}
$('#copy-citation').addEventListener('click', async () => {
  const text = $('#bibtex').textContent;
  try {
    if (navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement('textarea'); field.value = text; field.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(field); field.select();
      const success = document.execCommand('copy'); field.remove(); if (!success) throw new Error('Clipboard unavailable.');
    }
    showToast('BibTeX copied. Verify the publication metadata before citing.');
  } catch { showToast('Clipboard access was blocked. Select the BibTeX and copy it manually.'); }
});
