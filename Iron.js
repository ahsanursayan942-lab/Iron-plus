/* ============================================================
   BIO-METRIC OS — app.js
   Full training intelligence engine. God-tier interactivity.
   ============================================================ */

"use strict";

// ── DATA FETCH ─────────────────────────────────────────────

async function loadData() {
  const res = await fetch("Iron.json");
  if (!res.ok) throw new Error("Failed to load Iron.json");
  return res.json();
}

// ── MAIN INIT ──────────────────────────────────────────────

let DB = null;

(async () => {
  try {
    DB = await loadData();
    await runBootSequence();
    initApp();
  } catch (err) {
    console.error("Boot failed:", err);
    document.getElementById("boot-overlay").innerHTML =
      `<div style="color:#ff4e6a;font-family:monospace;font-size:.8rem;padding:2rem;text-align:center">
        BOOT ERROR: ${err.message}<br><br>
        Ensure Iron.json is served from the same directory.
      </div>`;
  }
})();

// ── BOOT SEQUENCE ──────────────────────────────────────────

const BOOT_MESSAGES = [
  `INITIALIZING BIO-METRIC OS ${new Date().getFullYear()}…`,
  "LOADING PROTOCOL DATABASE…",
  "CALIBRATING MUSCLE MAPPING SYSTEM…",
  "STARTING BIOMETRIC PULSE MONITOR…",
  "RUNNING NEURAL DIAGNOSTIC CHECKS…",
  "VERIFYING SESSION STATE INTEGRITY…",
  "MOUNTING TRAINING INTELLIGENCE ENGINE…",
  "ALL SYSTEMS NOMINAL · READY",
];

function runBootSequence() {
  return new Promise((resolve) => {
    const linesEl = document.getElementById("boot-lines");
    const barEl   = document.getElementById("boot-bar");
    const pctEl   = document.getElementById("boot-pct");
    let i = 0;
    let pct = 0;

    function step() {
      if (i >= BOOT_MESSAGES.length) {
        setTimeout(() => {
          document.getElementById("boot-overlay").classList.add("hidden");
          resolve();
        }, 400);
        return;
      }

      const line = document.createElement("div");
      line.className = "boot-line";
      line.textContent = `> ${BOOT_MESSAGES[i]}`;
      linesEl.appendChild(line);
      if (linesEl.children.length > 5) linesEl.children[0].remove();

      const target = Math.round(((i + 1) / BOOT_MESSAGES.length) * 100);
      animateNum(pct, target, 250, (v) => {
        pct = v;
        barEl.style.width = v + "%";
        pctEl.textContent = v + "%";
      });
      pct = target;
      i++;
      setTimeout(step, 260 + Math.random() * 140);
    }
    step();
  });
}

// ── UTILITY ────────────────────────────────────────────────

function animateNum(from, to, ms, cb) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / ms, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    cb(Math.round(from + (to - from) * ease));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function nowTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
}

// ── APP STATE ──────────────────────────────────────────────

const state = {
  protocol:        null,
  doneSets:        new Set(),
  totalVolume:     0,
  sessionStart:    null,
  sessionElapsed:  0,
  sessionTimerId:  null,
  restTimerId:     null,
  restRemaining:   0,
  restTotal:       0,
};

// ── LIVE CLOCK ─────────────────────────────────────────────

function startClock() {
  function tick() {
    const el = document.getElementById("bm-clock");
    if (el) el.textContent = nowTimeStr();
  }
  tick();
  setInterval(tick, 1000);
}

// ── SESSION TIMER ──────────────────────────────────────────

function startSessionTimer() {
  state.sessionStart   = Date.now();
  state.sessionElapsed = 0;
  clearInterval(state.sessionTimerId);

  state.sessionTimerId = setInterval(() => {
    state.sessionElapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
    const el = document.getElementById("session-timer");
    if (el) {
      el.textContent = formatTime(state.sessionElapsed);
      el.classList.add("active");
    }
    updateRemainingEstimate();
  }, 1000);

  const timerEl = document.getElementById("session-timer");
  if (timerEl) { timerEl.textContent = "00:00"; timerEl.classList.add("active"); }
}

