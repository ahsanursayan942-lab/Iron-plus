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

  const wt  = parseFloat(document.getElementById("wt-input").value) || 0;
  const vol = recalcVolume(); // always recompute from current weight

  // Sets
  animateNum(
    parseInt(document.getElementById("stat-sets").textContent) || 0,
    doneSets,
    400,
    (v) => { document.getElementById("stat-sets").textContent = v; }
  );

  // Volume — show live even if 0 once a protocol is loaded
  const volEl = document.getElementById("stat-vol");
  if (volEl) {
    if (doneSets === 0) {
      volEl.textContent = wt > 0 ? "0 kg" : "—";
    } else {
      volEl.textContent = vol.toFixed(1) + " kg";
    }
  }

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

// ── REP PARSER ─────────────────────────────────────────────
// Handles: "10–12", "3–5", "3", "3×15s", "6–8 per side", "5×10s"

function parseRepsMid(repsStr) {
  if (!repsStr) return 5;
  const s = String(repsStr).replace(/\u2013|\u2014/g, "-"); // normalize em/en dash
  // Range like "10-12" or "3-5"
  const range = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  // First number found
  const first = s.match(/(\d+)/);
  if (first) return parseInt(first[1]);
  return 5;
}

// ── VOLUME RECALCULATE ─────────────────────────────────────
// Recomputes total volume from all logged sets + current weight.
// Called whenever weight changes OR a new set is logged.

function recalcVolume() {
  if (!state.protocol) return 0;
  const wt = parseFloat(document.getElementById("wt-input").value) || 0;
  let total = 0;
  state.doneSets.forEach((blockIndex) => {
    const block = state.protocol.workoutBlocks[blockIndex];
    if (!block) return;
    const reps = parseRepsMid(block.reps);
    total += reps * wt; // volume = reps × weight per logged set (1 set logged per block)
  });
  state.totalVolume = total;
  return total;
}

// ── LOG SET ────────────────────────────────────────────────

function logSet(blockIndex, block) {
  if (state.doneSets.has(blockIndex)) return;

  state.doneSets.add(blockIndex);

  const card = document.getElementById(`card-${blockIndex}`);
  const btn  = document.getElementById(`btn-${blockIndex}`);

  if (card) card.classList.add("done");
  if (btn)  { btn.classList.add("done"); btn.textContent = "✓ LOGGED"; }

  const vol    = recalcVolume();
  const wt     = parseFloat(document.getElementById("wt-input").value) || 0;
  const reps   = parseRepsMid(block.reps);
  const setVol = reps * wt;

  updateStats(state.protocol);

  const volStr = wt > 0 ? ` · ${setVol.toFixed(0)}kg vol` : "";
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
      checkAndSaveHistory();
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
  const vol       = recalcVolume();

  const output = {
    exportedAt:    new Date().toISOString(),
    protocol:      state.protocol.label,
    load:          wt + " kg",
    durationS:     state.sessionElapsed,
    durationFmt:   formatTime(state.sessionElapsed),
    setsCompleted: state.doneSets.size,
    totalSets,
    volumeKg:      parseFloat(vol.toFixed(1)),
    exercises: state.protocol.workoutBlocks.map((b, i) => ({
      name:      b.exercise,
      completed: state.doneSets.has(i),
      sets:      b.sets,
      reps:      b.reps,
      repsMid:   parseRepsMid(b.reps),
      rpe:       b.rpe,
      volumeKg:  state.doneSets.has(i) ? parseFloat((parseRepsMid(b.reps) * wt).toFixed(1)) : 0,
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

// ── CUSTOM PROTOCOL DROPDOWN ───────────────────────────────

function initProtocolDropdown() {
  const dropdown = document.getElementById("proto-dropdown");
  const panel    = document.getElementById("proto-dropdown-panel");
  const nativeSel = document.getElementById("proto-sel");
  if (!dropdown || !panel) return;

  const options = panel.querySelectorAll(".proto-dd-option");

  function openDropdown() {
    dropdown.classList.add("open");
    dropdown.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    dropdown.setAttribute("aria-expanded", "false");
  }

  function toggleDropdown() {
    dropdown.classList.contains("open") ? closeDropdown() : openDropdown();
  }

  function selectOption(opt) {
    const value    = opt.dataset.value;
    const label    = opt.dataset.label;
    const sub      = opt.dataset.sub;
    const icon     = opt.dataset.icon;

    // Update trigger display
    document.getElementById("proto-dd-label").textContent = label;
    document.getElementById("proto-dd-sub").textContent   = sub;
    document.getElementById("proto-dd-icon").textContent  = icon;

    // Mark dropdown as selected
    dropdown.classList.add("selected");

    // Active state on options
    options.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");

    // Sync hidden native select
    if (nativeSel) {
      nativeSel.value = value;
      nativeSel.dispatchEvent(new Event("change"));
    }

    closeDropdown();
    renderProtocol(value);
  }

  // Toggle on trigger click
  dropdown.addEventListener("click", (e) => {
    if (!panel.contains(e.target)) toggleDropdown();
  });

  // Keyboard on trigger
  dropdown.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleDropdown(); }
    if (e.key === "Escape") closeDropdown();
  });

  // Option clicks
  options.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      selectOption(opt);
    });
    opt.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOption(opt); }
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) closeDropdown();
  });
}

// ══════════════════════════════════════════════════════════════
// ── BIO-METRIC PROFILE ENGINE ─────────────────────────────────
// ══════════════════════════════════════════════════════════════

// ── STORED PROFILE ────────────────────────────────────────────
const bioProfile = {
  height: 0, weight: 0, age: 0,
  gender: "male", activity: 1.375,
  goal: "maintain", goalCal: 0,
  load: 0,
};

// ── OPEN / CLOSE MODAL ────────────────────────────────────────
function openBioProfile() {
  const backdrop = document.getElementById("bio-profile-backdrop");
  backdrop.removeAttribute("aria-hidden");
  backdrop.classList.add("active");
  document.addEventListener("keydown", bioProfileKey);
}

function closeBioProfile() {
  const backdrop = document.getElementById("bio-profile-backdrop");
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("active");
  document.removeEventListener("keydown", bioProfileKey);
}

function bioProfileKey(e) {
  if (e.key === "Escape") closeBioProfile();
}

// ── CALCULATIONS ──────────────────────────────────────────────

