/* ============================================================
   BIO-METRIC OS — Iron.js
   Full training intelligence engine. God-tier interactivity.
   ============================================================ */

"use strict";

async function loadData() {
  const res = await fetch("Iron.json");
  if (!res.ok) throw new Error("Failed to load Iron.json");
  return res.json();
}

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
    let i = 0, pct = 0;
    function step() {
      if (i >= BOOT_MESSAGES.length) {
        setTimeout(() => { document.getElementById("boot-overlay").classList.add("hidden"); resolve(); }, 400);
        return;
      }
      const line = document.createElement("div");
      line.className = "boot-line";
      line.textContent = `> ${BOOT_MESSAGES[i]}`;
      linesEl.appendChild(line);
      if (linesEl.children.length > 5) linesEl.children[0].remove();
      const target = Math.round(((i + 1) / BOOT_MESSAGES.length) * 100);
      animateNum(pct, target, 250, (v) => { pct = v; barEl.style.width = v + "%"; pctEl.textContent = v + "%"; });
      pct = target; i++;
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
    cb(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

function nowTimeStr() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`;
}

// ── APP STATE ──────────────────────────────────────────────

const state = {
  protocol: null, doneSets: new Set(), totalVolume: 0,
  sessionStart: null, sessionElapsed: 0, sessionTimerId: null,
  restTimerId: null, restRemaining: 0, restTotal: 0,
};

// ── LIVE CLOCK ─────────────────────────────────────────────

function startClock() {
  const tick = () => { const el = document.getElementById("bm-clock"); if (el) el.textContent = nowTimeStr(); };
  tick(); setInterval(tick, 1000);
}

// ── SESSION TIMER ──────────────────────────────────────────

function startSessionTimer() {
  state.sessionStart = Date.now(); state.sessionElapsed = 0;
  clearInterval(state.sessionTimerId);
  state.sessionTimerId = setInterval(() => {
    state.sessionElapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
    const el = document.getElementById("session-timer");
    if (el) { el.textContent = formatTime(state.sessionElapsed); el.classList.add("active"); }
    updateRemainingEstimate();
  }, 1000);
  const el = document.getElementById("session-timer");
  if (el) { el.textContent = "00:00"; el.classList.add("active"); }
}

function updateRemainingEstimate() {
  if (!state.protocol) return;
  const total = state.protocol.workoutBlocks.reduce((a, b) => a + b.sets, 0);
  const pct   = total > 0 ? state.doneSets.size / total : 0;
  const rem   = Math.max(0, Math.round((state.protocol.estimatedDuration || 60) * 60 * (1 - pct)));
  const el    = document.getElementById("stat-remaining");
  if (el) el.textContent = rem > 0 ? formatTime(rem) : "DONE";
}

// ── BIOMETRIC PULSE CANVAS ─────────────────────────────────

function initPulseCanvas() {
  const canvas = document.getElementById("pulse-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, MID = H / 2;
  const DATA = 80, points = Array(DATA).fill(MID);
  let idx = 0, bpm = 72, beatPhase = 0;

  function nextSample() {
    beatPhase += (bpm / 60) / 30;
    const beat  = Math.max(0, Math.sin(beatPhase * Math.PI * 2));
    const spike = beat > 0.85 ? (beat - 0.85) / 0.15 : 0;
    return MID - spike * (MID * 0.7) - (Math.random() - 0.5) * 3;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, MID); ctx.lineTo(W, MID); ctx.stroke();
    const step = W / DATA;
    ctx.beginPath(); ctx.moveTo(0, points[0]);
    for (let i = 1; i < DATA; i++) ctx.lineTo(i * step, points[i]);
    ctx.strokeStyle = "rgba(0,255,163,0.85)"; ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(0,255,163,0.5)"; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.lineTo(W, MID); ctx.lineTo(0, MID); ctx.closePath();
    ctx.fillStyle = "rgba(0,255,163,0.04)"; ctx.fill();
    ctx.fillStyle = "rgba(0,255,163,0.6)"; ctx.font = "9px 'DM Mono', monospace";
    ctx.textAlign = "right"; ctx.fillText(`${bpm} BPM`, W - 4, 12);
  }

  function tick() { points[idx % DATA] = nextSample(); idx++; draw(); requestAnimationFrame(tick); }
  tick();
  window.setPulseBPM = (v) => { bpm = v; };
}

// ── COMPLETION RING ─────────────────────────────────────────

function drawCompletionRing(pct) {
  const canvas = document.getElementById("completion-ring");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, R = 36;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 6; ctx.stroke();
  if (pct > 0) {
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI/2, -Math.PI/2 + (pct/100)*Math.PI*2);
    const g = ctx.createLinearGradient(cx-R, cy, cx+R, cy);
    g.addColorStop(0, "#7c6ff7"); g.addColorStop(1, "#00ffa3");
    ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0,255,163,0.4)"; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
  }
  const el = document.getElementById("ring-pct");
  if (el) el.textContent = Math.round(pct) + "%";
}

// ── REST TIMER ─────────────────────────────────────────────

function startRestTimer(seconds, onComplete) {
  const overlay = document.getElementById("rest-overlay");
  const cdEl    = document.getElementById("rest-countdown");
  const msgEl   = document.getElementById("rest-msg");
  const skipBtn = document.getElementById("rest-skip");
  const canvas  = document.getElementById("rest-ring");
  const ctx     = canvas.getContext("2d");
  state.restTotal = seconds; state.restRemaining = seconds;
  clearInterval(state.restTimerId);
  overlay.classList.add("active"); overlay.setAttribute("aria-hidden","false");

  function drawRing(rem) {
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,R=65;
    ctx.clearRect(0,0,W,H);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=8; ctx.stroke();
    if (rem/seconds > 0) {
      ctx.beginPath(); ctx.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+(1-rem/seconds)*Math.PI*2);
      const g=ctx.createLinearGradient(cx-R,cy,cx+R,cy);
      g.addColorStop(0,"#ff4e6a"); g.addColorStop(1,"#7c6ff7");
      ctx.strokeStyle=g; ctx.lineWidth=8; ctx.lineCap="round";
      ctx.shadowColor="rgba(255,78,106,0.4)"; ctx.shadowBlur=12; ctx.stroke(); ctx.shadowBlur=0;
    }
  }

  function tick() {
    drawRing(state.restRemaining);
    const m=Math.floor(state.restRemaining/60), s=state.restRemaining%60;
    cdEl.textContent=`${m}:${String(s).padStart(2,"0")}`;
    msgEl.textContent = state.restRemaining>10 ? "Recovering — breathe steady" : state.restRemaining>0 ? "Almost ready…" : "GO!";
    if (state.restRemaining <= 0) { finishRest(); return; }
    state.restRemaining--;
    state.restTimerId = setTimeout(tick, 1000);
  }

  function finishRest() {
    overlay.classList.remove("active"); overlay.setAttribute("aria-hidden","true");
    clearTimeout(state.restTimerId);
    if (typeof onComplete === "function") onComplete();
  }
  skipBtn.onclick = finishRest; tick();
}

// ── MUSCLE MAP ─────────────────────────────────────────────

function updateMuscleMap(primary, secondary=[]) {
  document.querySelectorAll(".muscle-grp").forEach(el => el.classList.remove("active","secondary"));
  primary.forEach(k => (DB.muscleMap[k]||[]).forEach(id => { const el=document.getElementById(id); if(el) el.classList.add("active"); }));
  secondary.forEach(k => (DB.muscleMap[k]||[]).forEach(id => { const el=document.getElementById(id); if(el&&!el.classList.contains("active")) el.classList.add("secondary"); }));
}

// ── TERMINAL LOG ───────────────────────────────────────────

function log(text, type="") {
  const c = document.getElementById("terminal-log"); if (!c) return;
  const e = document.createElement("div"); e.className="log-entry";
  e.innerHTML=`<span class="log-ts">${nowTimeStr()}</span><span class="log-txt ${type}">${text}</span>`;
  c.appendChild(e); c.scrollTop=c.scrollHeight;
  while (c.children.length > 40) c.children[0].remove();
}

function setStatus(text) { const el=document.getElementById("sys-status"); if(el) el.textContent=text; }
function getRPELabel(rpe) { return DB.rpeScale[String(Math.round(rpe))] || "Unknown"; }

// ── STATS UPDATE ───────────────────────────────────────────

function updateStats(protocol) {
  if (!protocol) return;
  const totalSets = protocol.workoutBlocks.reduce((a,b)=>a+b.sets,0);
  const done = state.doneSets.size;
  const pct  = totalSets > 0 ? (done/totalSets)*100 : 0;
  const wt   = parseFloat(document.getElementById("wt-input").value)||0;
  const vol  = recalcVolume();
  animateNum(parseInt(document.getElementById("stat-sets").textContent)||0, done, 400, v=>{document.getElementById("stat-sets").textContent=v;});
  const volEl=document.getElementById("stat-vol");
  if (volEl) volEl.textContent = done===0 ? (wt>0?"0 kg":"—") : vol.toFixed(1)+" kg";
  const avgRPE = protocol.workoutBlocks.reduce((a,b)=>a+b.rpe,0)/protocol.workoutBlocks.length;
  document.getElementById("stat-rpe").textContent  = avgRPE.toFixed(1)+"/10";
  document.getElementById("rpe-bar").style.width   = (avgRPE/10*100)+"%";
  document.getElementById("rpe-label").textContent = getRPELabel(avgRPE);
  drawCompletionRing(pct);
  const pctEl=document.getElementById("proto-pct"), barEl=document.getElementById("proto-bar-fill");
  if (pctEl) pctEl.textContent=Math.round(pct)+"%";
  if (barEl) barEl.style.width=pct+"%";
}

// ── INIT GRID ──────────────────────────────────────────────

function animateInitGrid() {
  const grid=document.getElementById("init-grid"); if(!grid) return;
  grid.innerHTML=""; const cells=[];
  for(let r=0;r<12;r++) for(let c=0;c<20;c++) {
    const cell=document.createElement("div"); cell.className="init-cell"; grid.appendChild(cell); cells.push(cell);
  }
  setInterval(()=>{
    const cell=cells[Math.floor(Math.random()*cells.length)]; cell.classList.add("lit");
    setTimeout(()=>cell.classList.remove("lit"),800+Math.random()*1200);
  },120);
}

// ── REP PARSER ─────────────────────────────────────────────

function parseRepsMid(repsStr) {
  if (!repsStr) return 5;
  const s = String(repsStr).replace(/\u2013|\u2014/g,"-");
  const r = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (r) return Math.round((parseInt(r[1])+parseInt(r[2]))/2);
  const f = s.match(/(\d+)/); return f ? parseInt(f[1]) : 5;
}

// ── VOLUME ─────────────────────────────────────────────────

function recalcVolume() {
  if (!state.protocol) return 0;
  const wt = parseFloat(document.getElementById("wt-input").value)||0;
  let total=0;
  state.doneSets.forEach(i=>{ const b=state.protocol.workoutBlocks[i]; if(b) total+=parseRepsMid(b.reps)*wt; });
  state.totalVolume=total; return total;
}

// ── LOG SET ────────────────────────────────────────────────

function logSet(blockIndex, block) {
  if (state.doneSets.has(blockIndex)) return;
  state.doneSets.add(blockIndex);
  const card=document.getElementById(`card-${blockIndex}`), btn=document.getElementById(`btn-${blockIndex}`);
  if (card) card.classList.add("done");
  if (btn)  { btn.classList.add("done"); btn.textContent="✓ LOGGED"; }
  const wt=parseFloat(document.getElementById("wt-input").value)||0;
  const setVol=parseRepsMid(block.reps)*wt;
  recalcVolume(); updateStats(state.protocol);
  log(`SET ${state.doneSets.size} — ${block.exercise}${wt>0?` · ${setVol.toFixed(0)}kg vol`:""}`, "hi");
  setStatus(`SET LOGGED · ${state.doneSets.size} COMPLETE`);
  if (window.setPulseBPM) { window.setPulseBPM(80+block.rpe*10+Math.floor(Math.random()*10)); setTimeout(()=>window.setPulseBPM(72),30000); }
  startRestTimer(block.rest, ()=>{ log("REST OVER — ready for next set","warn"); setStatus("REST COMPLETE · INITIATE NEXT SET"); });
  saveSession();
  if (state.doneSets.size >= state.protocol.workoutBlocks.length) {
    setTimeout(()=>{ log("PROTOCOL COMPLETE — excellent work","hi"); setStatus("SESSION COMPLETE"); document.getElementById("export-btn").removeAttribute("disabled"); checkAndSaveHistory(); },500);
  }
}

// ── RENDER PROTOCOL ────────────────────────────────────────

function renderProtocol(key) {
  const vp=document.getElementById("viewport"); vp.classList.add("fading");
  state.doneSets.clear(); state.totalVolume=0; clearInterval(state.sessionTimerId);
  setTimeout(()=>{
    const p=DB.protocols[key]; if(!p) return; state.protocol=p;
    const totalSets=p.workoutBlocks.reduce((a,b)=>a+b.sets,0);
    const pd=document.getElementById("pill-dur-val"), pdi=document.getElementById("pill-diff-val"), ps=document.getElementById("pill-sets-val");
    if(pd) pd.textContent=`${p.estimatedDuration}min`;
    if(pdi) pdi.textContent=DB.difficultyLabels[p.difficulty]||"—";
    if(ps) ps.textContent=`${totalSets} sets`;
    document.querySelectorAll(".meta-pill").forEach(el=>el.classList.add("active"));
    vp.innerHTML=`
      <div class="proto-header">
        <div class="proto-header-left">
          <div class="proto-label">${p.label}</div>
          <div class="proto-status">${p.physiologyStatus}</div>
          <div class="proto-description">${p.description}</div>
        </div>
        <div class="proto-progress-wrap">
          <div class="proto-progress-label">Progress</div>
          <div class="proto-progress-pct" id="proto-pct">0%</div>
          <div class="proto-progress-bar-bg"><div class="proto-progress-bar-fill" id="proto-bar-fill"></div></div>
        </div>
      </div>
      <div class="workout-grid">
        ${p.workoutBlocks.map((block,i)=>`
          <div class="workout-card" id="card-${i}" style="animation-delay:${i*0.06}s">
            <div class="card-index">${String(i+1).padStart(2,"0")} / ${String(p.workoutBlocks.length).padStart(2,"0")}</div>
            <div class="card-exname">${block.exercise}</div>
            <div class="card-metrics">
              <span class="metric-chip"><b>RPE</b> ${block.rpe}</span>
              <span class="metric-chip"><b>REPS</b> ${block.reps}</span>
              <span class="metric-chip"><b>TEMPO</b> ${block.tempo}</span>
              <span class="metric-chip"><b>SETS</b> ${block.sets}</span>
              <span class="metric-chip"><b>REST</b> ${block.rest}s</span>
            </div>
            <div class="card-cues">${block.cues.map(c=>`<div class="cue-item">${c}</div>`).join("")}</div>
            <div class="card-footer">
              <div class="card-notes">${block.notes}</div>
              <button class="set-btn" id="btn-${i}" aria-label="Log set for ${block.exercise}">✓ LOG SET</button>
            </div>
          </div>`).join("")}
      </div>`;
    vp.classList.remove("fading");
    p.workoutBlocks.forEach((block,i)=>document.getElementById(`btn-${i}`)?.addEventListener("click",()=>logSet(i,block)));
    updateMuscleMap(p.targetedMuscles, p.secondaryMuscles);
    updateStats(p); startSessionTimer();
    if (window.setPulseBPM) window.setPulseBPM(78);
    log(`PROTOCOL LOADED: ${p.shortLabel}`,"hi");
    log(`${p.workoutBlocks.length} exercises · ${p.estimatedDuration}min target`);
    setStatus("PROTOCOL LOADED");
    document.getElementById("export-btn").setAttribute("disabled","");
  },340);
}

// ── LOCAL STORAGE ──────────────────────────────────────────

function saveSession() {
  if (!state.protocol) return;
  try { localStorage.setItem("bmos_session", JSON.stringify({ protocolId:state.protocol.id, doneSets:[...state.doneSets], totalVolume:state.totalVolume, savedAt:new Date().toISOString() })); } catch(_){}
}

function restoreSession() {
  try {
    const raw=localStorage.getItem("bmos_session"); if(!raw) return;
    const data=JSON.parse(raw), ago=(Date.now()-new Date(data.savedAt))/1000/60;
    if (ago<120&&data.protocolId) log(`PREVIOUS SESSION FOUND: ${data.protocolId} (${Math.round(ago)}min ago)`,"warn");
  } catch(_){}
}

// ── EXPORT SESSION ─────────────────────────────────────────

function exportSession() {
  if (!state.protocol) return;
  const wt=parseFloat(document.getElementById("wt-input").value)||0, vol=recalcVolume();
  const output={ exportedAt:new Date().toISOString(), protocol:state.protocol.label, load:wt+" kg",
    durationS:state.sessionElapsed, durationFmt:formatTime(state.sessionElapsed),
    setsCompleted:state.doneSets.size, totalSets:state.protocol.workoutBlocks.reduce((a,b)=>a+b.sets,0),
    volumeKg:parseFloat(vol.toFixed(1)),
    exercises:state.protocol.workoutBlocks.map((b,i)=>({ name:b.exercise, completed:state.doneSets.has(i), sets:b.sets, reps:b.reps, repsMid:parseRepsMid(b.reps), rpe:b.rpe, volumeKg:state.doneSets.has(i)?parseFloat((parseRepsMid(b.reps)*wt).toFixed(1)):0 })) };
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:"application/json"}));
  a.download=`bmos-session-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
  log("SESSION EXPORTED TO JSON","hi");
}

// ── FOOTER DATE ────────────────────────────────────────────

function setFooterDate() {
  const el=document.getElementById("footer-date"); if(!el) return;
  el.textContent=new Date().toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}).toUpperCase();
}

