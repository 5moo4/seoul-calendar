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
    const size = (9 + (index % 3) * 2) * amount * pulse;
    const colors = ['#f6ff87', '#ffd45e', '#ff8dbd', '#b7f46d'];
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
    const pulse = .5 + .5 * Math.sin(t * 1.45 + burst.delay);
    const radius = (35 + pulse * 24) * amount;
    const alpha = (.3 + pulse * .45) * amount;
    ctx.save(); ctx.translate(burst.x * 520, burst.y * 540); ctx.globalAlpha = alpha;
    for (let spark = 0; spark < 14; spark += 1) {
      const angle = (Math.PI * 2 * spark) / 14 + burstIndex * .35;
      const length = radius * (0.85 + ((spark * 7) % 5) / 10);
      ctx.strokeStyle = burst.color; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * .18, Math.sin(angle) * radius * .18);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(angle) * length, Math.sin(angle) * length, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

function drawFinaleOverlay(t, bloom) {
  const amount = easeOut(bloom);
  if (amount <= 0) return;
  const centerX = w * .71;
  const flowerY = h * .36;
  const flowerSpots = [-.17, -.1, -.03, .05, .12, .19];
  flowerSpots.forEach((offset, index) => {
    const x = centerX + offset * w;
    const y = flowerY + Math.sin(index * 1.7) * 13;
    const size = (10 + (index % 2) * 3) * amount;
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = amount;
    for (let petal = 0; petal < 5; petal += 1) {
      ctx.rotate(Math.PI * 2 / 5); ctx.beginPath();
      ctx.ellipse(0, -size * .72, size * .42, size, 0, 0, Math.PI * 2);
      ctx.fillStyle = ['#ff8dbd', '#ffd45e', '#f6ff87'][index % 3]; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, size * .3, 0, Math.PI * 2); ctx.fillStyle = '#fff8c7'; ctx.fill();
    ctx.restore();
  });
  const bursts = [{ x: .53, y: .2, color: '#f6ff87' }, { x: .86, y: .23, color: '#ff8dbd' }, { x: .7, y: .12, color: '#a8d7ff' }];
  bursts.forEach((burst, index) => {
    const pulse = .5 + .5 * Math.sin(t * 1.45 + index * 1.2);
    const radius = (32 + pulse * 20) * amount;
    ctx.save(); ctx.translate(w * burst.x, h * burst.y); ctx.globalAlpha = (.35 + pulse * .45) * amount;
    for (let ray = 0; ray < 12; ray += 1) {
      const angle = Math.PI * 2 * ray / 12;
      const length = radius * (.8 + (ray % 4) * .1);
      ctx.strokeStyle = burst.color; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * .15, Math.sin(angle) * radius * .15);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length); ctx.stroke();
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
  drawFinaleOverlay(t, bloom);
  if (!reduced) requestAnimationFrame(draw);
}

new ResizeObserver(resize).observe(canvas); resize(); if (!reduced) requestAnimationFrame(draw);