function calcBMR(weight, height, age, gender) {
  // Mifflin-St Jeor
  if (gender === "male")   return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calcTDEE(bmr, activity)  { return bmr * activity; }

function calcBMI(weight, height) {
  const hM = height / 100;
  return weight / (hM * hM);
}

function bmiCategory(bmi) {
  if (bmi < 16)   return { label: "SEVERE UNDERWEIGHT", color: "#ff4e6a", risk: "high" };
  if (bmi < 18.5) return { label: "UNDERWEIGHT",        color: "#f5a623", risk: "moderate" };
  if (bmi < 25)   return { label: "OPTIMAL RANGE",      color: "#00ffa3", risk: "low" };
  if (bmi < 30)   return { label: "OVERWEIGHT",         color: "#f5a623", risk: "moderate" };
  if (bmi < 35)   return { label: "OBESE CLASS I",      color: "#ff4e6a", risk: "high" };
  return              { label: "OBESE CLASS II+",        color: "#ff4e6a", risk: "high" };
}

function calcMacros(tdee, goalCal, weight) {
  const target = tdee + goalCal;
  // Protein: 1.8–2.2g/kg bodyweight (higher for cutting)
  const proteinG  = Math.round(weight * (goalCal < 0 ? 2.2 : goalCal > 0 ? 1.8 : 2.0));
  const proteinCal = proteinG * 4;
  // Fat: 25% of calories
  const fatCal    = target * 0.25;
  const fatG      = Math.round(fatCal / 9);
  // Carbs: remainder
  const carbCal   = target - proteinCal - fatCal;
  const carbG     = Math.round(Math.max(0, carbCal / 4));
  return { target: Math.round(target), proteinG, fatG, carbG, proteinCal: Math.round(proteinCal), fatCal: Math.round(fatCal), carbCal: Math.round(Math.max(0,carbCal)) };
}

function workoutSuitability(bmi, goal, protocol) {
  const results = [];

  // Bodybuilder / Hypertrophy
  let bbScore = 85;
  if (bmi < 16) bbScore = 20;
  else if (bmi < 18.5) bbScore = 55;
  else if (bmi > 35) bbScore = 40;
  if (goal === "bulk") bbScore = Math.min(100, bbScore + 10);
  results.push({ name: "HYPERTROPHY", score: bbScore, ok: bbScore >= 60,
    note: bbScore < 50 ? "Build base strength first — address body composition" :
          bbScore < 70 ? "Suitable with careful load management" : "Excellent fit for your profile" });

  // Powerlifter / CNS
  let plScore = 80;
  if (bmi < 16) plScore = 15;
  else if (bmi < 18.5) plScore = 40;
  else if (bmi > 35) plScore = 35;
  if (goal === "cut") plScore -= 10;
  results.push({ name: "CNS INTENSITY", score: Math.max(0, plScore), ok: plScore >= 60,
    note: plScore < 50 ? "High CNS demand — requires solid nutrition foundation first" :
          plScore < 70 ? "Proceed with reduced intensity, focus on form" : "Strong match — prioritize recovery" });

  // Calisthenics
  let calScore = 75;
  if (bmi < 16) calScore = 30;
  else if (bmi < 18.5) calScore = 65;
  else if (bmi > 30) calScore = 45;
  else if (bmi > 25) calScore = 60;
  if (goal === "cut") calScore = Math.min(100, calScore + 10);
  results.push({ name: "NEUROMUSCULAR", score: Math.max(0, calScore), ok: calScore >= 60,
    note: calScore < 50 ? "Excess load-to-strength ratio — build foundation first" :
          calScore < 70 ? "Modified progressions recommended" : "Ideal — bodyweight protocols suit your metrics" });

  return results;
}

function foodGuidance(goal, bmi) {
  const eat = [], avoid = [];

  if (goal === "cut" || bmi > 25) {
    eat.push("Lean protein: chicken breast, white fish, egg whites, Greek yogurt");
    eat.push("Fibrous vegetables: broccoli, spinach, cucumber, zucchini, celery");
    eat.push("Complex carbs pre-workout: oats, sweet potato, brown rice (small portions)");
    eat.push("Healthy fats: avocado (½ per day), olive oil, walnuts (small handful)");
    eat.push("Hydration: 35ml/kg bodyweight — prioritize water over all else");
    avoid.push("Liquid calories: juice, soda, alcohol, energy drinks");
    avoid.push("Ultra-processed foods: packaged snacks, fast food, white bread");
    avoid.push("High-GI carbs post 6PM: white rice, pasta, potatoes at night");
    avoid.push("Fried foods and trans fats — inflammatory, impair fat metabolism");
    avoid.push("Hidden sugars: sauces, dressings, flavoured yogurts, cereals");
  } else if (goal === "bulk") {
    eat.push("Calorie-dense protein: whole eggs, salmon, lean beef, cottage cheese");
    eat.push("Starchy carbs every meal: rice, pasta, bread, potatoes, oats");
    eat.push("Calorie-dense healthy fats: nut butters, avocado, olive oil, nuts");
    eat.push("Liquid calories when appetite is low: whole milk, banana smoothies");
    eat.push("Pre/post workout: fast carbs + protein within 30min of training");
    avoid.push("Junk food bulking — excess saturated fat impairs anabolic signalling");
    avoid.push("Skipping meals — consistency is critical for surplus maintenance");
    avoid.push("Alcohol — significantly reduces testosterone and protein synthesis");
    avoid.push("Excessive cardio without compensating calories");
    avoid.push("Artificial sweeteners in high quantities — may blunt appetite signals");
  } else {
    eat.push("Balanced protein each meal: eggs, fish, legumes, poultry, tofu");
    eat.push("Mixed complex carbs: quinoa, sweet potato, oats, brown rice");
    eat.push("Antioxidant-rich vegetables: every meal, varied colours");
    eat.push("Omega-3 sources: salmon 2×/week, chia seeds, flaxseed, walnuts");
    eat.push("Fermented foods: Greek yogurt, kefir — gut health supports recovery");
    avoid.push("Skipping meals — undermines hormonal stability and muscle retention");
    avoid.push("Excessive sugar — spikes and crashes impair performance");
    avoid.push("Chronic undereating — cannibalises muscle on maintenance phase");
    avoid.push("Late-night processed carbs — poor nutrient partitioning overnight");
    avoid.push("Dehydration — even 2% drop impairs strength and cognition");
  }
  return { eat, avoid };
}

// ── RENDER RESULTS ────────────────────────────────────────────

function renderBioResults(p) {
  const bmi    = calcBMI(p.weight, p.height);
  const bmiCat = bmiCategory(bmi);
  const bmr    = calcBMR(p.weight, p.height, p.age, p.gender);
  const tdee   = calcTDEE(bmr, p.activity);
  const macros = calcMacros(tdee, p.goalCal, p.weight);
  const workouts = workoutSuitability(bmi, p.goal, null);
  const food   = foodGuidance(p.goal, bmi);

  // Daily protein range
  const protMin = Math.round(p.weight * 1.6);
  const protMax = Math.round(p.weight * 2.4);
  // Monthly protein
  const protMonthMin = Math.round(protMin * 30);
  const protMonthMax = Math.round(protMax * 30);

  const content = document.getElementById("bpm-content");
  const empty   = document.getElementById("bpm-empty");
  if (empty)   empty.style.display = "none";
  if (content) content.style.display = "flex";

  // ── METRIC TILES ──
  document.getElementById("bpm-metrics-row").innerHTML = `
    <div class="bpm-metric-tile">
      <div class="bpm-metric-val">${bmi.toFixed(1)}</div>
      <div class="bpm-metric-unit">BMI</div>
      <div class="bpm-metric-key" style="color:${bmiCat.color}">${bmiCat.label}</div>
    </div>
    <div class="bpm-metric-tile">
      <div class="bpm-metric-val">${Math.round(bmr)}</div>
      <div class="bpm-metric-unit">kcal</div>
      <div class="bpm-metric-key">BMR / DAY</div>
    </div>
    <div class="bpm-metric-tile">
      <div class="bpm-metric-val">${Math.round(tdee)}</div>
      <div class="bpm-metric-unit">kcal</div>
      <div class="bpm-metric-key">TDEE / DAY</div>
    </div>
    <div class="bpm-metric-tile">
      <div class="bpm-metric-val">${macros.target}</div>
      <div class="bpm-metric-unit">kcal</div>
      <div class="bpm-metric-key">TARGET / DAY</div>
    </div>
  `;

  // ── BMI CARD ──
  const bmiPct = Math.min(100, Math.max(0, ((bmi - 10) / (45 - 10)) * 100));
  document.getElementById("bpm-bmi-card").innerHTML = `
    <div class="bpm-card-header">
      <span class="bpm-card-icon">◈</span>
      <span class="bpm-card-title">BODY COMPOSITION INDEX</span>
      <span class="bpm-card-badge" style="background:${bmiCat.color}22;border-color:${bmiCat.color}55;color:${bmiCat.color}">${bmiCat.label}</span>
    </div>
    <div class="bpm-card-body">
      <div class="bpm-bmi-scale">
        <div class="bpm-bmi-track">
          <div class="bpm-bmi-fill" style="width:${bmiPct}%;background:${bmiCat.color}"></div>
          <div class="bpm-bmi-marker" style="left:${bmiPct}%;border-color:${bmiCat.color}"></div>
        </div>
        <div class="bpm-bmi-labels">
          <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45+</span>
        </div>
        <div class="bpm-bmi-zones">
          <span style="color:#ff4e6a">UNDER</span>
          <span style="color:#00ffa3">OPTIMAL</span>
          <span style="color:#f5a623">OVER</span>
          <span style="color:#ff4e6a">OBESE</span>
        </div>
      </div>
      <div class="bpm-risk-row">
        <div class="bpm-risk-item">
          <span class="bpm-risk-key">RISK LEVEL</span>
          <span class="bpm-risk-val" style="color:${bmiCat.color}">${bmiCat.risk.toUpperCase()}</span>
        </div>
        <div class="bpm-risk-item">
          <span class="bpm-risk-key">IDEAL RANGE</span>
          <span class="bpm-risk-val">18.5 – 24.9</span>
        </div>
        <div class="bpm-risk-item">
          <span class="bpm-risk-key">YOUR BMI</span>
          <span class="bpm-risk-val" style="color:${bmiCat.color}">${bmi.toFixed(1)}</span>
        </div>
      </div>
    </div>
  `;

  // ── NUTRITION CARD ──
  const totalMacroCal = macros.proteinCal + macros.fatCal + macros.carbCal;
  const protPct  = Math.round((macros.proteinCal / totalMacroCal) * 100);
  const fatPct   = Math.round((macros.fatCal     / totalMacroCal) * 100);
  const carbPct  = 100 - protPct - fatPct;
  const goalLabel = p.goal === "cut" ? "CALORIC DEFICIT" : p.goal === "bulk" ? "CALORIC SURPLUS" : "MAINTENANCE";
  const goalDelta = p.goalCal > 0 ? `+${p.goalCal}` : p.goalCal < 0 ? `${p.goalCal}` : "±0";

  document.getElementById("bpm-nutrition-card").innerHTML = `
    <div class="bpm-card-header">
      <span class="bpm-card-icon">⬡</span>
      <span class="bpm-card-title">DAILY NUTRITION TARGETS</span>
      <span class="bpm-card-badge">${goalLabel} ${goalDelta} kcal</span>
    </div>
    <div class="bpm-card-body">
      <div class="bpm-nutr-grid">
        <div class="bpm-nutr-item">
          <div class="bpm-nutr-val" style="color:#00ffa3">${macros.proteinG}g</div>
          <div class="bpm-nutr-key">PROTEIN<br>${macros.proteinCal} kcal</div>
        </div>
        <div class="bpm-nutr-item">
          <div class="bpm-nutr-val" style="color:#7c6ff7">${macros.carbG}g</div>
          <div class="bpm-nutr-key">CARBS<br>${macros.carbCal} kcal</div>
        </div>
        <div class="bpm-nutr-item">
          <div class="bpm-nutr-val" style="color:#f5a623">${macros.fatG}g</div>
          <div class="bpm-nutr-key">FAT<br>${macros.fatCal} kcal</div>
        </div>
        <div class="bpm-nutr-item">
          <div class="bpm-nutr-val" style="color:var(--bright)">${macros.target}</div>
          <div class="bpm-nutr-key">TOTAL<br>kcal/day</div>
        </div>
      </div>
      <div class="bpm-macro-bar">
        <div class="bpm-macro-seg" style="width:${protPct}%;background:#00ffa3" title="Protein ${protPct}%"></div>
        <div class="bpm-macro-seg" style="width:${carbPct}%;background:#7c6ff7" title="Carbs ${carbPct}%"></div>
        <div class="bpm-macro-seg" style="width:${fatPct}%;background:#f5a623" title="Fat ${fatPct}%"></div>
      </div>
      <div class="bpm-macro-legend">
        <span><i style="background:#00ffa3"></i> Protein ${protPct}%</span>
        <span><i style="background:#7c6ff7"></i> Carbs ${carbPct}%</span>
        <span><i style="background:#f5a623"></i> Fat ${fatPct}%</span>
      </div>
    </div>
  `;

  // ── PROTEIN TIMELINE CARD ──
  const weeklyProtein = Math.round(((protMin + protMax) / 2) * 7);
  document.getElementById("bpm-protein-card").innerHTML = `
    <div class="bpm-card-header">
      <span class="bpm-card-icon">◆</span>
      <span class="bpm-card-title">PROTEIN INTAKE PROTOCOL</span>
      <span class="bpm-card-badge bpm-badge--green">${protMin}–${protMax}g / DAY</span>
    </div>
    <div class="bpm-card-body">
      <div class="bpm-protein-timeline">
        <div class="bpm-pt-row">
          <div class="bpm-pt-period">DAILY</div>
          <div class="bpm-pt-bar-wrap">
            <div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#00ffa3,#7c6ff7)"></div>
          </div>
          <div class="bpm-pt-val">${protMin}–${protMax}g</div>
        </div>
        <div class="bpm-pt-row">
          <div class="bpm-pt-period">WEEKLY</div>
          <div class="bpm-pt-bar-wrap">
            <div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#7c6ff7,#00ffa3)"></div>
          </div>
          <div class="bpm-pt-val">${Math.round(protMin*7)}–${Math.round(protMax*7)}g</div>
        </div>
        <div class="bpm-pt-row">
          <div class="bpm-pt-period">MONTHLY</div>
          <div class="bpm-pt-bar-wrap">
            <div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#7c6ff7,#ff4e6a)"></div>
          </div>
          <div class="bpm-pt-val">${protMonthMin}–${protMonthMax}g</div>
        </div>
      </div>
      <div class="bpm-protein-notes">
        <div class="bpm-pn-item">◈ Target <strong>${Math.round((protMin+protMax)/2)}g/day</strong> — spread over 4–5 meals (${Math.round((protMin+protMax)/10)}g per meal)</div>
        <div class="bpm-pn-item">◈ Per kg bodyweight: <strong>1.6–2.4g</strong> (optimal muscle protein synthesis range)</div>
        <div class="bpm-pn-item">◈ Post-workout window: consume <strong>${Math.round((protMin+protMax)/8)}–${Math.round((protMin+protMax)/6)}g</strong> within 30–45 minutes</div>
        <div class="bpm-pn-item">◈ Pre-sleep: <strong>30–40g casein</strong> (cottage cheese or slow-release shake) to prevent muscle catabolism</div>
      </div>
    </div>
  `;

  // ── WORKOUT SUITABILITY CARD ──
  const wRows = workouts.map(w => `
    <div class="bpm-workout-row">
      <div class="bpm-wr-left">
        <div class="bpm-wr-name">${w.name}</div>
        <div class="bpm-wr-note">${w.note}</div>
      </div>
      <div class="bpm-wr-right">
        <div class="bpm-wr-score-bar">
          <div class="bpm-wr-fill" style="width:${w.score}%;background:${w.score>=70?'#00ffa3':w.score>=50?'#f5a623':'#ff4e6a'}"></div>
        </div>
        <div class="bpm-wr-score" style="color:${w.score>=70?'#00ffa3':w.score>=50?'#f5a623':'#ff4e6a'}">${w.score}%</div>
        <div class="bpm-wr-badge ${w.ok?'bpm-wr-ok':'bpm-wr-no'}">${w.ok?'SUITABLE':'CAUTION'}</div>
      </div>
    </div>
  `).join("");

  document.getElementById("bpm-workout-card").innerHTML = `
    <div class="bpm-card-header">
      <span class="bpm-card-icon">⚡</span>
      <span class="bpm-card-title">PROTOCOL SUITABILITY ANALYSIS</span>
    </div>
    <div class="bpm-card-body">${wRows}</div>
  `;

  // ── FOOD GUIDANCE CARD ──
  const eatHTML  = food.eat.map(f  => `<div class="bpm-food-item bpm-food-eat"><span class="bpm-food-dot" style="background:#00ffa3"></span>${f}</div>`).join("");
  const avoidHTML= food.avoid.map(f=> `<div class="bpm-food-item bpm-food-avoid"><span class="bpm-food-dot" style="background:#ff4e6a"></span>${f}</div>`).join("");

  document.getElementById("bpm-food-card").innerHTML = `
    <div class="bpm-card-header">
      <span class="bpm-card-icon">◉</span>
      <span class="bpm-card-title">NUTRITIONAL INTELLIGENCE — ${p.goal.toUpperCase()} PHASE</span>
    </div>
    <div class="bpm-card-body">
      <div class="bpm-food-section">
        <div class="bpm-food-heading" style="color:#00ffa3">▶ EAT — OPTIMISE THESE</div>
        ${eatHTML}
      </div>
      <div class="bpm-food-section" style="margin-top:14px">
        <div class="bpm-food-heading" style="color:#ff4e6a">✕ AVOID — ELIMINATE THESE</div>
        ${avoidHTML}
      </div>
    </div>
  `;

  // Update the profile button in the controls bar
  const sub = document.getElementById("profile-btn-sub");
  if (sub) sub.textContent = `${p.weight}kg · ${p.height}cm · BMI ${bmi.toFixed(1)}`;
  const btn = document.getElementById("profile-btn");
  if (btn) btn.classList.add("has-data");

  // Sync load to wt-input for volume calculation
  if (p.load > 0) {
    const wtInput = document.getElementById("wt-input");
    if (wtInput) {
      wtInput.value = p.load;
      if (state.protocol) { recalcVolume(); updateStats(state.protocol); }
    }
  }

  log(`BIO-PROFILE ANALYZED · BMI ${bmi.toFixed(1)} · ${macros.target}kcal target`, "hi");
  log(`PROTEIN: ${protMin}–${protMax}g/day · Load: ${p.load}kg`, "hi");
}

// ── INIT BIO PROFILE MODAL ────────────────────────────────────

function initBioProfile() {
  const backdrop = document.getElementById("bio-profile-backdrop");
  const profileBtn = document.getElementById("profile-btn");
  const closeBtn   = document.getElementById("bpm-close");
  const analyzeBtn = document.getElementById("bpm-analyze");

  if (!backdrop) return;

  // Open
  profileBtn?.addEventListener("click", openBioProfile);

  // Close
  closeBtn?.addEventListener("click", closeBioProfile);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeBioProfile();
  });

  // Toggle buttons (gender)
  document.getElementById("bio-gender")?.querySelectorAll(".bpm-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("bio-gender").querySelectorAll(".bpm-toggle").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Activity buttons
  document.getElementById("bio-activity")?.querySelectorAll(".bpm-act-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("bio-activity").querySelectorAll(".bpm-act-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Goal buttons
  document.getElementById("bio-goal")?.querySelectorAll(".bpm-goal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("bio-goal").querySelectorAll(".bpm-goal-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Analyze
  analyzeBtn?.addEventListener("click", () => {
    const height = parseFloat(document.getElementById("bio-height").value);
    const weight = parseFloat(document.getElementById("bio-weight").value);
    const age    = parseInt(document.getElementById("bio-age").value);
    const load   = parseFloat(document.getElementById("bio-load").value) || 0;

    const genderBtn   = document.querySelector("#bio-gender .bpm-toggle.active");
    const activityBtn = document.querySelector("#bio-activity .bpm-act-btn.active");
    const goalBtn     = document.querySelector("#bio-goal .bpm-goal-btn.active");

    // Validate
    const errors = [];
    if (!height || height < 100 || height > 250) errors.push("Height must be 100–250 cm");
    if (!weight || weight < 30  || weight > 300) errors.push("Weight must be 30–300 kg");
    if (!age    || age    < 14  || age    > 90)  errors.push("Age must be 14–90 years");

    if (errors.length) {
      const existing = document.getElementById("bpm-error");
      if (existing) existing.remove();
      const err = document.createElement("div");
      err.id = "bpm-error";
      err.className = "bpm-error-msg";
      err.innerHTML = errors.map(e => `<span>⚠ ${e}</span>`).join("");
      analyzeBtn.parentNode.insertBefore(err, analyzeBtn);
      setTimeout(() => err?.remove(), 3500);
      return;
    }

    // Clear previous error
    document.getElementById("bpm-error")?.remove();

    // Animate button
    analyzeBtn.classList.add("loading");
    analyzeBtn.querySelector("span").textContent = "SCANNING…";

    setTimeout(() => {
      analyzeBtn.classList.remove("loading");
      analyzeBtn.querySelector("span").textContent = "RUN DIAGNOSTIC";

      // Store profile
      bioProfile.height   = height;
      bioProfile.weight   = weight;
      bioProfile.age      = age;
      bioProfile.load     = load;
      bioProfile.gender   = genderBtn?.dataset.val   || "male";
      bioProfile.activity = parseFloat(activityBtn?.dataset.val || "1.375");
      bioProfile.goal     = goalBtn?.dataset.val     || "maintain";
      bioProfile.goalCal  = parseInt(goalBtn?.dataset.cal || "0");

      renderBioResults(bioProfile);
    }, 900);
  });
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

  // ── CUSTOM PROTOCOL DROPDOWN ──────────────────────────────
  initProtocolDropdown();

  // ── BIO-METRIC PROFILE ────────────────────────────────────
  initBioProfile();

  // ── THEME ─────────────────────────────────────────────────
  initTheme();
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  // ── HISTORY BUTTON ────────────────────────────────────────
  document.getElementById("history-btn")?.addEventListener("click", openHistoryModal);

  // Weight input — recalculate volume live whenever weight changes
  document.getElementById("wt-input").addEventListener("input", () => {
    if (state.protocol) {
      recalcVolume();
      updateStats(state.protocol);
      const wt = parseFloat(document.getElementById("wt-input").value) || 0;
      if (wt > 0 && state.doneSets.size > 0) {
        log(`LOAD UPDATED → ${wt}kg · Volume recalculated`, "warn");
      }
    }
  });

  // Export button
  document.getElementById("export-btn").addEventListener("click", exportSession);

  // Reset button
  document.getElementById("reset-btn").addEventListener("click", resetSystem);

  log("BIO-METRIC OS ONLINE", "hi");
  log(`BUILD ${DB.buildId} · v${DB.appVersion}`);
  log("Awaiting protocol selection…");
}



// ── RESET MODAL ────────────────────────────────────────────

function buildResetModal() {
  if (document.getElementById("reset-modal-backdrop")) return;

  const backdrop = document.createElement("div");
  backdrop.id = "reset-modal-backdrop";
  backdrop.className = "reset-modal-backdrop";
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-label", "System reset confirmation");

  backdrop.innerHTML = `
    <div class="reset-modal" id="reset-modal">
      <div class="reset-modal-header">
        <div class="reset-modal-icon">⚠</div>
        <div class="reset-modal-title">SYSTEM REBOOT</div>
        <div class="reset-modal-tag">CRITICAL</div>
      </div>
      <div class="reset-modal-body">
        <div class="reset-modal-warning">
          <div class="reset-modal-warning-bar"></div>
          <div class="reset-modal-warning-text">
            <strong>⚡ WARNING — IRREVERSIBLE ACTION</strong>
            Initiating a full system reboot will purge all active session
            data and reinitialize the Bio-Metric OS from boot state.
          </div>
        </div>
        <div class="reset-modal-checklist">
          <div class="reset-check-item">
            <div class="reset-check-dot"></div>
            Current protocol selection will be cleared
          </div>
          <div class="reset-check-item">
            <div class="reset-check-dot"></div>
            All logged sets and session volume wiped
          </div>
          <div class="reset-check-item">
            <div class="reset-check-dot"></div>
            Session timer and event log reset to zero
          </div>
          <div class="reset-check-item">
            <div class="reset-check-dot"></div>
            Saved session cache permanently deleted
          </div>
        </div>
      </div>
      <div class="reset-modal-footer">
        <button class="reset-cancel-btn" id="reset-cancel-btn">ABORT</button>
        <button class="reset-confirm-btn" id="reset-confirm-btn">
          <span class="btn-label">CONFIRM REBOOT</span>
          <span class="btn-progress"></span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Close on backdrop click
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeResetModal();
  });

  // Cancel button
  document.getElementById("reset-cancel-btn").addEventListener("click", closeResetModal);

  // Confirm button — 2s hold-to-confirm feel
  const confirmBtn = document.getElementById("reset-confirm-btn");
  const progressEl = confirmBtn.querySelector(".btn-progress");

  confirmBtn.addEventListener("click", () => {
    if (confirmBtn.dataset.ready === "true") {
      // Execute reset
      localStorage.removeItem("bmos_session");
      window.location.reload();
      return;
    }

    // Arm the button with a brief countdown visual
    confirmBtn.dataset.ready = "true";
    confirmBtn.querySelector(".btn-label").textContent = "CLICK AGAIN TO REBOOT";
    confirmBtn.style.borderColor = "var(--accent2)";
    progressEl.style.transition = "none";
    progressEl.style.transform  = "scaleX(0)";
    // Trigger reflow
    void progressEl.offsetWidth;
    progressEl.style.transition = "transform 2.5s linear";
    progressEl.style.transform  = "scaleX(1)";

    // Auto-disarm after 2.5s if not clicked again
    confirmBtn._disarmTimer = setTimeout(() => {
      confirmBtn.dataset.ready = "false";
      confirmBtn.querySelector(".btn-label").textContent = "CONFIRM REBOOT";
      confirmBtn.style.borderColor = "";
      progressEl.style.transition = "none";
      progressEl.style.transform  = "scaleX(0)";
    }, 2500);
  });

  // Keyboard: Escape to close
  document.addEventListener("keydown", handleResetModalKey);
}

function handleResetModalKey(e) {
  if (e.key === "Escape") closeResetModal();
}

function openResetModal() {
  buildResetModal();
  requestAnimationFrame(() => {
    document.getElementById("reset-modal-backdrop").classList.add("active");
  });
  log("REBOOT SEQUENCE INITIATED — AWAITING CONFIRMATION", "warn");
}

function closeResetModal() {
  const backdrop = document.getElementById("reset-modal-backdrop");
  if (!backdrop) return;
  backdrop.classList.remove("active");
  document.removeEventListener("keydown", handleResetModalKey);

  // Reset confirm button state
  const confirmBtn = document.getElementById("reset-confirm-btn");
  if (confirmBtn) {
    clearTimeout(confirmBtn._disarmTimer);
    confirmBtn.dataset.ready = "false";
    confirmBtn.querySelector(".btn-label").textContent = "CONFIRM REBOOT";
    confirmBtn.style.borderColor = "";
    const prog = confirmBtn.querySelector(".btn-progress");
    if (prog) { prog.style.transition = "none"; prog.style.transform = "scaleX(0)"; }
  }

  setTimeout(() => backdrop.remove(), 300);
  log("REBOOT ABORTED", "warn");
}

function resetSystem() {
  openResetModal();
}
// ══════════════════════════════════════════════════════════════
// ── WORKOUT HISTORY TRACKER ────────────────────────────────────
// ══════════════════════════════════════════════════════════════

const HISTORY_KEY = "bmos_history";

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function saveHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-60))); } catch (_) {} // keep last 60 sessions
}

function recordSessionToHistory() {
  if (!state.protocol || state.doneSets.size === 0) return;
  const wt  = parseFloat(document.getElementById("wt-input").value) || 0;
  const vol = recalcVolume();
  const history = getHistory();
  const entry = {
    id:         Date.now(),
    date:       new Date().toISOString(),
    protocolId: state.protocol.id,
    protocolLabel: state.protocol.shortLabel,
    setsLogged: state.doneSets.size,
    totalSets:  state.protocol.workoutBlocks.length,
    volumeKg:   parseFloat(vol.toFixed(1)),
    loadKg:     wt,
    durationS:  state.sessionElapsed,
    exercises:  state.protocol.workoutBlocks
      .filter((_, i) => state.doneSets.has(i))
      .map((b, i) => ({
        name: b.exercise,
        reps: b.reps,
        sets: b.sets,
        rpe:  b.rpe,
        loadKg: wt,
        volumeKg: parseFloat((parseRepsMid(b.reps) * wt).toFixed(1)),
      })),
  };
  history.push(entry);
  saveHistory(history);
  return entry;
}

// ── OVERLOAD ENGINE ───────────────────────────────────────────

function calcProgressiveOverload(exercise, currentLoad, currentReps, currentSets) {
  const history = getHistory();
  const past = history
    .flatMap(s => s.exercises || [])
    .filter(e => e.name === exercise)
    .slice(-10);

  if (past.length < 2) {
    return {
      suggestion: "INSUFFICIENT DATA",
      detail: "Complete 2+ sessions to unlock overload recommendations",
      nextLoad: currentLoad,
      nextReps: currentReps,
      nextSets: currentSets,
      trend: "new",
    };
  }

  const avgLoad = past.reduce((a, b) => a + (b.loadKg || 0), 0) / past.length;
  const lastLoad = past[past.length - 1]?.loadKg || 0;
  const lastVol  = past[past.length - 1]?.volumeKg || 0;
  const prevVol  = past[past.length - 2]?.volumeKg || 0;
  const volTrend = lastVol - prevVol;

  let suggestion, detail, nextLoad, nextReps, nextSets, trend;

  if (volTrend > 0) {
    // Volume increased — suggest load increase
    nextLoad = Math.round((lastLoad * 1.05) * 2) / 2; // +5%, rounded to 0.5kg
    nextReps = currentReps;
    nextSets = currentSets;
    suggestion = `INCREASE LOAD → ${nextLoad}kg`;
    detail = `Volume up ${volTrend.toFixed(1)}kg over last session — ready for +5% load`;
    trend = "up";
  } else if (volTrend === 0) {
    // Same volume — add a rep
    nextLoad = lastLoad;
    nextReps = currentReps + 1;
    nextSets = currentSets;
    suggestion = `ADD 1 REP → ${nextReps} reps`;
    detail = `Volume stalled — increase rep count before adding load`;
    trend = "stable";
  } else {
    // Volume dropped — deload
    nextLoad = Math.round((lastLoad * 0.9) * 2) / 2;
    nextReps = currentReps;
    nextSets = currentSets;
    suggestion = `DELOAD → ${nextLoad}kg`;
    detail = `Volume dropped ${Math.abs(volTrend).toFixed(1)}kg — reduce load 10% for recovery`;
    trend = "down";
  }

  return { suggestion, detail, nextLoad, nextReps, nextSets, trend, history: past };
}

// ── HISTORY MODAL ─────────────────────────────────────────────

function openHistoryModal() {
  const existing = document.getElementById("history-modal-backdrop");
  if (existing) { existing.classList.add("active"); renderHistoryContent(); return; }

  const backdrop = document.createElement("div");
  backdrop.id = "history-modal-backdrop";
  backdrop.className = "hist-backdrop";
  backdrop.innerHTML = `
    <div class="hist-modal" id="hist-modal" role="dialog" aria-label="Workout History">
      <div class="hist-header">
        <div class="hist-header-left">
          <div class="hist-icon">◈</div>
          <div>
            <div class="hist-title">WORKOUT HISTORY</div>
            <div class="hist-subtitle">SESSION ARCHIVE & OVERLOAD ENGINE</div>
          </div>
        </div>
        <button class="hist-close" id="hist-close">✕</button>
      </div>
      <div class="hist-tabs">
        <button class="hist-tab active" data-tab="history">SESSION LOG</button>
        <button class="hist-tab" data-tab="overload">OVERLOAD ENGINE</button>
        <button class="hist-tab" data-tab="trends">VOLUME TRENDS</button>
      </div>
      <div class="hist-body" id="hist-body"></div>
      <div class="hist-footer">
        <button class="hist-clear-btn" id="hist-clear-btn">CLEAR HISTORY</button>
        <button class="hist-export-btn" id="hist-export-btn">EXPORT CSV</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  // Tabs
  backdrop.querySelectorAll(".hist-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      backdrop.querySelectorAll(".hist-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderHistoryTab(tab.dataset.tab);
    });
  });

  document.getElementById("hist-close").addEventListener("click", closeHistoryModal);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) closeHistoryModal(); });
  document.addEventListener("keydown", histModalKey);

  document.getElementById("hist-clear-btn").addEventListener("click", () => {
    if (confirm("Clear all workout history? This cannot be undone.")) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistoryTab("history");
      log("HISTORY CLEARED", "warn");
    }
  });

  document.getElementById("hist-export-btn").addEventListener("click", exportHistoryCSV);

  requestAnimationFrame(() => backdrop.classList.add("active"));
  renderHistoryContent();
}

