<template>
  <div class="nebula-bg" aria-hidden="true">
    <!-- Deep space nebula clouds (CSS) -->
    <div class="neb-cloud neb-cloud-1" />
    <div class="neb-cloud neb-cloud-2" />
    <div class="neb-cloud neb-cloud-3" />
    <div class="neb-cloud neb-cloud-4" />
    <div class="neb-cloud neb-cloud-5" />
    <!-- Aurora streaks -->
    <div class="aurora aurora-1" />
    <div class="aurora aurora-2" />
    <!-- Canvas: stars + shooting stars + meteors -->
    <canvas ref="canvas" class="absolute inset-0 w-full h-full" />
  </div>
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  let animId: number
  let W = 0, H = 0
  let frame = 0

  // ── Types ──────────────────────────────────────────────────────────
  interface Star {
    x: number; y: number; r: number
    baseAlpha: number; alpha: number
    twinkleSpeed: number; twinklePhase: number
    color: string; isGiant: boolean
  }

  interface Spark {
    x: number; y: number
    vx: number; vy: number
    life: number; maxLife: number
    color: string; r: number
  }

  interface Meteor {
    x: number; y: number
    vx: number; vy: number
    len: number; width: number
    alpha: number; fade: number
    r: number; g: number; b: number
    trail: Array<{ x: number; y: number; a: number }>
    sparks: Spark[]
    dead: boolean
  }

  interface NebulaCloud {
    x: number; y: number
    vx: number; vy: number
    r: number; alpha: number
    color: string; life: number; maxLife: number
  }

  // ── State ─────────────────────────────────────────────────────────
  let stars: Star[] = []
  let meteors: Meteor[] = []
  let clouds: NebulaCloud[] = []

  const STAR_COLORS = [
    'rgba(255,255,255,',
    'rgba(200,215,255,',
    'rgba(180,205,255,',
    'rgba(220,190,255,',
    'rgba(255,240,210,',
    'rgba(150,210,255,',
  ]

  const METEOR_PALETTE: Array<[number, number, number]> = [
    [168, 85, 247],
    [6, 182, 212],
    [236, 72, 153],
    [255, 255, 255],
    [99, 102, 241],
    [34, 211, 238],
  ]

  const CLOUD_COLORS = [
    'rgba(109,40,217,',
    'rgba(6,182,212,',
    'rgba(37,99,235,',
    'rgba(168,85,247,',
    'rgba(236,72,153,',
    'rgba(79,70,229,',
  ]

  // ── Resize ────────────────────────────────────────────────────────
  const DPR = Math.min(window.devicePixelRatio || 1, 3)

  function resize() {
    W = window.innerWidth
    H = window.innerHeight
    // Scale buffer to physical pixels so it looks crisp on Retina/HiDPI
    el.width  = Math.round(W * DPR)
    el.height = Math.round(H * DPR)
    el.style.width  = W + 'px'
    el.style.height = H + 'px'
    // Reset transform then apply DPR scale (avoids accumulation on repeated resize)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    buildStarField()
  }

  // ── Star Field ────────────────────────────────────────────────────
  function buildStarField() {
    stars = []
    const count = Math.floor((W * H) / 1400) // denser field
    for (let i = 0; i < count; i++) {
      const rng = Math.random()
      // size tiers: tiny · small · medium · large · giant
      const size = rng < 0.55 ? Math.random() * 0.7 + 0.2
        : rng < 0.80 ? Math.random() * 0.7 + 0.9
        : rng < 0.95 ? Math.random() * 0.9 + 1.5
        : Math.random() * 1.2 + 2.4
      const isGiant = size > 2.4
      const baseAlpha = isGiant
        ? Math.random() * 0.4 + 0.6
        : Math.random() * 0.65 + 0.2
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: size,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: Math.random() * 0.03 + 0.006,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        isGiant,
      })
    }
  }

  function drawStars() {
    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed
      s.alpha = s.baseAlpha * (0.4 + 0.6 * Math.sin(s.twinklePhase))

      // Star dot
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `${s.color}${s.alpha})`
      ctx.fill()

      // Giant stars: cross flare + halo
      if (s.isGiant) {
        const a = s.alpha * 0.6
        // soft halo
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 8)
        halo.addColorStop(0, `${s.color}${a * 0.5})`)
        halo.addColorStop(0.4, `${s.color}${a * 0.15})`)
        halo.addColorStop(1, `${s.color}0)`)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 8, 0, Math.PI * 2)
        ctx.fillStyle = halo
        ctx.fill()
        // cross spike
        ctx.save()
        ctx.globalAlpha = a * 0.7
        ctx.strokeStyle = `${s.color}1)`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(s.x - s.r * 6, s.y)
        ctx.lineTo(s.x + s.r * 6, s.y)
        ctx.moveTo(s.x, s.y - s.r * 6)
        ctx.lineTo(s.x, s.y + s.r * 6)
        ctx.stroke()
        ctx.restore()
      } else if (s.r > 1.2) {
        // medium star: small halo
        const h = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
        h.addColorStop(0, `${s.color}${s.alpha * 0.3})`)
        h.addColorStop(1, `${s.color}0)`)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = h
        ctx.fill()
      }
    }
  }

  // ── Meteors (shooting stars) ───────────────────────────────────────
  function spawnMeteor(fast = false) {
    const angleDeg = fast
      ? Math.random() * 20 + 5
      : Math.random() * 35 + 8
    const angle = angleDeg * (Math.PI / 180)
    const speed = fast
      ? Math.random() * 30 + 20
      : Math.random() * 14 + 7
    const col = METEOR_PALETTE[Math.floor(Math.random() * METEOR_PALETTE.length)]

    meteors.push({
      x: Math.random() * W * 1.5 - W * 0.25,
      y: Math.random() * H * 0.45 - 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: fast ? Math.random() * 120 + 80 : Math.random() * 220 + 120,
      width: fast ? Math.random() * 1.5 + 0.6 : Math.random() * 3 + 1.8,
      alpha: 1,
      fade: fast ? Math.random() * 0.012 + 0.007 : Math.random() * 0.006 + 0.003,
      r: col[0], g: col[1], b: col[2],
      trail: [],
      sparks: [],
      dead: false,
    })
  }

  function updateMeteors() {
    for (const m of meteors) {
      if (m.dead) continue

      m.trail.push({ x: m.x, y: m.y, a: m.alpha })
      if (m.trail.length > 55) m.trail.shift()

      m.x += m.vx
      m.y += m.vy
      m.alpha -= m.fade

      // Sparks
      if (Math.random() < 0.5) {
        m.sparks.push({
          x: m.x + (Math.random() - 0.5) * 6,
          y: m.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 4 + m.vx * 0.12,
          vy: (Math.random() - 0.5) * 4 + m.vy * 0.12,
          life: 0,
          maxLife: Math.random() * 35 + 18,
          r: Math.random() * 1.5 + 0.4,
          color: `rgba(${m.r},${m.g},${m.b},`,
        })
      }

      // Draw glowing trail
      for (let i = 0; i < m.trail.length; i++) {
        const t = m.trail[i]
        const p = i / m.trail.length
        const a = t.a * p * 0.7
        const sz = m.width * p * 4.5

        const rg = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, Math.max(0.1, sz))
        rg.addColorStop(0, `rgba(${m.r},${m.g},${m.b},${a})`)
        rg.addColorStop(1, `rgba(${m.r},${m.g},${m.b},0)`)
        ctx.beginPath()
        ctx.arc(t.x, t.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = rg
        ctx.fill()
      }

      // Main streak line
      if (m.trail.length > 1) {
        const tail = m.trail[0]
        const streak = ctx.createLinearGradient(tail.x, tail.y, m.x, m.y)
        streak.addColorStop(0, `rgba(${m.r},${m.g},${m.b},0)`)
        streak.addColorStop(0.5, `rgba(${m.r},${m.g},${m.b},${m.alpha * 0.55})`)
        streak.addColorStop(1, `rgba(${m.r},${m.g},${m.b},${m.alpha})`)
        ctx.beginPath()
        ctx.moveTo(tail.x, tail.y)
        ctx.lineTo(m.x, m.y)
        ctx.strokeStyle = streak
        ctx.lineWidth = m.width
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Glowing head
      const hr = m.width * 6
      const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, hr)
      head.addColorStop(0, `rgba(255,255,255,${m.alpha})`)
      head.addColorStop(0.2, `rgba(${m.r},${m.g},${m.b},${m.alpha * 0.95})`)
      head.addColorStop(0.55, `rgba(${m.r},${m.g},${m.b},${m.alpha * 0.4})`)
      head.addColorStop(1, `rgba(${m.r},${m.g},${m.b},0)`)
      ctx.beginPath()
      ctx.arc(m.x, m.y, hr, 0, Math.PI * 2)
      ctx.fillStyle = head
      ctx.fill()

      // Wide outer corona
      const cr = hr * 3.5
      const corona = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, cr)
      corona.addColorStop(0, `rgba(${m.r},${m.g},${m.b},${m.alpha * 0.25})`)
      corona.addColorStop(1, `rgba(${m.r},${m.g},${m.b},0)`)
      ctx.beginPath()
      ctx.arc(m.x, m.y, cr, 0, Math.PI * 2)
      ctx.fillStyle = corona
      ctx.fill()

      // Update sparks
      for (let i = m.sparks.length - 1; i >= 0; i--) {
        const sp = m.sparks[i]
        sp.life++
        if (sp.life >= sp.maxLife) { m.sparks.splice(i, 1); continue }
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vy += 0.06
        sp.vx *= 0.97
        const progress = 1 - sp.life / sp.maxLife
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, sp.r * progress, 0, Math.PI * 2)
        ctx.fillStyle = `${sp.color}${progress * 0.9})`
        ctx.fill()
      }

      if (m.alpha <= 0 || m.x > W + 500 || m.y > H + 300) m.dead = true
    }
    meteors = meteors.filter(m => !m.dead || m.sparks.length > 0)
  }

  // ── Nebula Clouds ─────────────────────────────────────────────────
  function spawnCloud() {
    const maxLife = Math.random() * 200 + 100
    clouds.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 120 + 50,
      alpha: 0,
      color: CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)],
      life: 0,
      maxLife,
    })
  }

  function updateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
      const p = clouds[i]
      p.life++
      p.x += p.vx
      p.y += p.vy

      const progress = p.life / p.maxLife
      const peak = 0.09 // max alpha — more visible
      p.alpha = progress < 0.25
        ? (progress / 0.25) * peak
        : progress < 0.7
          ? peak
          : ((1 - progress) / 0.3) * peak

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
      g.addColorStop(0, `${p.color}${p.alpha})`)
      g.addColorStop(0.5, `${p.color}${p.alpha * 0.5})`)
      g.addColorStop(1, `${p.color}0)`)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()

      if (p.life >= p.maxLife) clouds.splice(i, 1)
    }
  }

  // ── Main Loop ──────────────────────────────────────────────────────
  function tick() {
    ctx.fillStyle = '#030610'
    ctx.fillRect(0, 0, W, H)
    frame++

    updateClouds()
    drawStars()
    updateMeteors()

    // ── Shooting stars (fast, thin) — every ~35 frames
    if (frame % 35 === 0 && Math.random() < 0.85) spawnMeteor(true)

    // ── Triple burst shooting stars ~every 3.5s
    if (frame % 210 === 0 && Math.random() < 0.7) {
      spawnMeteor(true)
      setTimeout(() => spawnMeteor(true), 90)
      setTimeout(() => spawnMeteor(true), 200)
      setTimeout(() => spawnMeteor(true), 340)
    }

    // ── Big dramatic meteors — every ~100 frames
    if (frame % 100 === 0 && Math.random() < 0.65) spawnMeteor(false)

    // ── Meteor shower burst ~every 8s
    if (frame % 480 === 0 && Math.random() < 0.6) {
      const n = Math.floor(Math.random() * 5) + 3
      for (let i = 0; i < n; i++) setTimeout(() => spawnMeteor(i % 2 === 0), i * 180)
    }

    // ── Nebula clouds
    if (clouds.length < 18 && Math.random() < 0.07) spawnCloud()

    animId = requestAnimationFrame(tick)
  }

  resize()
  // Pre-fill clouds so background isn't bare on load
  for (let i = 0; i < 10; i++) {
    spawnCloud()
    // stagger life so they don't all fade at same time
    if (clouds[i]) clouds[i].life = Math.floor(Math.random() * clouds[i].maxLife * 0.6)
  }

  tick()
  window.addEventListener('resize', resize)
  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<style scoped>
