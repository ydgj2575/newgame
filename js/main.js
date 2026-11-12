/**
 * 拯救派大星 —— 页面主循环：输入、HUD、特效、音效、界面流程
 */
import { Game, VIEW } from './engine.js';
import * as art from './art.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = new Game();

const startScreen = document.getElementById('start-screen');
const overScreen = document.getElementById('over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const finalScore = document.getElementById('final-score');
const finalStats = document.getElementById('final-stats');

/* ---------------- 画布尺寸 ---------------- */

let dpr = 1;
function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(VIEW.width * dpr);
  canvas.height = Math.round(VIEW.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

/* ---------------- 云朵 ---------------- */

const clouds = Array.from({ length: 7 }, (_, i) => ({
  x: (i * 173 + 40) % (VIEW.width + 200),
  y: 46 + ((i * 53) % 190),
  scale: 0.7 + ((i * 37) % 70) / 100,
  speed: 6 + ((i * 29) % 12),
  alpha: 0.55 + ((i * 17) % 35) / 100,
}));

/* ---------------- 特效 ---------------- */

const fx = { floats: [], particles: [], flash: 0, flashColor: 'rgba(255,80,100,0.28)', shake: 0 };

function addFloat(x, y, text, color) {
  fx.floats.push({ x, y, text, color, life: 1.1, max: 1.1, vy: -64 });
}

function addParticles(x, y, color, n = 10, spread = 130, size = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = spread * (0.3 + Math.random() * 0.7);
    fx.particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 40,
      life: 0.5 + Math.random() * 0.4,
      max: 0.9,
      size: size * (0.6 + Math.random()),
      color,
      gravity: 320,
    });
  }
}

function drawEffects(dt) {
  for (const f of fx.floats) {
    f.life -= dt;
    f.y += f.vy * dt;
    const k = Math.max(0, f.life / f.max);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.font = 'bold 26px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
  fx.floats = fx.floats.filter((f) => f.life > 0);

  for (const p of fx.particles) {
    p.life -= dt;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const k = Math.max(0, p.life / p.max);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * k, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  fx.particles = fx.particles.filter((p) => p.life > 0);
}

/* ---------------- 音效（WebAudio 合成，无外部资源） ---------------- */

let actx = null;
function ensureAudio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch { /* 静默失败 */ }
}

function tone(freq, dur, type = 'sine', gain = 0.07, slideTo = null, delay = 0) {
  if (!actx) return;
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(actx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseBurst(dur = 0.25, gain = 0.12) {
  if (!actx) return;
  const len = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = actx.createBufferSource();
  src.buffer = buf;
  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  const g = actx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(actx.destination);
  src.start();
}

const sfx = {
  catch(kind) {
    if (kind === 'patrick') { tone(660, 0.09, 'triangle', 0.07, 990); }
    else if (kind === 'star') { tone(520, 0.07, 'sine', 0.05, 460); }
    else { tone(420, 0.07, 'square', 0.04, 520); }
  },
  deposit(gained) {
    if (gained >= 0) {
      tone(660, 0.1, 'triangle', 0.07);
      tone(880, 0.12, 'triangle', 0.07, null, 0.08);
      tone(1180, 0.16, 'triangle', 0.06, null, 0.16);
    } else {
      tone(300, 0.12, 'sawtooth', 0.06, 180);
      tone(200, 0.2, 'sawtooth', 0.05, 120, 0.1);
    }
  },
  miss() {
    noiseBurst(0.3, 0.13);
    tone(150, 0.25, 'sine', 0.1, 70);
  },
  plop() { tone(500, 0.08, 'sine', 0.03, 260); },
  gameover() {
    [520, 430, 350, 260, 180].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, f * 0.8, i * 0.13));
  },
  ui() { tone(720, 0.06, 'sine', 0.05, 900); },
};

/* ---------------- 事件处理 ---------------- */

let hintUntil = 0;
let time = 0;

function handleEvents(events) {
  for (const e of events) {
    switch (e.type) {
      case 'catch': {
        addParticles(e.x, e.y, e.kind === 'patrick' ? '#ffd7ea' : e.kind === 'star' ? '#fff3a8' : '#cfd8e6', 8, 110, 3.5);
        sfx.catch(e.kind);
        break;
      }
      case 'deposit': {
        const z = game.cfg.returnZone;
        const total = e.gained;
        addFloat(z.x + 20, z.y - 58, `${total >= 0 ? '+' : ''}${total} 分`, total >= 0 ? '#ff8a1e' : '#d33b58');
        if (e.counts.patrick) addFloat(z.x + 70, z.y - 96, `派大星 ×${e.counts.patrick}  +${e.counts.patrick * 5}`, '#e0455f');
        if (e.counts.trash) addFloat(z.x - 8, z.y - 96, `垃圾袋 ×${e.counts.trash}  +${e.counts.trash}`, '#2c6d8f');
        if (e.counts.star) addFloat(z.x + 34, z.y - 132, `星星 ×${e.counts.star}  -${e.counts.star * 7}`, '#7a4bd3');
        addParticles(z.x, z.y - 20, '#ffe066', 18, 220, 5);
        fx.shake = Math.max(fx.shake, 6);
        sfx.deposit(total);
        break;
      }
      case 'patrickMiss': {
        addParticles(e.x, VIEW.height - 26, '#ff9db1', 16, 170, 5);
        addFloat(e.x, VIEW.height - 90, '-1 生命', '#e0455f');
        fx.flash = 0.9;
        fx.shake = Math.max(fx.shake, 14);
        sfx.miss();
        break;
      }
      case 'miss': {
        addParticles(e.x, VIEW.height - 20, '#ffffff', 7, 90, 3);
        sfx.plop();
        break;
      }
      case 'gameover': {
        fx.flash = 1.1;
        fx.shake = 18;
        sfx.gameover();
        showGameOver(e);
        break;
      }
      default: break;
    }
  }
}

/* ---------------- 界面流程 ---------------- */

function showGameOver(e) {
  finalScore.textContent = String(e.score);
  const s = e.stats;
  finalStats.innerHTML = `
    <div><b>${s.patrick}</b><span>救回派大星</span></div>
    <div><b>${s.trash}</b><span>收回垃圾袋</span></div>
    <div><b>${s.missedPatrick}</b><span>漏接派大星</span></div>`;
  overScreen.classList.remove('hidden');
}

function startGame() {
  ensureAudio();
  sfx.ui();
  startScreen.classList.add('hidden');
  overScreen.classList.add('hidden');
  fx.floats = [];
  fx.particles = [];
  fx.flash = 0;
  fx.shake = 0;
  game.start();
  hintUntil = time + 6;
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
homeBtn.addEventListener('click', () => {
  overScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  game.reset();
  game.drainEvents();
});

/* ---------------- 输入 ---------------- */

let dragging = false;

function pointerToWorld(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * VIEW.width,
    y: ((e.clientY - rect.top) / rect.height) * VIEW.height,
  };
}

canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  if (game.phase === 'playing') {
    const p = pointerToWorld(e);
    game.setTarget(p.x, p.y);
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (game.phase !== 'playing') return;
  if (!dragging && e.pointerType !== 'mouse') return;
  const p = pointerToWorld(e);
  game.setTarget(p.x, p.y);
});