function histModalKey(e) { if (e.key === "Escape") closeHistoryModal(); }

function closeHistoryModal() {
  const backdrop = document.getElementById("history-modal-backdrop");
  if (!backdrop) return;
  backdrop.classList.remove("active");
  document.removeEventListener("keydown", histModalKey);
}

function renderHistoryContent() { renderHistoryTab("history"); }

function renderHistoryTab(tab) {
  const body = document.getElementById("hist-body");
  if (!body) return;
  if (tab === "history")  renderHistoryList(body);
  if (tab === "overload") renderOverloadTab(body);
  if (tab === "trends")   renderTrendsTab(body);
}

function renderHistoryList(container) {
  const history = getHistory().slice().reverse(); // newest first
  if (history.length === 0) {
    container.innerHTML = `<div class="hist-empty"><div class="hist-empty-icon">◈</div><div>No sessions recorded yet.<br>Complete a workout to build your history.</div></div>`;
    return;
  }

  const diffLabel = (n) => ["","Beginner","Novice","Intermediate","Advanced","Elite"][n] || "—";
  const dateStr = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) + " · " +
           d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
  };

  container.innerHTML = `
    <div class="hist-list">
      ${history.map((s, i) => {
        const completionPct = Math.round((s.setsLogged / s.totalSets) * 100);
        const durMin = s.durationS ? Math.floor(s.durationS / 60) + "m " + (s.durationS % 60) + "s" : "—";
        return `
        <div class="hist-session-card ${i === 0 ? 'hist-session-card--latest' : ''}">
          <div class="hist-sc-top">
            <div class="hist-sc-left">
              ${i === 0 ? '<div class="hist-latest-badge">LATEST</div>' : ''}
              <div class="hist-sc-protocol">${s.protocolLabel || s.protocolId}</div>
              <div class="hist-sc-date">${dateStr(s.date)}</div>
            </div>
            <div class="hist-sc-right">
              <div class="hist-sc-stat">
                <div class="hist-sc-val">${s.volumeKg || "—"}<span>kg</span></div>
                <div class="hist-sc-key">Volume</div>
              </div>
              <div class="hist-sc-stat">
                <div class="hist-sc-val">${s.loadKg || "—"}<span>kg</span></div>
                <div class="hist-sc-key">Load</div>
              </div>
              <div class="hist-sc-stat">
                <div class="hist-sc-val">${s.setsLogged}/${s.totalSets}</div>
                <div class="hist-sc-key">Sets</div>
              </div>
              <div class="hist-sc-stat">
                <div class="hist-sc-val">${durMin}</div>
                <div class="hist-sc-key">Duration</div>
              </div>
            </div>
          </div>
          <div class="hist-sc-bar-bg">
            <div class="hist-sc-bar-fill" style="width:${completionPct}%"></div>
          </div>
          <div class="hist-sc-exercises">
            ${(s.exercises||[]).map(e => `
              <div class="hist-ex-pill">
                <span class="hist-ex-name">${e.name}</span>
                <span class="hist-ex-detail">${e.reps} × ${e.loadKg || "BW"}kg</span>
              </div>
            `).join("")}
          </div>
        </div>
      `}).join("")}
    </div>
  `;
}