.nebula-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #030610;
  background-image:
    linear-gradient(rgba(109, 40, 217, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(109, 40, 217, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ── Nebula clouds (CSS orbs) ─────────────────────────── */
.neb-cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

.neb-cloud-1 {
  width: 800px; height: 800px;
  background: radial-gradient(circle, rgba(109,40,217,0.32), transparent 70%);
  top: -280px; right: -220px;
  animation: float-orb 30s ease-in-out infinite;
}

.neb-cloud-2 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(37,99,235,0.26), transparent 70%);
  bottom: -180px; left: -180px;
  animation: float-orb 38s ease-in-out infinite reverse;
  animation-delay: -14s;
}

.neb-cloud-3 {
  width: 580px; height: 580px;
  background: radial-gradient(circle, rgba(6,182,212,0.22), transparent 70%);
  top: 40%; left: 38%;
  animation: float-orb 24s ease-in-out infinite;
  animation-delay: -8s;
}

.neb-cloud-4 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%);
  bottom: 15%; right: 8%;
  animation: float-orb 20s ease-in-out infinite reverse;
  animation-delay: -4s;
}

.neb-cloud-5 {
  width: 450px; height: 450px;
  background: radial-gradient(circle, rgba(168,85,247,0.20), transparent 70%);
  top: 25%; left: -100px;
  animation: float-orb 26s ease-in-out infinite;
  animation-delay: -19s;
}