// ── CUSTOM PROTOCOL DROPDOWN ───────────────────────────────

function initProtocolDropdown() {
  const dropdown=document.getElementById("proto-dropdown"), panel=document.getElementById("proto-dropdown-panel");
  const nativeSel=document.getElementById("proto-sel"); if(!dropdown||!panel) return;
  const options=panel.querySelectorAll(".proto-dd-option");
  const open=()=>{ dropdown.classList.add("open"); dropdown.setAttribute("aria-expanded","true"); };
  const close=()=>{ dropdown.classList.remove("open"); dropdown.setAttribute("aria-expanded","false"); };
  const toggle=()=>dropdown.classList.contains("open")?close():open();
  function selectOption(opt) {
    document.getElementById("proto-dd-label").textContent=opt.dataset.label;
    document.getElementById("proto-dd-sub").textContent=opt.dataset.sub;
    document.getElementById("proto-dd-icon").textContent=opt.dataset.icon;
    dropdown.classList.add("selected"); options.forEach(o=>o.classList.remove("active")); opt.classList.add("active");
    if(nativeSel){nativeSel.value=opt.dataset.value;nativeSel.dispatchEvent(new Event("change"));}
    close(); renderProtocol(opt.dataset.value);
  }
  dropdown.addEventListener("click",(e)=>{ if(!panel.contains(e.target)) toggle(); });
  dropdown.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();} if(e.key==="Escape") close(); });
  options.forEach(opt=>{
    opt.addEventListener("click",(e)=>{e.stopPropagation();selectOption(opt);});
    opt.addEventListener("keydown",(e)=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();selectOption(opt);} });
  });
  document.addEventListener("click",(e)=>{ if(!dropdown.contains(e.target)) close(); });
}

