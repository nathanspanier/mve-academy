// ─── MVE Academy — labench.js ─────────────────────────────────
// Reads a module JSON file and renders the full Lab Bench UI.
// Depends on app.js being loaded first.

let MODULE = null;
let state = { done: {}, open: {}, currentIdx: 0 };

// ─── BOOT ─────────────────────────────────────────────────────

async function initLabBench() {
  const moduleId = getModuleIdFromURL();
  if (!moduleId) {
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:#999">No module specified. <a href="index.html">Go home.</a></div>';
    return;
  }

  try {
    const res = await fetch(`data/${moduleId}.json`);
    if (!res.ok) throw new Error(`${res.status}`);
    MODULE = await res.json();
  } catch (e) {
    document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif;color:#999">Module "${moduleId}" not found. <a href="index.html">Go home.</a></div>`;
    return;
  }

  // Load saved progress
  state = getModuleProgress(moduleId);
  if (!state.open) state.open = {};
  computeCurrent();

  // Inject topbar content
  renderTopbar();

  // Inject briefing
  renderBriefing();

  // Render steps
  render();
}

// ─── TOPBAR ───────────────────────────────────────────────────

function renderTopbar() {
  const phaseClass = getPhaseClass(MODULE.phase);

  document.getElementById('tb-phase').textContent = MODULE.phase;
  document.getElementById('tb-phase').className = `phase-pill ${phaseClass}`;
  document.getElementById('tb-module-id').textContent = MODULE.id.toUpperCase();
  document.getElementById('tb-module-title').textContent = MODULE.title;
  document.getElementById('total-count').textContent = MODULE.steps.length;
}

function getPhaseClass(phaseStr) {
  if (phaseStr.includes('Phase 1')) return 'p1';
  if (phaseStr.includes('Phase 2')) return 'p2';
  if (phaseStr.includes('Phase 3')) return 'p3';
  if (phaseStr.includes('Phase 4')) return 'p4';
  if (phaseStr.includes('Phase 5')) return 'p5';
  return 'p1';
}

// ─── BRIEFING ─────────────────────────────────────────────────

function renderBriefing() {
  const b = MODULE.briefing;
  const bodyHtml = b.body.map(p => `<p>${p}</p>`).join('');
  document.getElementById('briefing-headline').textContent = b.headline;
  document.getElementById('briefing-body').innerHTML = bodyHtml;
  document.getElementById('briefing-estimate').textContent = MODULE.estimate;
  document.getElementById('briefing-steps').textContent = `${MODULE.steps.length} steps`;
  document.getElementById('briefing-prereqs').textContent = MODULE.prereqs;
}

// ─── REFERENCE DRAWER ─────────────────────────────────────────

function renderDrawer() {
  if (!MODULE.reference) return;
  const drawerBody = document.getElementById('drawer-body');
  document.getElementById('drawer-title').textContent = `Reference — ${MODULE.id.toUpperCase()}`;

  let html = '';
  MODULE.reference.forEach(section => {
    html += `<div class="ref-section">
      <h3>${section.title}</h3>`;
    if (section.type === 'code') {
      html += `<pre>${escapeHtml(section.content)}</pre>`;
    } else {
      html += `<p>${section.content}</p>`;
    }
    html += `</div>`;
  });
  drawerBody.innerHTML = html;
}

// ─── STATE ────────────────────────────────────────────────────

function computeCurrent() {
  for (let i = 0; i < MODULE.steps.length; i++) {
    if (!state.done[MODULE.steps[i].id]) {
      state.currentIdx = i;
      return;
    }
  }
  state.currentIdx = MODULE.steps.length; // all done
}

function saveState() {
  setModuleProgress(MODULE.id, state);
}

// ─── RENDER ───────────────────────────────────────────────────