function updateRemainingEstimate() {
  if (!state.protocol) return;
  const totalSets  = state.protocol.workoutBlocks.reduce((a, b) => a + b.sets, 0);
  const doneSets   = state.doneSets.size;
  const pctDone    = totalSets > 0 ? doneSets / totalSets : 0;
  const estimatedS = (state.protocol.estimatedDuration || 60) * 60;
  const remaining  = Math.max(0, Math.round(estimatedS * (1 - pctDone)));
  const el = document.getElementById("stat-remaining");
  if (el) el.textContent = remaining > 0 ? formatTime(remaining) : "DONE";
}

// ── BIOMETRIC PULSE CANVAS ─────────────────────────────────

function initPulseCanvas() {
  const canvas = document.getElementById("pulse-canvas");
  if (!canvas) return;
  const ctx   = canvas.getContext("2d");
  const W     = canvas.width;
  const H     = canvas.height;
  const MID   = H / 2;

  const DATA   = 80;
  const points = Array(DATA).fill(MID);
  let   idx    = 0;
  let   bpm    = 72;
  let   beatPhase = 0;

  function nextSample() {
    beatPhase += (bpm / 60) / 30;
    const beat = Math.max(0, Math.sin(beatPhase * Math.PI * 2));
    const spike = beat > 0.85 ? (beat - 0.85) / 0.15 : 0;
    const noise = (Math.random() - 0.5) * 3;
    return MID - spike * (MID * 0.7) - noise;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, MID); ctx.lineTo(W, MID); ctx.stroke();

    // Waveform
    const step = W / DATA;
    ctx.beginPath();
    ctx.moveTo(0, points[0]);
    for (let i = 1; i < DATA; i++) {
      ctx.lineTo(i * step, points[i]);
    }
    ctx.strokeStyle = "rgba(0,255,163,0.85)";
    ctx.lineWidth   = 1.5;
    ctx.shadowColor  = "rgba(0,255,163,0.5)";
    ctx.shadowBlur   = 6;
    ctx.stroke();
    ctx.shadowBlur   = 0;

    // Fill under curve
    ctx.lineTo(W, MID); ctx.lineTo(0, MID); ctx.closePath();
    ctx.fillStyle = "rgba(0,255,163,0.04)";
    ctx.fill();

    // BPM label
    ctx.fillStyle  = "rgba(0,255,163,0.6)";
    ctx.font       = "9px 'DM Mono', monospace";
    ctx.textAlign  = "right";
    ctx.fillText(`${bpm} BPM`, W - 4, 12);
  }

  function tick() {
    points[idx % DATA] = nextSample();
    idx++;
    draw();
    requestAnimationFrame(tick);
  }

  tick();

  // Simulate BPM changes based on protocol intensity
  window.setPulseBPM = (newBPM) => { bpm = newBPM; };
}

// ── COMPLETION RING CANVAS ─────────────────────────────────

function drawCompletionRing(pct) {
  const canvas = document.getElementById("completion-ring");
  if (!canvas) return;
  const ctx  = canvas.getContext("2d");
  const W    = canvas.width;
  const H    = canvas.height;
  const cx   = W / 2, cy = H / 2;
  const R    = 36;

  ctx.clearRect(0, 0, W, H);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth   = 6;
  ctx.stroke();

  // Progress
  if (pct > 0) {
    const end = -Math.PI / 2 + (pct / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI / 2, end);
    const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    grad.addColorStop(0, "#7c6ff7");
    grad.addColorStop(1, "#00ffa3");
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 6;
    ctx.lineCap     = "round";
    ctx.shadowColor = "rgba(0,255,163,0.4)";
    ctx.shadowBlur  = 10;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }

  const el = document.getElementById("ring-pct");
  if (el) el.textContent = Math.round(pct) + "%";
}

// ── REST TIMER ─────────────────────────────────────────────

