// ── Config ──────────────────────────────────────────────────────
const DIFFICULTIES = {
  easy:   { circleLife: 2800, interval: 1800, maxLives: 5, winScore: 20, minR: 35, maxR: 65, label: 'ŁATWY' },
  medium: { circleLife: 2000, interval: 1500, maxLives: 3, winScore: 20, minR: 28, maxR: 50, label: 'ŚREDNI' },
  hard:   { circleLife: 1200, interval: 1200, maxLives: 3, winScore: 20, minR: 22, maxR: 40, label: 'TRUDNY' },
  insane: { circleLife: 750,  interval: 900,  maxLives: 2, winScore: 20, minR: 16, maxR: 30, label: 'INSANE' },
};

const CIRCLE_COLORS = [
  ['#c8f55a','#8db83d'],
  ['#5af5c8','#3db890'],
  ['#f5a55a','#b87a3d'],
  ['#a55af5','#7a3db8'],
  ['#f55a9e','#b83d73'],
];

// ── State ───────────────────────────────────────────────────────
let score = 0, lives = 3, totalClicks = 0, hits = 0;
let diff = 'easy', cfg = DIFFICULTIES.easy;
let spawnInterval = null, activeCircle = null, circleTimeout = null;
let isRunning = false;

// ── DOM ─────────────────────────────────────────────────────────
const startScreen  = document.getElementById('start-screen');
const endScreen    = document.getElementById('end-screen');
const hud          = document.getElementById('hud');
const gameArea     = document.getElementById('game-area');
const hudScore     = document.getElementById('hud-score-val');
const hudLives     = document.getElementById('hud-lives-val');
const hudBest      = document.getElementById('hud-best-val');
const timerBarWrap = document.getElementById('timer-bar-wrap');
const timerBar     = document.getElementById('timer-bar');
const startBest    = document.getElementById('start-best');

// ── localStorage ────────────────────────────────────────────────
function getBest(d) { return parseInt(localStorage.getItem('circleSnap_best_' + d) || '0'); }
function saveBest(d, s) { localStorage.setItem('circleSnap_best_' + d, s); }

function refreshStartBest() {
  const b = getBest(diff);
  startBest.innerHTML = b > 0
    ? `Twój rekord (${DIFFICULTIES[diff].label}): <strong>${b} pkt</strong>`
    : '';
  hudBest.textContent = b;
}

// ── Difficulty buttons ───────────────────────────────────────────
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    diff = btn.dataset.diff;
    cfg  = DIFFICULTIES[diff];
    refreshStartBest();
  });
});

// ── Start / Restart ─────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

function startGame() {
  cfg         = DIFFICULTIES[diff];
  score       = 0;
  lives       = cfg.maxLives;
  totalClicks = 0;
  hits        = 0;
  isRunning   = true;

  startScreen.classList.add('hidden');
  hud.classList.add('visible');
  timerBarWrap.style.display = 'block';

  updateHUD();
  spawnCircle();
  spawnInterval = setInterval(spawnCircle, cfg.interval);
}

// ── Spawn ────────────────────────────────────────────────────────
function spawnCircle() {
  if (!isRunning) return;
  if (activeCircle) expireCircle(false);

  const areaW = gameArea.clientWidth;
  const areaH = gameArea.clientHeight;
  const r     = rand(cfg.minR, cfg.maxR);
  const x     = rand(r, areaW - r);
  const y     = rand(r, areaH - r);
  const col   = CIRCLE_COLORS[Math.floor(Math.random() * CIRCLE_COLORS.length)];

  const circle = document.createElement('div');
  circle.className = 'circle';
  Object.assign(circle.style, {
    width:      r * 2 + 'px',
    height:     r * 2 + 'px',
    left:       (x - r) + 'px',
    top:        (y - r) + 'px',
    background: `radial-gradient(circle at 35% 35%, ${col[0]}, ${col[1]})`,
    boxShadow:  `0 0 20px ${col[0]}55`,
  });

  circle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isRunning) return;
    handleHit(circle, x, y);
  });

  gameArea.appendChild(circle);
  activeCircle = circle;

  // Timer bar animation
  timerBar.style.transition = 'none';
  timerBar.style.width      = '100%';
  timerBar.style.background = col[0];
  requestAnimationFrame(() => {
    timerBar.style.transition = `width ${cfg.circleLife}ms linear, background 0.3s`;
    timerBar.style.width      = '0%';
    timerBar.style.background = '#f5725a';
  });

  circleTimeout = setTimeout(() => {
    if (activeCircle === circle) expireCircle(true);
  }, cfg.circleLife);
}