// ══════════════════════════════════════════════════════════════
// ── BIO-METRIC PROFILE ENGINE ─────────────────────────────────
// ══════════════════════════════════════════════════════════════

const bioProfile={height:0,weight:0,age:0,gender:"male",activity:1.375,goal:"maintain",goalCal:0,load:0};

function openBioProfile(){const b=document.getElementById("bio-profile-backdrop");b.removeAttribute("aria-hidden");b.classList.add("active");document.addEventListener("keydown",bioProfileKey);}
function closeBioProfile(){const b=document.getElementById("bio-profile-backdrop");b.setAttribute("aria-hidden","true");b.classList.remove("active");document.removeEventListener("keydown",bioProfileKey);}
function bioProfileKey(e){if(e.key==="Escape")closeBioProfile();}

function calcBMR(w,h,a,g){return g==="male"?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161;}
function calcTDEE(bmr,act){return bmr*act;}
function calcBMI(w,h){const m=h/100;return w/(m*m);}
function bmiCategory(bmi){
  if(bmi<16)   return{label:"SEVERE UNDERWEIGHT",color:"#ff4e6a",risk:"high"};
  if(bmi<18.5) return{label:"UNDERWEIGHT",color:"#f5a623",risk:"moderate"};
  if(bmi<25)   return{label:"OPTIMAL RANGE",color:"#00ffa3",risk:"low"};
  if(bmi<30)   return{label:"OVERWEIGHT",color:"#f5a623",risk:"moderate"};
  if(bmi<35)   return{label:"OBESE CLASS I",color:"#ff4e6a",risk:"high"};
  return{label:"OBESE CLASS II+",color:"#ff4e6a",risk:"high"};
}
function calcMacros(tdee,goalCal,weight){
  const target=tdee+goalCal, proteinG=Math.round(weight*(goalCal<0?2.2:goalCal>0?1.8:2.0));
  const proteinCal=proteinG*4, fatCal=target*0.25, fatG=Math.round(fatCal/9);
  const carbCal=target-proteinCal-fatCal, carbG=Math.round(Math.max(0,carbCal/4));
  return{target:Math.round(target),proteinG,fatG,carbG,proteinCal:Math.round(proteinCal),fatCal:Math.round(fatCal),carbCal:Math.round(Math.max(0,carbCal))};
}
function workoutSuitability(bmi,goal){
  const r=[];
  let bb=85; if(bmi<16)bb=20;else if(bmi<18.5)bb=55;else if(bmi>35)bb=40; if(goal==="bulk")bb=Math.min(100,bb+10);
  r.push({name:"HYPERTROPHY",score:bb,ok:bb>=60,note:bb<50?"Build base strength first — address body composition":bb<70?"Suitable with careful load management":"Excellent fit for your profile"});
  let pl=80; if(bmi<16)pl=15;else if(bmi<18.5)pl=40;else if(bmi>35)pl=35; if(goal==="cut")pl-=10;
  r.push({name:"CNS INTENSITY",score:Math.max(0,pl),ok:pl>=60,note:pl<50?"High CNS demand — requires solid nutrition foundation first":pl<70?"Proceed with reduced intensity, focus on form":"Strong match — prioritize recovery"});
  let cal=75; if(bmi<16)cal=30;else if(bmi<18.5)cal=65;else if(bmi>30)cal=45;else if(bmi>25)cal=60; if(goal==="cut")cal=Math.min(100,cal+10);
  r.push({name:"NEUROMUSCULAR",score:Math.max(0,cal),ok:cal>=60,note:cal<50?"Excess load-to-strength ratio — build foundation first":cal<70?"Modified progressions recommended":"Ideal — bodyweight protocols suit your metrics"});
  return r;
}
function foodGuidance(goal,bmi){
  const eat=[],avoid=[];
  if(goal==="cut"||bmi>25){
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
  } else if(goal==="bulk"){
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
  return{eat,avoid};
}

function renderBioResults(p){
  const bmi=calcBMI(p.weight,p.height), bmiCat=bmiCategory(bmi);
  const bmr=calcBMR(p.weight,p.height,p.age,p.gender), tdee=calcTDEE(bmr,p.activity);
  const macros=calcMacros(tdee,p.goalCal,p.weight), workouts=workoutSuitability(bmi,p.goal), food=foodGuidance(p.goal,bmi);
  const protMin=Math.round(p.weight*1.6), protMax=Math.round(p.weight*2.4);
  const content=document.getElementById("bpm-content"), empty=document.getElementById("bpm-empty");
  if(empty) empty.style.display="none"; if(content) content.style.display="flex";

  document.getElementById("bpm-metrics-row").innerHTML=`
    <div class="bpm-metric-tile"><div class="bpm-metric-val">${bmi.toFixed(1)}</div><div class="bpm-metric-unit">BMI</div><div class="bpm-metric-key" style="color:${bmiCat.color}">${bmiCat.label}</div></div>
    <div class="bpm-metric-tile"><div class="bpm-metric-val">${Math.round(bmr)}</div><div class="bpm-metric-unit">kcal</div><div class="bpm-metric-key">BMR / DAY</div></div>
    <div class="bpm-metric-tile"><div class="bpm-metric-val">${Math.round(tdee)}</div><div class="bpm-metric-unit">kcal</div><div class="bpm-metric-key">TDEE / DAY</div></div>
    <div class="bpm-metric-tile"><div class="bpm-metric-val">${macros.target}</div><div class="bpm-metric-unit">kcal</div><div class="bpm-metric-key">TARGET / DAY</div></div>`;

  const bmiPct=Math.min(100,Math.max(0,((bmi-10)/(45-10))*100));
  document.getElementById("bpm-bmi-card").innerHTML=`
    <div class="bpm-card-header"><span class="bpm-card-icon">◈</span><span class="bpm-card-title">BODY COMPOSITION INDEX</span>
    <span class="bpm-card-badge" style="background:${bmiCat.color}22;border-color:${bmiCat.color}55;color:${bmiCat.color}">${bmiCat.label}</span></div>
    <div class="bpm-card-body">
      <div class="bpm-bmi-scale">
        <div class="bpm-bmi-track"><div class="bpm-bmi-fill" style="width:${bmiPct}%;background:${bmiCat.color}"></div><div class="bpm-bmi-marker" style="left:${bmiPct}%;border-color:${bmiCat.color}"></div></div>
        <div class="bpm-bmi-labels"><span>10</span><span>18.5</span><span>25</span><span>30</span><span>45+</span></div>
        <div class="bpm-bmi-zones"><span style="color:#ff4e6a">UNDER</span><span style="color:#00ffa3">OPTIMAL</span><span style="color:#f5a623">OVER</span><span style="color:#ff4e6a">OBESE</span></div>
      </div>
      <div class="bpm-risk-row">
        <div class="bpm-risk-item"><span class="bpm-risk-key">RISK LEVEL</span><span class="bpm-risk-val" style="color:${bmiCat.color}">${bmiCat.risk.toUpperCase()}</span></div>
        <div class="bpm-risk-item"><span class="bpm-risk-key">IDEAL RANGE</span><span class="bpm-risk-val">18.5 – 24.9</span></div>
        <div class="bpm-risk-item"><span class="bpm-risk-key">YOUR BMI</span><span class="bpm-risk-val" style="color:${bmiCat.color}">${bmi.toFixed(1)}</span></div>
      </div>
    </div>`;

  const tot=macros.proteinCal+macros.fatCal+macros.carbCal;
  const pp=Math.round((macros.proteinCal/tot)*100), fp=Math.round((macros.fatCal/tot)*100), cp=100-pp-fp;
  const gLabel=p.goal==="cut"?"CALORIC DEFICIT":p.goal==="bulk"?"CALORIC SURPLUS":"MAINTENANCE";
  const gDelta=p.goalCal>0?`+${p.goalCal}`:p.goalCal<0?`${p.goalCal}`:"±0";
  document.getElementById("bpm-nutrition-card").innerHTML=`
    <div class="bpm-card-header"><span class="bpm-card-icon">⬡</span><span class="bpm-card-title">DAILY NUTRITION TARGETS</span><span class="bpm-card-badge">${gLabel} ${gDelta} kcal</span></div>
    <div class="bpm-card-body">
      <div class="bpm-nutr-grid">
        <div class="bpm-nutr-item"><div class="bpm-nutr-val" style="color:#00ffa3">${macros.proteinG}g</div><div class="bpm-nutr-key">PROTEIN<br>${macros.proteinCal} kcal</div></div>
        <div class="bpm-nutr-item"><div class="bpm-nutr-val" style="color:#7c6ff7">${macros.carbG}g</div><div class="bpm-nutr-key">CARBS<br>${macros.carbCal} kcal</div></div>
        <div class="bpm-nutr-item"><div class="bpm-nutr-val" style="color:#f5a623">${macros.fatG}g</div><div class="bpm-nutr-key">FAT<br>${macros.fatCal} kcal</div></div>
        <div class="bpm-nutr-item"><div class="bpm-nutr-val" style="color:var(--bright)">${macros.target}</div><div class="bpm-nutr-key">TOTAL<br>kcal/day</div></div>
      </div>
      <div class="bpm-macro-bar">
        <div class="bpm-macro-seg" style="width:${pp}%;background:#00ffa3"></div>
        <div class="bpm-macro-seg" style="width:${cp}%;background:#7c6ff7"></div>
        <div class="bpm-macro-seg" style="width:${fp}%;background:#f5a623"></div>
      </div>
      <div class="bpm-macro-legend">
        <span><i style="background:#00ffa3"></i> Protein ${pp}%</span>
        <span><i style="background:#7c6ff7"></i> Carbs ${cp}%</span>
        <span><i style="background:#f5a623"></i> Fat ${fp}%</span>
      </div>
    </div>`;

  document.getElementById("bpm-protein-card").innerHTML=`
    <div class="bpm-card-header"><span class="bpm-card-icon">◆</span><span class="bpm-card-title">PROTEIN INTAKE PROTOCOL</span><span class="bpm-card-badge bpm-badge--green">${protMin}–${protMax}g / DAY</span></div>
    <div class="bpm-card-body">
      <div class="bpm-protein-timeline">
        <div class="bpm-pt-row"><div class="bpm-pt-period">DAILY</div><div class="bpm-pt-bar-wrap"><div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#00ffa3,#7c6ff7)"></div></div><div class="bpm-pt-val">${protMin}–${protMax}g</div></div>
        <div class="bpm-pt-row"><div class="bpm-pt-period">WEEKLY</div><div class="bpm-pt-bar-wrap"><div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#7c6ff7,#00ffa3)"></div></div><div class="bpm-pt-val">${Math.round(protMin*7)}–${Math.round(protMax*7)}g</div></div>
        <div class="bpm-pt-row"><div class="bpm-pt-period">MONTHLY</div><div class="bpm-pt-bar-wrap"><div class="bpm-pt-bar" style="width:100%;background:linear-gradient(90deg,#7c6ff7,#ff4e6a)"></div></div><div class="bpm-pt-val">${Math.round(protMin*30)}–${Math.round(protMax*30)}g</div></div>
      </div>
      <div class="bpm-protein-notes">
        <div class="bpm-pn-item">◈ Target <strong>${Math.round((protMin+protMax)/2)}g/day</strong> — spread over 4–5 meals (${Math.round((protMin+protMax)/10)}g per meal)</div>
        <div class="bpm-pn-item">◈ Per kg bodyweight: <strong>1.6–2.4g</strong> (optimal muscle protein synthesis range)</div>
        <div class="bpm-pn-item">◈ Post-workout window: consume <strong>${Math.round((protMin+protMax)/8)}–${Math.round((protMin+protMax)/6)}g</strong> within 30–45 minutes</div>
        <div class="bpm-pn-item">◈ Pre-sleep: <strong>30–40g casein</strong> (cottage cheese or slow-release shake) to prevent muscle catabolism</div>
      </div>
    </div>`;

  document.getElementById("bpm-workout-card").innerHTML=`
    <div class="bpm-card-header"><span class="bpm-card-icon">⚡</span><span class="bpm-card-title">PROTOCOL SUITABILITY ANALYSIS</span></div>
    <div class="bpm-card-body">
      ${workouts.map(w=>`
        <div class="bpm-workout-row">
          <div class="bpm-wr-left"><div class="bpm-wr-name">${w.name}</div><div class="bpm-wr-note">${w.note}</div></div>
          <div class="bpm-wr-right">
            <div class="bpm-wr-score-bar"><div class="bpm-wr-fill" style="width:${w.score}%;background:${w.score>=70?"#00ffa3":w.score>=50?"#f5a623":"#ff4e6a"}"></div></div>
            <div class="bpm-wr-score" style="color:${w.score>=70?"#00ffa3":w.score>=50?"#f5a623":"#ff4e6a"}">${w.score}%</div>
            <div class="bpm-wr-badge ${w.ok?"bpm-wr-ok":"bpm-wr-no"}">${w.ok?"SUITABLE":"CAUTION"}</div>
          </div>
        </div>`).join("")}
    </div>`;

  document.getElementById("bpm-food-card").innerHTML=`
    <div class="bpm-card-header"><span class="bpm-card-icon">◉</span><span class="bpm-card-title">NUTRITIONAL INTELLIGENCE — ${p.goal.toUpperCase()} PHASE</span></div>
    <div class="bpm-card-body">
      <div class="bpm-food-section"><div class="bpm-food-heading" style="color:#00ffa3">▶ EAT — OPTIMISE THESE</div>
        ${food.eat.map(f=>`<div class="bpm-food-item bpm-food-eat"><span class="bpm-food-dot" style="background:#00ffa3"></span>${f}</div>`).join("")}
      </div>
      <div class="bpm-food-section" style="margin-top:14px"><div class="bpm-food-heading" style="color:#ff4e6a">✕ AVOID — ELIMINATE THESE</div>
        ${food.avoid.map(f=>`<div class="bpm-food-item bpm-food-avoid"><span class="bpm-food-dot" style="background:#ff4e6a"></span>${f}</div>`).join("")}
      </div>
    </div>`;

  const sub=document.getElementById("profile-btn-sub"); if(sub) sub.textContent=`${p.weight}kg · ${p.height}cm · BMI ${bmi.toFixed(1)}`;
  const btn=document.getElementById("profile-btn"); if(btn) btn.classList.add("has-data");
  if(p.load>0){const wt=document.getElementById("wt-input");if(wt){wt.value=p.load;if(state.protocol){recalcVolume();updateStats(state.protocol);}}}
  log(`BIO-PROFILE ANALYZED · BMI ${bmi.toFixed(1)} · ${macros.target}kcal target`,"hi");
  log(`PROTEIN: ${protMin}–${protMax}g/day · Load: ${p.load}kg`,"hi");
}

function initBioProfile(){
  const backdrop=document.getElementById("bio-profile-backdrop"),profileBtn=document.getElementById("profile-btn"),closeBtn=document.getElementById("bpm-close"),analyzeBtn=document.getElementById("bpm-analyze");
  if(!backdrop) return;
  profileBtn?.addEventListener("click",openBioProfile);
  closeBtn?.addEventListener("click",closeBioProfile);
  backdrop.addEventListener("click",(e)=>{ if(e.target===backdrop) closeBioProfile(); });
  document.getElementById("bio-gender")?.querySelectorAll(".bpm-toggle").forEach(btn=>{btn.addEventListener("click",()=>{document.getElementById("bio-gender").querySelectorAll(".bpm-toggle").forEach(b=>b.classList.remove("active"));btn.classList.add("active");});});
  document.getElementById("bio-activity")?.querySelectorAll(".bpm-act-btn").forEach(btn=>{btn.addEventListener("click",()=>{document.getElementById("bio-activity").querySelectorAll(".bpm-act-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");});});
  document.getElementById("bio-goal")?.querySelectorAll(".bpm-goal-btn").forEach(btn=>{btn.addEventListener("click",()=>{document.getElementById("bio-goal").querySelectorAll(".bpm-goal-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");});});
  analyzeBtn?.addEventListener("click",()=>{
    const height=parseFloat(document.getElementById("bio-height").value), weight=parseFloat(document.getElementById("bio-weight").value), age=parseInt(document.getElementById("bio-age").value), load=parseFloat(document.getElementById("bio-load").value)||0;
    const genderBtn=document.querySelector("#bio-gender .bpm-toggle.active"), activityBtn=document.querySelector("#bio-activity .bpm-act-btn.active"), goalBtn=document.querySelector("#bio-goal .bpm-goal-btn.active");
    const errors=[];
    if(!height||height<100||height>250) errors.push("Height must be 100–250 cm");
    if(!weight||weight<30||weight>300)  errors.push("Weight must be 30–300 kg");
    if(!age||age<14||age>90)            errors.push("Age must be 14–90 years");
    if(errors.length){
      document.getElementById("bpm-error")?.remove();
      const err=document.createElement("div"); err.id="bpm-error"; err.className="bpm-error-msg";
      err.innerHTML=errors.map(e=>`<span>⚠ ${e}</span>`).join("");
      analyzeBtn.parentNode.insertBefore(err,analyzeBtn); setTimeout(()=>err?.remove(),3500); return;
    }
    document.getElementById("bpm-error")?.remove();
    analyzeBtn.classList.add("loading"); analyzeBtn.querySelector("span").textContent="SCANNING…";
    setTimeout(()=>{
      analyzeBtn.classList.remove("loading"); analyzeBtn.querySelector("span").textContent="RUN DIAGNOSTIC";
      bioProfile.height=height; bioProfile.weight=weight; bioProfile.age=age; bioProfile.load=load;
      bioProfile.gender=genderBtn?.dataset.val||"male";
      bioProfile.activity=parseFloat(activityBtn?.dataset.val||"1.375");
      bioProfile.goal=goalBtn?.dataset.val||"maintain";
      bioProfile.goalCal=parseInt(goalBtn?.dataset.cal||"0");
      renderBioResults(bioProfile);
    },900);
  });
}

// ── INIT APP ───────────────────────────────────────────────

function initApp(){
  startClock(); setFooterDate(); initPulseCanvas(); animateInitGrid(); drawCompletionRing(0); restoreSession();
  if(DB.appVersion){const v=document.getElementById("footer-version"); if(v) v.textContent=`v${DB.appVersion}`;}
  initProtocolDropdown(); initBioProfile(); initTheme();
  document.getElementById("theme-toggle-btn")?.addEventListener("click",toggleTheme);
  document.getElementById("history-btn")?.addEventListener("click",openHistoryModal);
  document.getElementById("wt-input").addEventListener("input",()=>{
    if(state.protocol){ recalcVolume(); updateStats(state.protocol);
      const wt=parseFloat(document.getElementById("wt-input").value)||0;
      if(wt>0&&state.doneSets.size>0) log(`LOAD UPDATED → ${wt}kg · Volume recalculated`,"warn");
    }
  });
  document.getElementById("export-btn").addEventListener("click",exportSession);
  document.getElementById("reset-btn").addEventListener("click",resetSystem);
  log("BIO-METRIC OS ONLINE","hi"); log(`BUILD ${DB.buildId} · v${DB.appVersion}`); log("Awaiting protocol selection…");
}

// ── RESET MODAL ────────────────────────────────────────────

function buildResetModal(){
  if(document.getElementById("reset-modal-backdrop")) return;
  const backdrop=document.createElement("div"); backdrop.id="reset-modal-backdrop"; backdrop.className="reset-modal-backdrop"; backdrop.setAttribute("aria-modal","true"); backdrop.setAttribute("role","dialog");
  backdrop.innerHTML=`
    <div class="reset-modal" id="reset-modal">
      <div class="reset-modal-header"><div class="reset-modal-icon">⚠</div><div class="reset-modal-title">SYSTEM REBOOT</div><div class="reset-modal-tag">CRITICAL</div></div>
      <div class="reset-modal-body">
        <div class="reset-modal-warning"><div class="reset-modal-warning-bar"></div>
          <div class="reset-modal-warning-text"><strong>⚡ WARNING — IRREVERSIBLE ACTION</strong>Initiating a full system reboot will purge all active session data and reinitialize the Bio-Metric OS from boot state.</div>
        </div>
        <div class="reset-modal-checklist">
          <div class="reset-check-item"><div class="reset-check-dot"></div>Current protocol selection will be cleared</div>
          <div class="reset-check-item"><div class="reset-check-dot"></div>All logged sets and session volume wiped</div>
          <div class="reset-check-item"><div class="reset-check-dot"></div>Session timer and event log reset to zero</div>
          <div class="reset-check-item"><div class="reset-check-dot"></div>Saved session cache permanently deleted</div>
        </div>
      </div>
      <div class="reset-modal-footer">
        <button class="reset-cancel-btn" id="reset-cancel-btn">ABORT</button>
        <button class="reset-confirm-btn" id="reset-confirm-btn"><span class="btn-label">CONFIRM REBOOT</span><span class="btn-progress"></span></button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click",(e)=>{ if(e.target===backdrop) closeResetModal(); });
  document.getElementById("reset-cancel-btn").addEventListener("click",closeResetModal);
  const confirmBtn=document.getElementById("reset-confirm-btn"), progressEl=confirmBtn.querySelector(".btn-progress");
  confirmBtn.addEventListener("click",()=>{
    if(confirmBtn.dataset.ready==="true"){localStorage.removeItem("bmos_session");localStorage.removeItem("bmos_history");localStorage.removeItem("bmos_theme");window.location.reload();return;}
    confirmBtn.dataset.ready="true"; confirmBtn.querySelector(".btn-label").textContent="CLICK AGAIN TO REBOOT";
    confirmBtn.style.borderColor="var(--accent2)"; progressEl.style.transition="none"; progressEl.style.transform="scaleX(0)";
    void progressEl.offsetWidth; progressEl.style.transition="transform 2.5s linear"; progressEl.style.transform="scaleX(1)";
    confirmBtn._disarmTimer=setTimeout(()=>{
      confirmBtn.dataset.ready="false"; confirmBtn.querySelector(".btn-label").textContent="CONFIRM REBOOT";
      confirmBtn.style.borderColor=""; progressEl.style.transition="none"; progressEl.style.transform="scaleX(0)";
    },2500);
  });
  document.addEventListener("keydown",handleResetModalKey);
}
function handleResetModalKey(e){if(e.key==="Escape")closeResetModal();}
function openResetModal(){buildResetModal();requestAnimationFrame(()=>document.getElementById("reset-modal-backdrop").classList.add("active"));log("REBOOT SEQUENCE INITIATED — AWAITING CONFIRMATION","warn");}
function closeResetModal(){
  const backdrop=document.getElementById("reset-modal-backdrop"); if(!backdrop) return;
  backdrop.classList.remove("active"); document.removeEventListener("keydown",handleResetModalKey);
  const cb=document.getElementById("reset-confirm-btn");
  if(cb){clearTimeout(cb._disarmTimer);cb.dataset.ready="false";cb.querySelector(".btn-label").textContent="CONFIRM REBOOT";cb.style.borderColor="";const p=cb.querySelector(".btn-progress");if(p){p.style.transition="none";p.style.transform="scaleX(0)";}}
  setTimeout(()=>backdrop.remove(),300); log("REBOOT ABORTED","warn");
}
function resetSystem(){openResetModal();}

// ══════════════════════════════════════════════════════════════
// ── WORKOUT HISTORY TRACKER ────────────────────────────────────
// ══════════════════════════════════════════════════════════════

const HISTORY_KEY="bmos_history";
function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");}catch{return[];}}
function saveHistory(h){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(-60)));}catch(_){}}

function recordSessionToHistory(){
  if(!state.protocol||state.doneSets.size===0) return;
  const wt=parseFloat(document.getElementById("wt-input").value)||0, vol=recalcVolume();
  const history=getHistory();
  history.push({id:Date.now(),date:new Date().toISOString(),protocolId:state.protocol.id,protocolLabel:state.protocol.shortLabel,
    setsLogged:state.doneSets.size,totalSets:state.protocol.workoutBlocks.length,
    volumeKg:parseFloat(vol.toFixed(1)),loadKg:wt,durationS:state.sessionElapsed,
    exercises:state.protocol.workoutBlocks.filter((_,i)=>state.doneSets.has(i)).map(b=>({
      name:b.exercise,reps:b.reps,sets:b.sets,rpe:b.rpe,loadKg:wt,volumeKg:parseFloat((parseRepsMid(b.reps)*wt).toFixed(1))
    }))});
  saveHistory(history);
}

// ── OVERLOAD ENGINE ───────────────────────────────────────────

function calcProgressiveOverload(exercise,currentLoad,currentReps,currentSets){
  const past=getHistory().flatMap(s=>s.exercises||[]).filter(e=>e.name===exercise).slice(-10);
  if(past.length<2) return{suggestion:"INSUFFICIENT DATA",detail:"Complete 2+ sessions to unlock overload recommendations",nextLoad:currentLoad,nextReps:currentReps,nextSets:currentSets,trend:"new"};
  const lastLoad=past[past.length-1]?.loadKg||0, lastVol=past[past.length-1]?.volumeKg||0, prevVol=past[past.length-2]?.volumeKg||0, vt=lastVol-prevVol;
  let suggestion,detail,nextLoad,nextReps,nextSets,trend;
  if(vt>0){nextLoad=Math.round((lastLoad*1.05)*2)/2;nextReps=currentReps;nextSets=currentSets;suggestion=`INCREASE LOAD → ${nextLoad}kg`;detail=`Volume up ${vt.toFixed(1)}kg over last session — ready for +5% load`;trend="up";}
  else if(vt===0){nextLoad=lastLoad;nextReps=currentReps+1;nextSets=currentSets;suggestion=`ADD 1 REP → ${nextReps} reps`;detail=`Volume stalled — increase rep count before adding load`;trend="stable";}
  else{nextLoad=Math.round((lastLoad*0.9)*2)/2;nextReps=currentReps;nextSets=currentSets;suggestion=`DELOAD → ${nextLoad}kg`;detail=`Volume dropped ${Math.abs(vt).toFixed(1)}kg — reduce load 10% for recovery`;trend="down";}
  return{suggestion,detail,nextLoad,nextReps,nextSets,trend,history:past};
}

// ══════════════════════════════════════════════════════════════
// ── PREMIUM CLEAR HISTORY MODAL ───────────────────────────────
//    Replaces the plain browser confirm() with a fully styled
//    on-brand confirmation dialog matching the app aesthetic.
// ══════════════════════════════════════════════════════════════

function openClearHistoryModal(onConfirm){
  document.getElementById("clear-hist-backdrop")?.remove();
  const backdrop=document.createElement("div"); backdrop.id="clear-hist-backdrop"; backdrop.className="clear-hist-backdrop";
  backdrop.innerHTML=`
    <div class="clear-hist-modal" id="clear-hist-modal" role="dialog" aria-modal="true" aria-label="Clear history confirmation">
      <div class="chm-header">
        <div class="chm-icon-wrap"><div class="chm-icon-pulse"></div><div class="chm-icon">◈</div></div>
        <div class="chm-title-block"><div class="chm-title">PURGE HISTORY</div><div class="chm-tag">IRREVERSIBLE</div></div>
        <button class="chm-close" id="chm-close" aria-label="Close">✕</button>
      </div>
      <div class="chm-body">
        <div class="chm-warning-row">
          <div class="chm-warn-bar"></div>
          <div class="chm-warn-text">
            <span class="chm-warn-title">⚡ ARCHIVE DELETION REQUESTED</span>
            <span>All session records, volume trends, and progressive overload data will be permanently erased from local storage. This cannot be reversed.</span>
          </div>
        </div>
        <div class="chm-data-preview">
          <div class="chm-preview-label">DATA TARGETED FOR DELETION</div>
          <div class="chm-preview-grid" id="chm-preview-grid"></div>
        </div>
        <div class="chm-checklist">
          <div class="chm-check-row"><span class="chm-check-dot chm-dot-red"></span>All workout sessions erased</div>
          <div class="chm-check-row"><span class="chm-check-dot chm-dot-red"></span>Volume trend charts reset</div>
          <div class="chm-check-row"><span class="chm-check-dot chm-dot-red"></span>Overload engine data wiped</div>
          <div class="chm-check-row"><span class="chm-check-dot chm-dot-red"></span>Day streak counter set to zero</div>
        </div>
      </div>
      <div class="chm-footer">
        <button class="chm-cancel-btn" id="chm-cancel-btn"><span class="chm-cancel-icon">←</span> ABORT</button>
        <button class="chm-confirm-btn" id="chm-confirm-btn">
          <span class="chm-confirm-icon">◈</span>
          <span class="chm-confirm-label">PURGE ALL DATA</span>
          <span class="chm-confirm-progress"></span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  // Fill live stats
  const history=getHistory(), totalVol=history.reduce((a,s)=>a+(s.volumeKg||0),0);
  const streak=calcStreak(history), uniqueEx=[...new Set(history.flatMap(s=>(s.exercises||[]).map(e=>e.name)))].length;
  document.getElementById("chm-preview-grid").innerHTML=`
    <div class="chm-prev-tile"><div class="chm-prev-val">${history.length}</div><div class="chm-prev-key">SESSIONS</div></div>
    <div class="chm-prev-tile"><div class="chm-prev-val">${totalVol.toFixed(0)}<span>kg</span></div><div class="chm-prev-key">TOTAL VOL</div></div>
    <div class="chm-prev-tile"><div class="chm-prev-val">${streak}</div><div class="chm-prev-key">DAY STREAK</div></div>
    <div class="chm-prev-tile"><div class="chm-prev-val">${uniqueEx}</div><div class="chm-prev-key">EXERCISES</div></div>`;

  requestAnimationFrame(()=>backdrop.classList.add("active"));

  function closeModal(){backdrop.classList.remove("active");setTimeout(()=>backdrop.remove(),300);document.removeEventListener("keydown",onKey);}
  document.getElementById("chm-close").addEventListener("click",closeModal);
  document.getElementById("chm-cancel-btn").addEventListener("click",closeModal);
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});

  const confirmBtn=document.getElementById("chm-confirm-btn"), progressEl=confirmBtn.querySelector(".chm-confirm-progress"), labelEl=confirmBtn.querySelector(".chm-confirm-label");
  confirmBtn.addEventListener("click",()=>{
    if(confirmBtn.dataset.ready==="true"){closeModal();onConfirm();return;}
    confirmBtn.dataset.ready="true"; labelEl.textContent="TAP AGAIN TO CONFIRM"; confirmBtn.classList.add("chm-confirm-btn--armed");
    progressEl.style.transition="none"; progressEl.style.transform="scaleX(0)";
    void progressEl.offsetWidth; progressEl.style.transition="transform 2.5s linear"; progressEl.style.transform="scaleX(1)";
    confirmBtn._disarm=setTimeout(()=>{confirmBtn.dataset.ready="false";labelEl.textContent="PURGE ALL DATA";confirmBtn.classList.remove("chm-confirm-btn--armed");progressEl.style.transition="none";progressEl.style.transform="scaleX(0)";},2500);
  });
  function onKey(e){if(e.key==="Escape")closeModal();}
  document.addEventListener("keydown",onKey);
}