function render() {
  const stepsEl = document.getElementById('steps');
  let html = '';

  MODULE.steps.forEach((step, i) => {
    const isDone = !!state.done[step.id];
    const isCurrent = !isDone && i === state.currentIdx;
    const isOpen = !!state.open[step.id];
    const isUpcoming = !isDone && !isCurrent;

    let cls = 'step';
    if (isDone) cls += ' is-done';
    else if (isCurrent) cls += ' is-current';
    else cls += ' is-upcoming';
    if (isOpen && !isCurrent) cls += ' is-open';

    let numContent = String(i + 1);
    if (isDone) numContent = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    let tag = '';
    if (step.tag) {
      const tagCls = step.tagOptional ? 'step-tag optional' : 'step-tag';
      tag = `<span class="${tagCls}">${step.tag}</span>`;
    }

    let codeBlock = '';
    if (step.code) {
      codeBlock = `<div class="step-code-wrap">
        <pre class="step-code">${escapeHtml(step.code)}</pre>
        <button class="copy-btn" data-copy="${escapeAttr(step.code)}">Copy</button>
      </div>`;
    }

    let notesBlock = '';
    if (step.notes && step.notes.length) {
      notesBlock = `<ul class="step-notes">${step.notes.map(n => `<li>${n}</li>`).join('')}</ul>`;
    }

    let verifyBlock = '';
    if (step.verify) {
      verifyBlock = `<div class="step-verify"><strong>When this works:</strong> ${step.verify}</div>`;
    }

    let troubleBlock = '';
    if (step.trouble) {
      troubleBlock = `<div class="step-trouble"><strong>If it didn't:</strong> ${step.trouble}</div>`;
    }

    let footBlock = '';
    if (isDone) {
      footBlock = `<div class="step-foot"><a data-reopen="${step.id}">Mark not done</a></div>`;
    } else if (isUpcoming) {
      footBlock = `<div class="step-foot"><a data-jumpto="${i}">Jump to this step</a></div>`;
    }

    html += `
      <div class="${cls}" data-step-id="${step.id}" data-step-idx="${i}">
        <div class="step-num">${numContent}</div>
        <div class="step-card" data-toggle="${step.id}">
          <div class="step-head">
            <span class="step-title">${step.title}</span>
            <span class="step-meta">${step.estimate}</span>
            ${tag}
          </div>
          <div class="step-body-wrap">
            <div class="step-body">
              <p>${step.body}</p>
              ${codeBlock}
              ${notesBlock}
              ${verifyBlock}
              ${troubleBlock}
              ${footBlock}
            </div>
          </div>
        </div>
      </div>`;
  });

  stepsEl.innerHTML = html;

  // Update progress bar
  const doneCount = Object.values(state.done).filter(Boolean).length;
  const total = MODULE.steps.length;
  const pct = Math.round(doneCount / total * 100);
  document.getElementById('done-count').textContent = doneCount;
  document.getElementById('prog-fill').style.width = pct + '%';

  // Update action bar
  const ab = document.getElementById('action-bar');
  const abNum = document.getElementById('ab-num');
  const abLabel = document.getElementById('ab-label');
  const abTitle = document.getElementById('ab-title');
  const doneBtn = document.getElementById('done-btn');
  const stuckBtn = document.getElementById('stuck-btn');

  // Update completion message (runs in both branches so the card is correct
  // whether the user just finished the module or reloaded into it complete).
  if (MODULE.completion) {
    document.getElementById('complete-headline').textContent = MODULE.completion.headline;
    document.getElementById('complete-body').textContent = MODULE.completion.body;
  }

  if (state.currentIdx >= MODULE.steps.length) {
    ab.classList.add('is-complete');
    abNum.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    abLabel.textContent = 'Complete';
    abTitle.textContent = 'All steps done';
    doneBtn.textContent = 'Reset';
    doneBtn.dataset.reset = 'true';
    stuckBtn.style.visibility = 'hidden';
    document.getElementById('complete-card').classList.add('show');
  } else {
    ab.classList.remove('is-complete');
    abNum.textContent = state.currentIdx + 1;
    abLabel.textContent = 'Current step';
    abTitle.textContent = MODULE.steps[state.currentIdx].title;
    doneBtn.textContent = '✓ I did it';
    delete doneBtn.dataset.reset;
    stuckBtn.style.visibility = 'visible';
    document.getElementById('complete-card').classList.remove('show');
  }

  attachHandlers();
}

// ─── EVENT HANDLERS ───────────────────────────────────────────

function attachHandlers() {
  // Toggle expand
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.copy-btn') || e.target.closest('a[data-reopen]') || e.target.closest('a[data-jumpto]')) return;
      const id = el.dataset.toggle;
      const idx = MODULE.steps.findIndex(s => s.id === id);
      if (idx === state.currentIdx && !state.done[id]) return;
      state.open[id] = !state.open[id];
      render();
    });
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }
      btn.classList.add('copied');
      btn.textContent = 'Copied';
      setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy'; }, 1500);
    });
  });

  // Mark not done
  document.querySelectorAll('a[data-reopen]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = a.dataset.reopen;
      delete state.done[id];
      delete state.open[id];
      computeCurrent();
      saveState();
      render();
      scrollToCurrent();
    });
  });

  // Jump to step
  document.querySelectorAll('a[data-jumpto]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(a.dataset.jumpto, 10);
      for (let i = 0; i < idx; i++) {
        state.done[MODULE.steps[i].id] = true;
      }
      computeCurrent();
      saveState();
      render();
      scrollToCurrent();
    });
  });
}

function scrollToCurrent() {
  const cur = document.querySelector('.step.is-current');
  if (cur) {
    const rect = cur.getBoundingClientRect();
    if (rect.top < 80 || rect.top > window.innerHeight - 200) {
      cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// ─── ACTION BAR BUTTONS ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('done-btn').addEventListener('click', () => {
    const btn = document.getElementById('done-btn');
    if (btn.dataset.reset) {
      if (confirm(`Reset all progress on ${MODULE ? MODULE.id.toUpperCase() : 'this module'}?`)) {
        state = { done: {}, open: {}, currentIdx: 0 };
        saveState();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (state.currentIdx >= MODULE.steps.length) return;
    const id = MODULE.steps[state.currentIdx].id;
    state.done[id] = true;
    delete state.open[id];
    computeCurrent();
    saveState();
    render();
    setTimeout(scrollToCurrent, 100);
  });

  // Stuck button — open Claude.ai directly
  document.getElementById('stuck-btn').addEventListener('click', () => {
    if (state.currentIdx >= MODULE.steps.length) return;
    const step = MODULE.steps[state.currentIdx];
    openStuckInClaude(
      `${MODULE.id.toUpperCase()} — ${MODULE.title}`,
      state.currentIdx + 1,
      MODULE.steps.length,
      step.title,
      step.code || null
    );
  });

  // Reference drawer
  document.getElementById('ref-btn').addEventListener('click', () => {
    renderDrawer();
    document.getElementById('drawer-backdrop').classList.add('open');
    document.getElementById('drawer').classList.add('open');
  });
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Boot
  initLabBench();
});

function closeDrawer() {
  document.getElementById('drawer-backdrop').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
}