function expireCircle(loseLife) {
  if (!activeCircle) return;
  clearTimeout(circleTimeout);
  if (loseLife) {
    activeCircle.classList.add('miss');
    loseOneLife();
  }
  const c = activeCircle;
  activeCircle = null;
  setTimeout(() => c.remove(), 300);
}

// ── Hit ──────────────────────────────────────────────────────────
function handleHit(circle, cx, cy) {
  clearTimeout(circleTimeout);
  activeCircle = null;
  hits++;
  totalClicks++;
  score++;
  circle.classList.add('hit');
  setTimeout(() => circle.remove(), 350);
  spawnFeedback(cx, cy, '+1', 'var(--accent)');
  updateHUD();
  if (score >= cfg.winScore) { setTimeout(endGame, 400, true); return; }
}

// ── Miss click on background ─────────────────────────────────────
gameArea.addEventListener('click', (e) => {
  if (!isRunning) return;
  if (e.target === gameArea) {
    totalClicks++;
    spawnFeedback(e.offsetX, e.offsetY, '✕', 'var(--danger)');
    spawnRipple(e.offsetX, e.offsetY);
    loseOneLife();
  }
});

function loseOneLife() {
  lives = Math.max(0, lives - 1);
  updateHUD();
  if (lives <= 0) setTimeout(endGame, 400, false);
}

// ── HUD update ────────────────────────────────────────────────────
function updateHUD() {
  hudScore.textContent = score;
  hudBest.textContent  = Math.max(getBest(diff), score);
  const full = '♥', empty = '♡';
  let h = '';
  for (let i = 0; i < cfg.maxLives; i++) h += i < lives ? full : empty;
  hudLives.textContent = h;
  hudLives.style.color = lives <= 1 ? '#f5725a' : 'var(--danger)';
}

// ── End game ──────────────────────────────────────────────────────
function endGame(won) {
  isRunning = false;
  clearInterval(spawnInterval);
  clearTimeout(circleTimeout);
  if (activeCircle) { activeCircle.remove(); activeCircle = null; }
  gameArea.querySelectorAll('.circle').forEach(c => c.remove());

  timerBarWrap.style.display = 'none';
  hud.classList.remove('visible');

  const prevBest = getBest(diff);
  const isNew    = score > prevBest;
  if (isNew) saveBest(diff, score);
  const best = Math.max(prevBest, score);

  const acc = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

  document.getElementById('result-title').textContent = won ? 'Wygrałeś!' : 'Przegrałeś!';
  document.getElementById('result-sub').textContent   = won ? 'Doskonała celność.' : 'Spróbuj jeszcze raz.';
  document.getElementById('end-score').textContent    = score;
  document.getElementById('end-best').textContent     = best;
  document.getElementById('end-hits').textContent     = hits;
  document.getElementById('end-acc').textContent      = acc + '%';

  const nr = document.getElementById('new-record');
  nr.classList.toggle('hidden', !isNew);

  endScreen.classList.remove('hidden');
  endScreen.className = 'screen ' + (won ? 'win' : 'lose');
}

// ── Helpers ───────────────────────────────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function spawnFeedback(x, y, text, color) {
  const el = document.createElement('div');
  el.className    = 'feedback';
  el.textContent  = text;
  el.style.left   = x + 'px';
  el.style.top    = y + 'px';
  el.style.color  = color;
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function spawnRipple(x, y) {
  const el = document.createElement('div');
  el.className  = 'ripple';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

// ── Responsive: recalc on resize ─────────────────────────────────
window.addEventListener('resize', () => {
  if (activeCircle) {
    const areaW = gameArea.clientWidth;
    const areaH = gameArea.clientHeight;
    const c     = activeCircle;
    const r     = parseInt(c.style.width) / 2;
    const cx    = Math.min(Math.max(r, parseInt(c.style.left) + r), areaW - r);
    const cy    = Math.min(Math.max(r, parseInt(c.style.top)  + r), areaH - r);
    c.style.left = (cx - r) + 'px';
    c.style.top  = (cy - r) + 'px';
  }
});

// ── Init ──────────────────────────────────────────────────────────
refreshStartBest();