@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  20%       { transform: translate(45px, -50px) scale(1.1); }
  40%       { transform: translate(-35px, 30px) scale(0.92); }
  60%       { transform: translate(28px, 48px) scale(1.06); }
  80%       { transform: translate(-22px, -25px) scale(0.96); }
}

/* ── Aurora streaks ───────────────────────────────────── */
.aurora {
  position: absolute;
  pointer-events: none;
  filter: blur(60px);
  opacity: 0;
  animation: aurora-pulse 12s ease-in-out infinite;
}

.aurora-1 {
  top: 8%;
  left: -10%;
  width: 80%;
  height: 200px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(6,182,212,0.12) 20%,
    rgba(109,40,217,0.18) 50%,
    rgba(168,85,247,0.12) 80%,
    transparent 100%
  );
  animation-delay: 0s;
}

.aurora-2 {
  top: 30%;
  right: -10%;
  width: 70%;
  height: 150px;
  background: linear-gradient(270deg,
    transparent 0%,
    rgba(236,72,153,0.10) 20%,
    rgba(37,99,235,0.15) 55%,
    rgba(6,182,212,0.10) 80%,
    transparent 100%
  );
  animation-delay: -6s;
}

@keyframes aurora-pulse {
  0%, 100% { opacity: 0; transform: scaleY(1) translateX(0); }
  25%       { opacity: 1; transform: scaleY(1.3) translateX(2%); }
  50%       { opacity: 0.6; transform: scaleY(0.85) translateX(-1%); }
  75%       { opacity: 1; transform: scaleY(1.15) translateX(1%); }
}
</style>
