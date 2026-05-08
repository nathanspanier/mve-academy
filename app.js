// ─── MVE Academy — app.js ─────────────────────────────────────
// Progress storage, navigation helpers, shared utilities.
// Used by both index.html (home) and module.html (Lab Bench).

const STORAGE_KEY = 'mve_academy_progress_v1';

// ─── PROGRESS ─────────────────────────────────────────────────
// Shape: { m0: { done: {s1:true,...}, currentIdx: 3 }, m1: {...} }

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

function getModuleProgress(moduleId) {
  const progress = loadProgress();
  return progress[moduleId] || { done: {}, currentIdx: 0 };
}

function setModuleProgress(moduleId, moduleState) {
  const progress = loadProgress();
  progress[moduleId] = moduleState;
  saveProgress(progress);
}

function getModuleStatus(moduleId, totalSteps, optionalStepIds = []) {
  const state = getModuleProgress(moduleId);
  const requiredIds = Object.keys(state.done).filter(id => !optionalStepIds.includes(id));
  const doneRequired = requiredIds.filter(id => state.done[id]).length;

  // Count required steps only (excluding optional from denominator)
  const requiredTotal = totalSteps - optionalStepIds.length;
  const doneCount = Object.values(state.done).filter(Boolean).length;

  if (doneCount === 0 && state.currentIdx === 0) return 'not-started';
  if (doneRequired >= requiredTotal) return 'complete';
  return 'in-progress';
}

// ─── NAVIGATION ───────────────────────────────────────────────

function goToModule(moduleId) {
  window.location.href = `module.html?id=${moduleId}`;
}

function goHome() {
  window.location.href = 'index.html';
}

function getModuleIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// ─── STUCK BUTTON — open Claude.ai in new tab ─────────────────

function openStuckInClaude(moduleTitle, stepNum, totalSteps, stepTitle, stepCode) {
  const codeLine = stepCode
    ? `\n\nThe instructions told me to run:\n\`\`\`\n${stepCode}\n\`\`\``
    : '';

  const prompt = `I'm working through MVE Academy — ${moduleTitle}.

I'm stuck on Step ${stepNum} of ${totalSteps}: "${stepTitle}".${codeLine}

When I tried it, I got: [paste your error here]

What I've already checked: [what you tried]

I'm on a Mac (macOS). What should I look at next?`;

  const url = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
  window.open(url, '_blank', 'noopener');
}

// ─── UTILS ────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