// ── HISTORY MODAL ─────────────────────────────────────────────

function openHistoryModal(){
  const existing=document.getElementById("history-modal-backdrop");
  if(existing){existing.classList.add("active");renderHistoryContent();return;}
  const backdrop=document.createElement("div"); backdrop.id="history-modal-backdrop"; backdrop.className="hist-backdrop";
  backdrop.innerHTML=`
    <div class="hist-modal" id="hist-modal" role="dialog" aria-label="Workout History">
      <div class="hist-header">
        <div class="hist-header-left">
          <div class="hist-icon">◈</div>
          <div><div class="hist-title">WORKOUT HISTORY</div><div class="hist-subtitle">SESSION ARCHIVE & OVERLOAD ENGINE</div></div>
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
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.querySelectorAll(".hist-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{backdrop.querySelectorAll(".hist-tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");renderHistoryTab(tab.dataset.tab);});
  });
  document.getElementById("hist-close").addEventListener("click",closeHistoryModal);
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeHistoryModal();});
  document.addEventListener("keydown",histModalKey);

  // ── Premium Clear History — replaces plain browser confirm() ──
  document.getElementById("hist-clear-btn").addEventListener("click",()=>{
    openClearHistoryModal(()=>{localStorage.removeItem(HISTORY_KEY);renderHistoryTab("history");log("HISTORY PURGED — ARCHIVE CLEARED","warn");});
  });

  document.getElementById("hist-export-btn").addEventListener("click",exportHistoryCSV);
  requestAnimationFrame(()=>backdrop.classList.add("active"));
  renderHistoryContent();
}

function histModalKey(e){if(e.key==="Escape")closeHistoryModal();}
function closeHistoryModal(){const b=document.getElementById("history-modal-backdrop");if(!b)return;b.classList.remove("active");document.removeEventListener("keydown",histModalKey);setTimeout(()=>b.remove(),300);}
function renderHistoryContent(){renderHistoryTab("history");}
function renderHistoryTab(tab){const body=document.getElementById("hist-body");if(!body)return;if(tab==="history")renderHistoryList(body);if(tab==="overload")renderOverloadTab(body);if(tab==="trends")renderTrendsTab(body);}

function renderHistoryList(container){
  const history=getHistory().slice().reverse();
  if(!history.length){container.innerHTML=`<div class="hist-empty"><div class="hist-empty-icon">◈</div><div>No sessions recorded yet.<br>Complete a workout to build your history.</div></div>`;return;}
  const dateStr=iso=>{const d=new Date(iso);return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" · "+d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});};
  container.innerHTML=`<div class="hist-list">${history.map((s,i)=>{
    const pct=Math.round((s.setsLogged/s.totalSets)*100), dur=s.durationS?Math.floor(s.durationS/60)+"m "+(s.durationS%60)+"s":"—";
    return `<div class="hist-session-card ${i===0?"hist-session-card--latest":""}">
      <div class="hist-sc-top">
        <div class="hist-sc-left">${i===0?'<div class="hist-latest-badge">LATEST</div>':""}<div class="hist-sc-protocol">${s.protocolLabel||s.protocolId}</div><div class="hist-sc-date">${dateStr(s.date)}</div></div>
        <div class="hist-sc-right">
          <div class="hist-sc-stat"><div class="hist-sc-val">${s.volumeKg||"—"}<span>kg</span></div><div class="hist-sc-key">Volume</div></div>
          <div class="hist-sc-stat"><div class="hist-sc-val">${s.loadKg||"—"}<span>kg</span></div><div class="hist-sc-key">Load</div></div>
          <div class="hist-sc-stat"><div class="hist-sc-val">${s.setsLogged}/${s.totalSets}</div><div class="hist-sc-key">Sets</div></div>
          <div class="hist-sc-stat"><div class="hist-sc-val">${dur}</div><div class="hist-sc-key">Duration</div></div>
        </div>
      </div>
      <div class="hist-sc-bar-bg"><div class="hist-sc-bar-fill" style="width:${pct}%"></div></div>
      <div class="hist-sc-exercises">${(s.exercises||[]).map(e=>`<div class="hist-ex-pill"><span class="hist-ex-name">${e.name}</span><span class="hist-ex-detail">${e.reps} × ${e.loadKg||"BW"}kg</span></div>`).join("")}</div>
    </div>`;}).join("")}</div>`;
}

function renderOverloadTab(container){
  const history=getHistory();
  if(!history.length){container.innerHTML=`<div class="hist-empty"><div class="hist-empty-icon">⚡</div><div>Complete at least one session to unlock the Progressive Overload Engine.</div></div>`;return;}
  const exerciseMap={};
  history.forEach(s=>(s.exercises||[]).forEach(e=>{if(!exerciseMap[e.name])exerciseMap[e.name]=[];exerciseMap[e.name].push(e);}));
  const exercises=Object.keys(exerciseMap);
  if(!exercises.length){container.innerHTML=`<div class="hist-empty"><div>No exercise data found.</div></div>`;return;}
  container.innerHTML=`
    <div class="overload-intro"><div class="ol-intro-icon">⚡</div><div class="ol-intro-text"><strong>PROGRESSIVE OVERLOAD ENGINE</strong><br>AI-driven load recommendations based on your actual performance history. Each suggestion uses volume trend analysis to prescribe the optimal next stimulus.</div></div>
    <div class="overload-grid">${exercises.map(name=>{
      const records=exerciseMap[name], last=records[records.length-1];
      const result=calcProgressiveOverload(name,last.loadKg||0,parseRepsMid(last.reps),last.sets||3);
      const ti=result.trend==="up"?"▲":result.trend==="down"?"▼":result.trend==="new"?"◈":"◆";
      const tc=result.trend==="up"?"#00ffa3":result.trend==="down"?"#ff4e6a":result.trend==="new"?"#7c6ff7":"#f5a623";
      const vols=records.map(r=>r.volumeKg||0), maxV=Math.max(...vols,1);
      const bars=vols.slice(-8).map(v=>`<div class="ol-chart-bar" style="height:${Math.max(3,Math.round((v/maxV)*32))}px"></div>`).join("");
      return `<div class="overload-card">
        <div class="ol-card-header"><div class="ol-card-name">${name}</div><div class="ol-sessions-badge">${records.length} SESSION${records.length!==1?"S":""}</div></div>
        <div class="ol-current-row">
          <div class="ol-curr-item"><span class="ol-curr-key">LAST LOAD</span><span class="ol-curr-val">${last.loadKg||"BW"}kg</span></div>
          <div class="ol-curr-item"><span class="ol-curr-key">LAST REPS</span><span class="ol-curr-val">${last.reps}</span></div>
          <div class="ol-curr-item"><span class="ol-curr-key">LAST VOL</span><span class="ol-curr-val">${last.volumeKg||0}kg</span></div>
        </div>
        <div class="ol-suggestion-box" style="border-color:${tc}33"><div class="ol-suggest-header" style="color:${tc}"><span>${ti}</span><span>${result.suggestion}</span></div><div class="ol-suggest-detail">${result.detail}</div></div>
        <div class="ol-mini-chart"><div class="ol-chart-label">VOLUME HISTORY</div><div class="ol-chart-bars">${bars}</div></div>
      </div>`;
    }).join("")}</div>`;
}

function renderTrendsTab(container){
  const history=getHistory();
  if(history.length<2){container.innerHTML=`<div class="hist-empty"><div class="hist-empty-icon">◆</div><div>Record at least 2 sessions to see volume trends.</div></div>`;return;}
  const sessions=history.slice(-20), maxVol=Math.max(...sessions.map(s=>s.volumeKg||0),1);
  const byProtocol={};
  history.forEach(s=>{const k=s.protocolLabel||s.protocolId;if(!byProtocol[k])byProtocol[k]={count:0,totalVol:0};byProtocol[k].count++;byProtocol[k].totalVol+=s.volumeKg||0;});
  const totalVol=history.reduce((a,s)=>a+(s.volumeKg||0),0), totalSess=history.length;
  const avgLoad=history.reduce((a,s)=>a+(s.loadKg||0),0)/totalSess, streak=calcStreak(history);
  container.innerHTML=`
    <div class="trends-summary">
      <div class="trend-stat-tile"><div class="tst-val">${totalSess}</div><div class="tst-key">SESSIONS</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${totalVol.toFixed(0)}<span>kg</span></div><div class="tst-key">TOTAL VOLUME</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${avgLoad.toFixed(1)}<span>kg</span></div><div class="tst-key">AVG LOAD</div></div>
      <div class="trend-stat-tile"><div class="tst-val">${streak}</div><div class="tst-key">DAY STREAK</div></div>
    </div>
    <div class="trends-chart-section">
      <div class="trends-chart-title">VOLUME PER SESSION <span>(last ${sessions.length})</span></div>
      <div class="trends-bar-chart">${sessions.map(s=>{
        const h=Math.max(4,Math.round((s.volumeKg||0)/maxVol*80)), d=new Date(s.date).toLocaleDateString("en-US",{month:"short",day:"numeric"});
        const color=s.protocolId==="bodybuilder"?"#00ffa3":s.protocolId==="powerlifter"?"#ff4e6a":"#7c6ff7";
        return `<div class="tbc-col"><div class="tbc-bar" style="height:${h}px;background:${color}"></div><div class="tbc-label">${d}</div></div>`;
      }).join("")}</div>
      <div class="trends-legend"><span><i style="background:#00ffa3"></i>HYPERTROPHY</span><span><i style="background:#ff4e6a"></i>CNS INTENSITY</span><span><i style="background:#7c6ff7"></i>NEUROMUSCULAR</span></div>
    </div>
    <div class="trends-protocol-breakdown">
      <div class="trends-chart-title">PROTOCOL BREAKDOWN</div>
      ${Object.entries(byProtocol).map(([name,data])=>{
        const pct=Math.round((data.count/totalSess)*100), color=name.includes("HYPER")?"#00ffa3":name.includes("CNS")?"#ff4e6a":"#7c6ff7";
        return `<div class="tpb-row"><div class="tpb-name">${name}</div><div class="tpb-bar-bg"><div class="tpb-bar-fill" style="width:${pct}%;background:${color}"></div></div><div class="tpb-meta"><span>${data.count} sessions</span><span>${data.totalVol.toFixed(0)}kg vol</span><span>${pct}%</span></div></div>`;
      }).join("")}
    </div>`;
}

function calcStreak(history){
  if(!history.length) return 0;
  const today=new Date(); today.setHours(0,0,0,0);
  const dates=[...new Set(history.map(s=>{const d=new Date(s.date);d.setHours(0,0,0,0);return d.getTime();}))].sort((a,b)=>b-a);
  let streak=0;
  for(let i=0;i<dates.length;i++){const e=new Date(today);e.setDate(today.getDate()-i);if(dates[i]===e.getTime())streak++;else break;}
  return streak;
}

function exportHistoryCSV(){
  const history=getHistory();
  if(!history.length){
    log("NO HISTORY TO EXPORT","warn"); return;
  }

  const rows=[["Date","Protocol","Sets","TotalSets","VolumeKg","LoadKg","DurationS"]];
  history.forEach(s=>rows.push([
    new Date(s.date).toLocaleDateString(),
    s.protocolLabel||s.protocolId,
    s.setsLogged, s.totalSets,
    s.volumeKg||0, s.loadKg||0, s.durationS||0
  ]));
  const csvText = rows.map(r=>r.join(",")).join("\n");

  // Try native file download first (works on desktop)
  try {
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csvText],{type:"text/csv"}));
    a.download=`bmos-history-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch(_){}

  // Always show the premium in-app export modal (works on all devices)
  showExportModal(csvText, history);
  log("SESSION DATA EXPORTED","hi");
}

