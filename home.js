const canvas = document.querySelector('#growth');
const ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let w = 0, h = 0, px = 0, py = 0, start = performance.now();
let targetX = 0, targetY = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  w = rect.width; h = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw(reduced ? start + 10000 : performance.now());
}

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  targetX = (event.clientX - rect.left - w / 2) / w;
  targetY = (event.clientY - rect.top - h / 2) / h;
});
canvas.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });

function easeOut(value) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3); }

function drawFlowers(tips, bloom, t) {
  const amount = easeOut(bloom);
  tips.forEach((tip, index) => {
    const pulse = 1 + Math.sin(t * 2.4 + index) * .06;
    const size = (6 + (index % 3) * 1.4) * amount * pulse;
    const colors = ['#f3ffb2', '#ffd66b', '#f4a7c5', '#c9f58a'];
    ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(tip.angle + py * .2); ctx.globalAlpha = amount;
    for (let petal = 0; petal < 5; petal += 1) {
      ctx.rotate(Math.PI * 2 / 5); ctx.beginPath();
      ctx.ellipse(0, -size * .72, size * .42, size, 0, 0, Math.PI * 2);
      ctx.fillStyle = colors[index % colors.length]; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, size * .32, 0, Math.PI * 2); ctx.fillStyle = '#fff4a3'; ctx.fill();
    ctx.restore();
  });
}

function drawFireworks(t, bloom) {
  const amount = easeOut(bloom); if (amount <= 0) return;
  const bursts = [
    { x: -.28, y: -.72, color: '#f3ff93', delay: 0 },
    { x: .25, y: -.63, color: '#ffb0cf', delay: 1.2 },
    { x: .04, y: -.84, color: '#a8d7ff', delay: 2.4 },
  ];
  bursts.forEach((burst, burstIndex) => {
    const phase = ((t - 3.25 - burst.delay) % 4.2 + 4.2) % 4.2;
    if (phase > 2.25) return;
    const progress = Math.min(1, phase / 1.35);
    const radius = 45 * easeOut(progress) * amount;
    const alpha = Math.min(1, (1 - Math.max(0, phase - 1.05) / 1.2)) * amount;
    ctx.save(); ctx.translate(burst.x * 520, burst.y * 540); ctx.globalAlpha = alpha;
    for (let spark = 0; spark < 14; spark += 1) {
      const angle = (Math.PI * 2 * spark) / 14 + burstIndex * .35;
      const length = radius * (0.8 + ((spark * 7) % 5) / 10);
      ctx.strokeStyle = burst.color; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * .18, Math.sin(angle) * radius * .18);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(angle) * length, Math.sin(angle) * length, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

function draw(now) {
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h); px += (targetX - px) * .045; py += (targetY - py) * .045;
  const t = reduced ? 10 : (now - start) / 1000;
  const grow = Math.min(t / 3, 1); const bloom = Math.min(Math.max((t - 2.7) / 1.3, 0), 1);
  const scale = Math.min(w / 520, h / 540); const tips = [];
  ctx.save(); ctx.translate(w * .5, h * .88); ctx.scale(scale, scale);
  const glow = ctx.createRadialGradient(0, -220, 20, 0, -220, 260);
  glow.addColorStop(0, '#b4ef5a20'); glow.addColorStop(1, '#b4ef5a00'); ctx.fillStyle = glow; ctx.fillRect(-280, -520, 560, 560);
  ctx.strokeStyle = '#63764b'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(0, 6, 150, 24, 0, 0, Math.PI * 2); ctx.stroke();

  function branch(x, y, len, angle, depth, seed) {
    if (depth === 0) return;
    const progress = Math.max(0, Math.min(1, grow * 7 - (6 - depth)));
    const nextAngle = angle + Math.sin(t * .65 + seed) * .025 + px * .24;
    const nx = x + Math.cos(nextAngle) * len * progress; const ny = y + Math.sin(nextAngle) * len * progress;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(nextAngle - .15) * len * .5, y + Math.sin(nextAngle - .15) * len * .5, nx, ny);
    ctx.strokeStyle = depth > 3 ? '#8ca66b' : '#c3f56b'; ctx.lineWidth = depth * .55; ctx.stroke();
    if (progress < 1) return;
    if (depth <= 3) {
      tips.push({ x: nx, y: ny, angle: nextAngle }); ctx.save(); ctx.translate(nx, ny); ctx.rotate(nextAngle + py * .3);
      ctx.beginPath(); ctx.ellipse(0, -5, 16 - depth * 2, 4.5, 0, 0, Math.PI * 2); ctx.fillStyle = depth === 1 ? '#d6ff8c' : '#8bc34b'; ctx.fill(); ctx.restore();
    }
    branch(nx, ny, len * .75, nextAngle - .46, depth - 1, seed + 1.7);
    branch(nx, ny, len * .72, nextAngle + .5, depth - 1, seed + 3.2);
  }
  branch(0, 0, 105, -Math.PI / 2, 6, 1); drawFlowers(tips, bloom, t); drawFireworks(t, bloom); ctx.restore();
  if (!reduced) requestAnimationFrame(draw);
}

new ResizeObserver(resize).observe(canvas); resize(); if (!reduced) requestAnimationFrame(draw);