function startRestTimer(seconds, onComplete) {
  const overlay   = document.getElementById("rest-overlay");
  const cdEl      = document.getElementById("rest-countdown");
  const msgEl     = document.getElementById("rest-msg");
  const skipBtn   = document.getElementById("rest-skip");
  const canvas    = document.getElementById("rest-ring");
  const ctx       = canvas.getContext("2d");

  state.restTotal     = seconds;
  state.restRemaining = seconds;
  clearInterval(state.restTimerId);
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  function drawRing(remaining) {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = 65;
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth   = 8;
    ctx.stroke();

    const pct = remaining / seconds;
    if (pct > 0) {
      const end = -Math.PI / 2 + (1 - pct) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, end);
      const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
      grad.addColorStop(0, "#ff4e6a");
      grad.addColorStop(1, "#7c6ff7");
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 8;
      ctx.lineCap     = "round";
      ctx.shadowColor = "rgba(255,78,106,0.4)";
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }
  }

  function tick() {
    drawRing(state.restRemaining);
    const m = Math.floor(state.restRemaining / 60);
    const s = state.restRemaining % 60;
    cdEl.textContent = `${m}:${String(s).padStart(2,"0")}`;
    msgEl.textContent = state.restRemaining > 10
      ? "Recovering — breathe steady"
      : state.restRemaining > 0
        ? "Almost ready…"
        : "GO!";

    if (state.restRemaining <= 0) {
      finishRest();
      return;
    }
    state.restRemaining--;
    state.restTimerId = setTimeout(tick, 1000);
  }

  function finishRest() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    clearTimeout(state.restTimerId);
    if (typeof onComplete === "function") onComplete();
  }

  skipBtn.onclick = finishRest;
  tick();
}

// ── MUSCLE MAP ─────────────────────────────────────────────

function updateMuscleMap(primary, secondary = []) {
  document.querySelectorAll(".muscle-grp").forEach((el) => {
    el.classList.remove("active", "secondary");
  });

  primary.forEach((key) => {
    (DB.muscleMap[key] || []).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("active");
    });
  });

  secondary.forEach((key) => {
    (DB.muscleMap[key] || []).forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains("active")) el.classList.add("secondary");
    });
  });
}

// ── TERMINAL LOG ───────────────────────────────────────────

function log(text, type = "") {
  const container = document.getElementById("terminal-log");
  if (!container) return;

  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `
    <span class="log-ts">${nowTimeStr()}</span>
    <span class="log-txt ${type}">${text}</span>
  `;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;

  // Keep max 40 entries
  while (container.children.length > 40) container.children[0].remove();
}

// ── STATUS ─────────────────────────────────────────────────

function setStatus(text) {
  const el = document.getElementById("sys-status");
  if (el) el.textContent = text;
}

// ── RPE HELPERS ────────────────────────────────────────────

function getRPELabel(rpe) {
  return DB.rpeScale[String(Math.round(rpe))] || "Unknown";
}

// ── STATS UPDATE ───────────────────────────────────────────

function updateStats(protocol) {
  if (!protocol) return;

  const totalSets  = protocol.workoutBlocks.reduce((a, b) => a + b.sets, 0);
  const doneSets   = state.doneSets.size;
  const pct        = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const wt = parseFloat(document.getElementById("wt-input").value) || 0;

  // Sets
  animateNum(
    parseInt(document.getElementById("stat-sets").textContent) || 0,
    doneSets,
    400,
    (v) => { document.getElementById("stat-sets").textContent = v; }
  );

  // Volume
  document.getElementById("stat-vol").textContent =
    state.totalVolume > 0 ? state.totalVolume.toFixed(0) + " kg" : wt > 0 ? "0 kg" : "—";

  // RPE bar
  const avgRPE = protocol.workoutBlocks.reduce((a, b) => a + b.rpe, 0) / protocol.workoutBlocks.length;
  document.getElementById("stat-rpe").textContent   = avgRPE.toFixed(1) + "/10";
  document.getElementById("rpe-bar").style.width    = (avgRPE / 10 * 100) + "%";
  document.getElementById("rpe-label").textContent  = getRPELabel(avgRPE);

  // Completion ring
  drawCompletionRing(pct);

  // Protocol progress
  const pctEl = document.getElementById("proto-pct");
  const barEl = document.getElementById("proto-bar-fill");
  if (pctEl) pctEl.textContent = Math.round(pct) + "%";
  if (barEl) barEl.style.width  = pct + "%";
}

// ── INIT GRID ANIMATION ────────────────────────────────────

function animateInitGrid() {
  const grid = document.getElementById("init-grid");
  if (!grid) return;

  const cols = 20, rows = 12;
  grid.innerHTML = "";
  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "init-cell";
      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  function randomLit() {
    const cell = cells[Math.floor(Math.random() * cells.length)];
    cell.classList.add("lit");
    setTimeout(() => cell.classList.remove("lit"), 800 + Math.random() * 1200);
  }
  setInterval(randomLit, 120);
}

// ── LOG SET ────────────────────────────────────────────────

