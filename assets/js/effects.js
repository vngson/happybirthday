"use strict";

// Hiệu ứng từ thiết kế: nền sao → ánh sáng theo chuột → pháo hoa.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = document.querySelector('#stars'),
    ctx = c.getContext('2d');
  // Vẽ quầng sáng một lần, tái sử dụng cho mọi sao ở mọi khung hình.
  const glow = document.createElement('canvas');
  glow.width = glow.height = 32;
  const glowContext = glow.getContext('2d');
  const gradient = glowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,220,160,.38)');
  gradient.addColorStop(1, 'rgba(255,220,160,0)');
  glowContext.fillStyle = gradient;
  glowContext.fillRect(0, 0, 32, 32);
  let w,
    h,
    stars = [],
    mx = 0,
    my = 0,
    tx = 0,
    ty = 0,
    lastStar = 0,
    starTime = 0,
    starRAF = 0;
  const rand = (a, b) => a + Math.random() * (b - a),
    wrap = (v, n) => (v % n + n) % n;
  function resize() {
    const d = SITE_CONFIG.effects.backgroundPixelRatio;
    w = innerWidth;
    h = innerHeight;
    c.width = w * d;
    c.height = h * d;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    ctx.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({
      length: Math.min(SITE_CONFIG.effects.maxStars, Math.max(SITE_CONFIG.effects.minStars, Math.floor(w * h / SITE_CONFIG.effects.pixelsPerStar)))
    }, () => {
      let z = rand(.18, 1);
      return {
        x: rand(0, w),
        y: rand(0, h),
        z,
        r: rand(.45, 1.45) * (.55 + z),
        p: rand(0, 6.28),
        f: rand(.8, 2.5),
        vx: rand(4, 13) * z,
        vy: -rand(9, 32) * z,
        spark: Math.random() < .12
      };
    });
  }
  function draw(t) {
    // Nền chạy 30 fps; pháo hoa và tương tác vẫn theo nhịp màn hình.
    if (!reduced && lastStar && t - lastStar < 1000 / SITE_CONFIG.effects.starFps - 1) {
      starRAF = requestAnimationFrame(draw);
      return;
    }
    let dt = lastStar ? Math.min(.05, (t - lastStar) / 1000) : 0;
    lastStar = t;
    if (reduced) dt = 0;
    starTime += dt;
    mx += (tx - mx) * Math.min(1, dt * 4);
    my += (ty - my) * Math.min(1, dt * 4);
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.x = wrap(s.x + (s.vx + Math.sin(starTime * .65 + s.p) * 7 * s.z) * dt, w + 24);
      s.y = wrap(s.y + s.vy * dt, h + 24);
      let x = wrap(s.x + mx * s.z, w + 24) - 12,
        y = wrap(s.y + my * s.z, h + 24) - 12;
      let pulse = .5 + .5 * Math.sin(starTime * s.f + s.p),
        a = .24 + .7 * pulse;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.z > .65 ? '#ffe5b5' : '#e9c59c';
      if (s.z > .65) {
        ctx.drawImage(glow, x - s.r * 5, y - s.r * 5, s.r * 10, s.r * 10);
        ctx.fillStyle = '#ffe5b5';
      }
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.spark && pulse > .65) {
        let l = s.r * (2 + 3 * pulse);
        ctx.globalAlpha = a * (pulse - .65) / .35;
        ctx.strokeStyle = '#ffe9c6';
        ctx.lineWidth = .65;
        ctx.beginPath();
        ctx.moveTo(x - l, y);
        ctx.lineTo(x + l, y);
        ctx.moveTo(x, y - l);
        ctx.lineTo(x, y + l);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced && !document.hidden) starRAF = requestAnimationFrame(draw);
  }
  resize();
  if (reduced) draw(0);else starRAF = requestAnimationFrame(draw);
  addEventListener('resize', () => {
    resize();
    if (reduced) draw(0);
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(starRAF);
    lastStar = 0;
    if (!reduced && !document.hidden) starRAF = requestAnimationFrame(draw);
  });
  if (!reduced) {
    addEventListener('pointermove', e => {
      tx = (e.clientX / w - .5) * 65;
      ty = (e.clientY / h - .5) * 65;
    });
    document.addEventListener('pointerleave', () => {
      tx = ty = 0;
    });
  }
  document.querySelectorAll('.unit').forEach(el => el.addEventListener('pointermove', e => {
    let r = el.getBoundingClientRect();
    el.style.setProperty('--x', e.clientX - r.left + 'px');
    el.style.setProperty('--y', e.clientY - r.top + 'px');
  }));
})();
// Lớp ánh sáng, sao băng, chuyển động theo chuột và nút gửi lời ước.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches,
    canvas = document.querySelector('#cinema'),
    g = canvas.getContext('2d');
  let W,
    H,
    particles = [],
    last = 0,
    next = 0,
    raf = 0;
  const colors = SITE_CONFIG.effects.trailColors;
  function resize() {
    const d = SITE_CONFIG.effects.backgroundPixelRatio;
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * d;
    canvas.height = H * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  resize();
  addEventListener('resize', resize);
  function emit(x, y, n, power = 5) {
    if (reduce) return;
    for (let i = 0; i < n && particles.length < SITE_CONFIG.effects.maxTrailParticles; i++) {
      let a = Math.random() * Math.PI * 2,
        v = (.2 + Math.random()) * power;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1,
        decay: .008 + Math.random() * .015,
        r: .6 + Math.random() * 2,
        c: colors[i % colors.length]
      });
    }
  }
  function frame(t) {
    let dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    g.clearRect(0, 0, W, H);
    if (t > next) {
      next = t + 3500 + Math.random() * 4500;
      particles.push({
        x: Math.random() * W * .8,
        y: Math.random() * H * .35,
        vx: 8,
        vy: 4,
        life: 1,
        decay: .025,
        r: 1.3,
        c: '#ffe5a9',
        meteor: true
      });
    }
    g.globalCompositeOperation = 'lighter';
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (!p.meteor) {
        p.vx *= .985;
        p.vy = p.vy * .985 + .025 * dt;
      }
      g.globalAlpha = Math.max(0, p.life);
      g.strokeStyle = p.c;
      g.lineWidth = p.r;
      g.beginPath();
      g.moveTo(p.x, p.y);
      g.lineTo(p.x - p.vx * (p.meteor ? 12 : 2), p.y - p.vy * (p.meteor ? 12 : 2));
      g.stroke();
      g.fillStyle = p.c;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }
  if (!reduce) {
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    let prev = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' && performance.now() - prev > 45) {
        prev = performance.now();
        emit(e.clientX, e.clientY, 1, .8);
      }
    });
    document.querySelectorAll('.unit,.cta').forEach(el => {
      el.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        let r = el.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width - .5,
          y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--rx', -y * 15 + 'deg');
        el.style.setProperty('--ry', x * 15 + 'deg');
        el.style.setProperty('--bx', x * 12 + 'px');
        el.style.setProperty('--by', y * 9 + 'px');
      });
      el.addEventListener('pointerleave', () => ['--rx', '--ry', '--bx', '--by'].forEach(k => el.style.removeProperty(k)));
    });
  }
  document.querySelector('.wish').addEventListener('click', e => {
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = SITE_CONFIG.text.wishSent;
    document.querySelector('.wish-note').textContent = SITE_CONFIG.text.wishMessage;
    burst();
  });
})();
// Pháo hoa: phóng rocket, tạo hạt rồi dừng khi rời màn sinh nhật.
(() => {
  const scene = document.getElementById('birthday');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:8';
  document.body.append(c);
  const g = c.getContext('2d');
  let w,
    h,
    particles = [],
    rockets = [],
    raf = 0,
    last = 0,
    next = 0,
    opening = 0,
    active = false;
  const palette = SITE_CONFIG.effects.fireworkColors;
  function resize() {
    w = innerWidth;
    h = innerHeight;
    const d = Math.min(devicePixelRatio || 1, SITE_CONFIG.effects.maxFireworkPixelRatio);
    c.width = w * d;
    c.height = h * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  resize();
  addEventListener('resize', resize);
  function burst(x, y) {
    const color = palette[Math.floor(Math.random() * palette.length)],
      n = w < 600 ? SITE_CONFIG.effects.mobileParticlesPerBurst : SITE_CONFIG.effects.particlesPerBurst;
    for (let i = 0; i < n && particles.length < SITE_CONFIG.effects.maxFireworkParticles; i++) {
      const a = Math.PI * 2 * i / n + Math.random() * .12,
        v = (1.4 + Math.random() * 4.5) * (w < 600 ? .75 : 1);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1,
        decay: .006 + Math.random() * .009,
        color: i % 5 === 0 ? '#fff4dc' : color,
        r: .7 + Math.random() * 1.3
      });
    }
  }
  function launch() {
    const x = w * (.12 + Math.random() * .76),
      y = h * (.13 + Math.random() * .48);
    rockets.push({
      x: x + (Math.random() - .5) * w * .18,
      y: h,
      tx: x,
      ty: y,
      progress: 0
    });
  }
  function frame(t) {
    if (!active) return;
    const dt = Math.min(2, (t - last) / 16.67 || 1);
    last = t;
    g.clearRect(0, 0, w, h);
    if (t >= next) {
      launch();
      next = t + (opening > 0 ? SITE_CONFIG.effects.openingIntervalMs : SITE_CONFIG.effects.rocketIntervalMs + Math.random() * SITE_CONFIG.effects.rocketIntervalJitterMs);
      opening = Math.max(0, opening - 1);
    }
    g.globalCompositeOperation = 'lighter';
    for (const r of rockets) {
      const ox = r.x,
        oy = r.y;
      r.progress += dt * .023;
      r.x += (r.tx - r.x) * .06 * dt;
      r.y += (r.ty - r.y) * .075 * dt;
      g.globalAlpha = .9;
      g.strokeStyle = '#ffdca0';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(ox, oy + 12);
      g.lineTo(r.x, r.y);
      g.stroke();
      if (r.progress >= 1) burst(r.tx, r.ty);
    }
    rockets = rockets.filter(r => r.progress < 1);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(.985, dt);
      p.vy = p.vy * Math.pow(.985, dt) + .045 * dt;
      p.life -= p.decay * dt;
      g.globalAlpha = Math.max(0, p.life);
      g.strokeStyle = p.color;
      g.lineWidth = p.r;
      g.beginPath();
      g.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
      g.lineTo(p.x, p.y);
      g.stroke();
      g.fillStyle = p.color;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }
    particles = particles.filter(p => p.life > 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    const on = !scene.hidden && !document.hidden && !reduced.matches;
    if (on === active) return;
    active = on;
    if (on) {
      last = performance.now();
      next = last;
      opening = SITE_CONFIG.effects.openingRockets;
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      particles = [];
      rockets = [];
      g.clearRect(0, 0, w, h);
    }
  }
  new MutationObserver(sync).observe(scene, {
    attributes: true,
    attributeFilter: ['hidden', 'class', 'style']
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  let lastBurst = -Infinity;
  function celebrate(x = w * .5, y = h * .35) {
    sync();
    const now = performance.now();
    if (!active || now - lastBurst < 250) return;
    lastBurst = now;
    burst(x, y);
  }
  document.addEventListener('birthday:celebrate', () => celebrate());
  document.addEventListener('click', e => {
    if (active && e.detail > 0 && !e.target.closest('button')) celebrate(e.clientX, e.clientY);
  });
  sync();
})();