const endDrag = () => { dragging = false; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('pointerleave', endDrag);

const KEY_STEP = 30;
window.addEventListener('keydown', (e) => {
  if (game.phase !== 'playing') return;
  const p = game.parachute;
  let handled = true;
  switch (e.key) {
    case 'ArrowLeft': case 'a': case 'A': game.setTarget(p.tx - KEY_STEP, p.ty); break;
    case 'ArrowRight': case 'd': case 'D': game.setTarget(p.tx + KEY_STEP, p.ty); break;
    case 'ArrowUp': case 'w': case 'W': game.setTarget(p.tx, p.ty - KEY_STEP); break;
    case 'ArrowDown': case 's': case 'S': game.setTarget(p.tx, p.ty + KEY_STEP); break;
    default: handled = false;
  }
  if (handled) e.preventDefault();
});

/* ---------------- 主循环 ---------------- */

function drawTargetMarker() {
  if (game.phase !== 'playing') return;
  const p = game.parachute;
  if (Math.hypot(p.tx - p.x, p.ty - p.y) < 18) return;
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + 30);
  ctx.lineTo(p.tx, p.ty + 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(p.tx, p.ty + 30, 16 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function draw(dt) {
  ctx.save();
  if (fx.shake > 0.4) {
    ctx.translate((Math.random() * 2 - 1) * fx.shake, (Math.random() * 2 - 1) * fx.shake);
    fx.shake *= Math.pow(0.002, dt);
  } else {
    fx.shake = 0;
  }

  art.drawBackground(ctx, time, clouds);
  art.drawRescueZone(ctx, time, game.zoneGlow);

  for (const item of game.items) art.drawItem(ctx, item);
  drawTargetMarker();
  art.drawParachute(ctx, game.parachute, time);

  drawEffects(dt);

  if (game.phase !== 'ready') art.drawHUD(ctx, game);
  if (game.phase === 'playing' && time < hintUntil) {
    art.drawHint(ctx, '点击 / 拖动屏幕，移动降落伞');
  }

  if (fx.flash > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, fx.flash * 0.6);
    ctx.fillStyle = fx.flashColor;
    ctx.fillRect(-40, -40, VIEW.width + 80, VIEW.height + 80);
    ctx.restore();
    fx.flash *= Math.pow(0.01, dt);
  }

  ctx.restore();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  time += dt;
  if (game.phase === 'playing') game.update(dt);
  handleEvents(game.drainEvents());
  draw(dt);
  requestAnimationFrame(frame);
}

// 标题画面先让背景动起来
requestAnimationFrame(frame);

// 方便调试 / 自动化测试
window.__savePatrick = { game, fx };