function logSet(blockIndex, block) {
  if (state.doneSets.has(blockIndex)) return;

  const wt = parseFloat(document.getElementById("wt-input").value) || 0;
  const repsMid = parseInt(block.reps.split("–")[0]) || 5;
  state.totalVolume += repsMid * wt * block.sets;
  state.doneSets.add(blockIndex);

  const card = document.getElementById(`card-${blockIndex}`);
  const btn  = document.getElementById(`btn-${blockIndex}`);

  if (card) card.classList.add("done");
  if (btn)  { btn.classList.add("done"); btn.textContent = "✓ LOGGED"; }

  updateStats(state.protocol);

  const volStr = wt > 0 ? ` · ${(repsMid * wt * block.sets).toFixed(0)}kg vol` : "";
  log(`SET ${state.doneSets.size} — ${block.exercise}${volStr}`, "hi");
  setStatus(`SET LOGGED · ${state.doneSets.size} COMPLETE`);

  // Update pulse BPM to simulate exertion
  if (window.setPulseBPM) {
    const bpm = 80 + block.rpe * 10 + Math.floor(Math.random() * 10);
    window.setPulseBPM(bpm);
    setTimeout(() => window.setPulseBPM(72), 30000);
  }

  // Start rest timer
  startRestTimer(block.rest, () => {
    log(`REST OVER — ready for next set`, "warn");
    setStatus("REST COMPLETE · INITIATE NEXT SET");
  });

  // Save to localStorage
  saveSession();

  // Check completion
  const totalSets = state.protocol.workoutBlocks.reduce((a, b) => a + b.sets, 0);
  if (state.doneSets.size >= state.protocol.workoutBlocks.length) {
    setTimeout(() => {
      log("PROTOCOL COMPLETE — excellent work", "hi");
      setStatus("SESSION COMPLETE");
      document.getElementById("export-btn").removeAttribute("disabled");
    }, 500);
  }
}

// ── RENDER PROTOCOL ────────────────────────────────────────

function renderProtocol(key) {
  const vp = document.getElementById("viewport");
  vp.classList.add("fading");

  state.doneSets.clear();
  state.totalVolume = 0;
  clearInterval(state.sessionTimerId);

  setTimeout(() => {
    const p = DB.protocols[key];
    if (!p) return;
    state.protocol = p;

    const totalSets = p.workoutBlocks.reduce((a, b) => a + b.sets, 0);

    // Meta pills
    const pillDur  = document.getElementById("pill-dur-val");
    const pillDiff = document.getElementById("pill-diff-val");
    const pillSets = document.getElementById("pill-sets-val");
    if (pillDur)  pillDur.textContent  = `${p.estimatedDuration}min`;
    if (pillDiff) pillDiff.textContent = DB.difficultyLabels[p.difficulty] || "—";
    if (pillSets) pillSets.textContent = `${totalSets} sets`;
    document.querySelectorAll(".meta-pill").forEach((el) => el.classList.add("active"));

    vp.innerHTML = `
      <div class="proto-header">
        <div class="proto-header-left">
          <div class="proto-label">${p.label}</div>
          <div class="proto-status">${p.physiologyStatus}</div>
          <div class="proto-description">${p.description}</div>
        </div>
        <div class="proto-progress-wrap">
          <div class="proto-progress-label">Progress</div>
          <div class="proto-progress-pct" id="proto-pct">0%</div>
          <div class="proto-progress-bar-bg">
            <div class="proto-progress-bar-fill" id="proto-bar-fill"></div>
          </div>
        </div>
      </div>
      <div class="workout-grid">
        ${p.workoutBlocks.map((block, i) => `
          <div class="workout-card" id="card-${i}" style="animation-delay:${i * 0.06}s">
            <div class="card-index">${String(i + 1).padStart(2, "0")} / ${String(p.workoutBlocks.length).padStart(2, "0")}</div>
            <div class="card-exname">${block.exercise}</div>
            <div class="card-metrics">
              <span class="metric-chip"><b>RPE</b> ${block.rpe}</span>
              <span class="metric-chip"><b>REPS</b> ${block.reps}</span>
              <span class="metric-chip"><b>TEMPO</b> ${block.tempo}</span>
              <span class="metric-chip"><b>SETS</b> ${block.sets}</span>
              <span class="metric-chip"><b>REST</b> ${block.rest}s</span>
            </div>
            <div class="card-cues">
              ${block.cues.map((c) => `<div class="cue-item">${c}</div>`).join("")}
            </div>
            <div class="card-footer">
              <div class="card-notes">${block.notes}</div>
              <button class="set-btn" id="btn-${i}" aria-label="Log set for ${block.exercise}">
                ✓ LOG SET
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    vp.classList.remove("fading");

    // Attach log-set handlers
    p.workoutBlocks.forEach((block, i) => {
      document.getElementById(`btn-${i}`)?.addEventListener("click", () => logSet(i, block));
    });

    // Muscle map
    updateMuscleMap(p.targetedMuscles, p.secondaryMuscles);

    // Stats
    updateStats(p);

    // Session timer
    startSessionTimer();

    // Pulse BPM
    if (window.setPulseBPM) window.setPulseBPM(78);

    // Log
    log(`PROTOCOL LOADED: ${p.shortLabel}`, "hi");
    log(`${p.workoutBlocks.length} exercises · ${p.estimatedDuration}min target`);
    setStatus("PROTOCOL LOADED");

    // Export button
    document.getElementById("export-btn").setAttribute("disabled", "");
  }, 340);
}