function renderOverloadTab(container) {
  const history = getHistory();
  if (history.length < 1) {
    container.innerHTML = `<div class="hist-empty"><div class="hist-empty-icon">⚡</div><div>Complete at least one session to unlock the Progressive Overload Engine.</div></div>`;
    return;
  }

  // Get unique exercises from history
  const exerciseMap = {};
  history.forEach(s => {
    (s.exercises || []).forEach(e => {
      if (!exerciseMap[e.name]) exerciseMap[e.name] = [];
      exerciseMap[e.name].push(e);
    });
  });

  const exercises = Object.keys(exerciseMap);
  if (exercises.length === 0) {
    container.innerHTML = `<div class="hist-empty"><div>No exercise data found.</div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="overload-intro">
      <div class="ol-intro-icon">⚡</div>
      <div class="ol-intro-text">
        <strong>PROGRESSIVE OVERLOAD ENGINE</strong><br>
        AI-driven load recommendations based on your actual performance history.
        Each suggestion uses volume trend analysis to prescribe the optimal next stimulus.
      </div>
    </div>
    <div class="overload-grid">
      ${exercises.map(name => {
        const records = exerciseMap[name];
        const last = records[records.length - 1];
        const result = calcProgressiveOverload(name, last.loadKg || 0, parseRepsMid(last.reps), last.sets || 3);
        const trendIcon = result.trend === "up" ? "▲" : result.trend === "down" ? "▼" : result.trend === "new" ? "◈" : "◆";
        const trendColor = result.trend === "up" ? "#00ffa3" : result.trend === "down" ? "#ff4e6a" : result.trend === "new" ? "#7c6ff7" : "#f5a623";
        const sessions = records.length;

        // Mini volume chart data
        const vols = records.map(r => r.volumeKg || 0);
        const maxV = Math.max(...vols, 1);
        const chartBars = vols.slice(-8).map(v => {
          const h = Math.round((v / maxV) * 32);
          return `<div class="ol-chart-bar" style="height:${Math.max(3,h)}px"></div>`;
        }).join("");

        return `
        <div class="overload-card">
          <div class="ol-card-header">
            <div class="ol-card-name">${name}</div>
            <div class="ol-sessions-badge">${sessions} SESSION${sessions !== 1 ? "S" : ""}</div>
          </div>
          <div class="ol-current-row">
            <div class="ol-curr-item"><span class="ol-curr-key">LAST LOAD</span><span class="ol-curr-val">${last.loadKg || "BW"}kg</span></div>
            <div class="ol-curr-item"><span class="ol-curr-key">LAST REPS</span><span class="ol-curr-val">${last.reps}</span></div>
            <div class="ol-curr-item"><span class="ol-curr-key">LAST VOL</span><span class="ol-curr-val">${last.volumeKg || 0}kg</span></div>
          </div>
          <div class="ol-suggestion-box" style="border-color:${trendColor}33">
            <div class="ol-suggest-header" style="color:${trendColor}">
              <span>${trendIcon}</span>
              <span>${result.suggestion}</span>
            </div>
            <div class="ol-suggest-detail">${result.detail}</div>
          </div>
          <div class="ol-mini-chart">
            <div class="ol-chart-label">VOLUME HISTORY</div>
            <div class="ol-chart-bars">${chartBars}</div>
          </div>
        </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderTrendsTab(container) {
  const history = getHistory();
  if (history.length < 2) {
    container.innerHTML = `<div class="hist-empty"><div class="hist-empty-icon">◆</div><div>Record at least 2 sessions to see volume trends.</div></div>`;
    return;
  }

  // Last 20 sessions
  const sessions = history.slice(-20);
  const maxVol = Math.max(...sessions.map(s => s.volumeKg || 0), 1);
  const maxLoad = Math.max(...sessions.map(s => s.loadKg || 0), 1);

  // Protocol breakdown
  const byProtocol = {};
  history.forEach(s => {
    const k = s.protocolLabel || s.protocolId;
    if (!byProtocol[k]) byProtocol[k] = { count: 0, totalVol: 0, totalLoad: 0 };
    byProtocol[k].count++;
    byProtocol[k].totalVol  += s.volumeKg  || 0;
    byProtocol[k].totalLoad += s.loadKg    || 0;
  });

  const totalVol   = history.reduce((a, s) => a + (s.volumeKg || 0), 0);
  const totalSess  = history.length;
  const avgLoad    = history.reduce((a, s) => a + (s.loadKg || 0), 0) / totalSess;
  const streak     = calcStreak(history);

  container.innerHTML = `
    <div class="trends-summary">
      <div class="trend-stat-tile"><div class="tst-val">${totalSess}</div><div class="tst-key">SESSIONS</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${totalVol.toFixed(0)}<span>kg</span></div><div class="tst-key">TOTAL VOLUME</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${avgLoad.toFixed(1)}<span>kg</span></div><div class="tst-key">AVG LOAD</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${streak}</div><div class="tst-key">DAY STREAK</div></div>
    </div>

    <div class="trends-chart-section">
      <div class="trends-chart-title">VOLUME PER SESSION <span>(last ${sessions.length})</span></div>
      <div class="trends-bar-chart">
        ${sessions.map((s, i) => {
          const h = Math.max(4, Math.round((s.volumeKg || 0) / maxVol * 80));
          const d = new Date(s.date).toLocaleDateString("en-US", {month:"short", day:"numeric"});
          const color = s.protocolId === "bodybuilder" ? "#00ffa3" : s.protocolId === "powerlifter" ? "#ff4e6a" : "#7c6ff7";
          return `
            <div class="tbc-col">
              <div class="tbc-bar" style="height:${h}px;background:${color}" title="${s.protocolLabel}: ${s.volumeKg}kg"></div>
              <div class="tbc-label">${d}</div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="trends-legend">
        <span><i style="background:#00ffa3"></i>HYPERTROPHY</span>
        <span><i style="background:#ff4e6a"></i>CNS INTENSITY</span>
        <span><i style="background:#7c6ff7"></i>NEUROMUSCULAR</span>
      </div>
    </div>

    <div class="trends-protocol-breakdown">
      <div class="trends-chart-title">PROTOCOL BREAKDOWN</div>
      ${Object.entries(byProtocol).map(([name, data]) => {
        const pct = Math.round((data.count / totalSess) * 100);
        const color = name.includes("HYPER") ? "#00ffa3" : name.includes("CNS") ? "#ff4e6a" : "#7c6ff7";
        return `
          <div class="tpb-row">
            <div class="tpb-name">${name}</div>
            <div class="tpb-bar-bg"><div class="tpb-bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <div class="tpb-meta">
              <span>${data.count} sessions</span>
              <span>${data.totalVol.toFixed(0)}kg vol</span>
              <span>${pct}%</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function calcStreak(history) {
  if (!history.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const dates = [...new Set(history.map(s => {
    const d = new Date(s.date);
    d.setHours(0,0,0,0);
    return d.getTime();
  }))].sort((a,b) => b - a);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (dates[i] === expected.getTime()) streak++;
    else break;
  }
  return streak;
}

function exportHistoryCSV() {
  const history = getHistory();
  if (!history.length) return;
  const rows = [["Date","Protocol","Sets","TotalSets","VolumeKg","LoadKg","DurationS"]];
  history.forEach(s => rows.push([
    new Date(s.date).toLocaleDateString(),
    s.protocolLabel || s.protocolId,
    s.setsLogged, s.totalSets,
    s.volumeKg || 0, s.loadKg || 0,
    s.durationS || 0
  ]));
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `bmos-history-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  log("HISTORY EXPORTED TO CSV", "hi");
}

// ── SAVE HISTORY WHEN SESSION COMPLETES ───────────────────────
// Hooked into logSet completion check
function checkAndSaveHistory() {
  if (!state.protocol) return;
  if (state.doneSets.size >= state.protocol.workoutBlocks.length) {
    recordSessionToHistory();
    log("SESSION SAVED TO HISTORY", "hi");
  }
}

// ══════════════════════════════════════════════════════════════
// ── THEME TOGGLE ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

const THEME_KEY = "bmos_theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.textContent = theme === "light" ? "◑ DARK" : "○ LIGHT";
    btn.title = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
  log(`THEME → ${current === "dark" ? "LIGHT" : "DARK"} MODE`, "hi");
}