function showExportModal(csvText, history){
  document.getElementById("export-modal-backdrop")?.remove();

  const totalVol = history.reduce((a,s)=>a+(s.volumeKg||0),0);
  const backdrop = document.createElement("div");
  backdrop.id = "export-modal-backdrop";
  backdrop.className = "export-modal-backdrop";

  backdrop.innerHTML = `
    <div class="export-modal" role="dialog" aria-modal="true" aria-label="Export Data">
      <div class="exm-header">
        <div class="exm-icon-wrap">
          <div class="exm-icon">◈</div>
        </div>
        <div class="exm-title-block">
          <div class="exm-title">EXPORT DATA</div>
          <div class="exm-subtitle">${history.length} SESSIONS · ${totalVol.toFixed(0)}KG TOTAL VOLUME</div>
        </div>
        <button class="exm-close" id="exm-close" aria-label="Close">✕</button>
      </div>

      <div class="exm-stats-row">
        <div class="exm-stat"><div class="exm-stat-val">${history.length}</div><div class="exm-stat-key">SESSIONS</div></div>
        <div class="exm-stat"><div class="exm-stat-val">${totalVol.toFixed(0)}<span>kg</span></div><div class="exm-stat-key">VOLUME</div></div>
        <div class="exm-stat"><div class="exm-stat-val">${history[history.length-1]?new Date(history[history.length-1].date).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—"}</div><div class="exm-stat-key">LAST SESSION</div></div>
        <div class="exm-stat"><div class="exm-stat-val">${calcStreak(history)}</div><div class="exm-stat-key">DAY STREAK</div></div>
      </div>

      <div class="exm-body">
        <div class="exm-label">CSV DATA — SELECT ALL &amp; COPY</div>
        <textarea class="exm-textarea" id="exm-textarea" readonly spellcheck="false">${csvText}</textarea>
      </div>

      <div class="exm-footer">
        <button class="exm-copy-btn" id="exm-copy-btn">
          <span class="exm-copy-icon">⎘</span>
          <span id="exm-copy-label">COPY TO CLIPBOARD</span>
        </button>
        <button class="exm-close-btn" id="exm-close-btn">DONE</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  requestAnimationFrame(()=>backdrop.classList.add("active"));

  // Auto-select textarea
  const ta = document.getElementById("exm-textarea");
  setTimeout(()=>{ ta.focus(); ta.select(); }, 300);

  function closeModal(){
    backdrop.classList.remove("active");
    setTimeout(()=>backdrop.remove(), 300);
  }

  document.getElementById("exm-close").addEventListener("click", closeModal);
  document.getElementById("exm-close-btn").addEventListener("click", closeModal);
  backdrop.addEventListener("click", e=>{ if(e.target===backdrop) closeModal(); });

  // Copy to clipboard
  document.getElementById("exm-copy-btn").addEventListener("click", ()=>{
    const labelEl = document.getElementById("exm-copy-label");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(csvText).then(()=>{
        labelEl.textContent = "✓ COPIED!";
        setTimeout(()=>labelEl.textContent="COPY TO CLIPBOARD", 2000);
      }).catch(()=>{ ta.select(); document.execCommand("copy"); labelEl.textContent="✓ COPIED!"; setTimeout(()=>labelEl.textContent="COPY TO CLIPBOARD",2000); });
    } else {
      ta.select(); document.execCommand("copy");
      labelEl.textContent = "✓ COPIED!";
      setTimeout(()=>labelEl.textContent="COPY TO CLIPBOARD", 2000);
    }
  });

  function onKey(e){ if(e.key==="Escape") closeModal(); }
  document.addEventListener("keydown", onKey);
  backdrop.addEventListener("animationend", ()=>document.removeEventListener("keydown",onKey), {once:true});
}

function checkAndSaveHistory(){
  if(!state.protocol) return;
  if(state.doneSets.size>=state.protocol.workoutBlocks.length){recordSessionToHistory();log("SESSION SAVED TO HISTORY","hi");}
}

// ══════════════════════════════════════════════════════════════
// ── THEME TOGGLE ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

const THEME_KEY="bmos_theme";
function initTheme(){applyTheme(localStorage.getItem(THEME_KEY)||"dark");}
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme",theme); localStorage.setItem(THEME_KEY,theme);
  const btn=document.getElementById("theme-toggle-btn");
  if(btn){btn.textContent=theme==="light"?"◑ DARK":"○ LIGHT";btn.title=theme==="light"?"Switch to dark mode":"Switch to light mode";}
}
function toggleTheme(){const c=document.documentElement.getAttribute("data-theme")||"dark";applyTheme(c==="dark"?"light":"dark");log(`THEME → ${c==="dark"?"LIGHT":"DARK"} MODE`,"hi");}