// ── LOCAL STORAGE ──────────────────────────────────────────

function saveSession() {
  if (!state.protocol) return;
  const data = {
    protocolId:   state.protocol.id,
    doneSets:     [...state.doneSets],
    totalVolume:  state.totalVolume,
    savedAt:      new Date().toISOString(),
  };
  try { localStorage.setItem("bmos_session", JSON.stringify(data)); } catch (_) {}
}

function restoreSession() {
  try {
    const raw = localStorage.getItem("bmos_session");
    if (!raw) return;
    const data = JSON.parse(raw);
    const ago  = (Date.now() - new Date(data.savedAt)) / 1000 / 60;
    if (ago < 120 && data.protocolId) {
      log(`PREVIOUS SESSION FOUND: ${data.protocolId} (${Math.round(ago)}min ago)`, "warn");
    }
  } catch (_) {}
}

// ── EXPORT SESSION ─────────────────────────────────────────

function exportSession() {
  if (!state.protocol) return;
  const totalSets = state.protocol.workoutBlocks.reduce((a, b) => a + b.sets, 0);
  const wt        = parseFloat(document.getElementById("wt-input").value) || 0;

  const output = {
    exportedAt:    new Date().toISOString(),
    protocol:      state.protocol.label,
    load:          wt + " kg",
    durationS:     state.sessionElapsed,
    durationFmt:   formatTime(state.sessionElapsed),
    setsCompleted: state.doneSets.size,
    totalSets,
    volumeKg:      state.totalVolume,
    exercises: state.protocol.workoutBlocks.map((b, i) => ({
      name:      b.exercise,
      completed: state.doneSets.has(i),
      sets:      b.sets,
      reps:      b.reps,
      rpe:       b.rpe,
    })),
  };

  const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `bmos-session-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  log("SESSION EXPORTED TO JSON", "hi");
}

// ── FOOTER DATE ────────────────────────────────────────────

function setFooterDate() {
  const el = document.getElementById("footer-date");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  }).toUpperCase();
}

// ── INIT APP ───────────────────────────────────────────────

function initApp() {
  startClock();
  setFooterDate();
  initPulseCanvas();
  animateInitGrid();
  drawCompletionRing(0);
  restoreSession();

  // Version from data
  if (DB.appVersion) {
    const vEl = document.getElementById("footer-version");
    if (vEl) vEl.textContent = `v${DB.appVersion}`;
  }

  // Protocol select
  document.getElementById("proto-sel").addEventListener("change", (e) => {
    if (e.target.value) renderProtocol(e.target.value);
  });

  // Weight input
  document.getElementById("wt-input").addEventListener("input", () => {
    if (state.protocol) updateStats(state.protocol);
  });

  // Export button
  document.getElementById("export-btn").addEventListener("click", exportSession);

  // Reset button
  document.getElementById("reset-btn").addEventListener("click", resetSystem);

  log("BIO-METRIC OS ONLINE", "hi");
  log(`BUILD ${DB.buildId} · v${DB.appVersion}`);
  log("Awaiting protocol selection…");
}



function resetSystem() {
  if (confirm("REBOOT SYSTEM? This will wipe all current session progress.")) {
    localStorage.removeItem("bmos_session"); // Deletes the saved data[cite: 5]
    window.location.reload(); // Hard refreshes the page to restart the boot sequence[cite: 5]
  }
}