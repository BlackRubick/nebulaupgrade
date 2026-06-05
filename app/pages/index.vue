<template>
  <div class="text-white">

    <!-- ══════════════════════════════════════════
         NAVBAR
    ══════════════════════════════════════════ -->
    <nav class="fixed top-0 inset-x-0 z-50 glass border-b border-purple-900/20">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center glow-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="white" stroke-width="1.5" fill="none" opacity="0.4"/>
            </svg>
          </div>
          <span class="nebula-logo-text">NEBULA</span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#eventos" class="hover:text-white transition">Eventos</a>
          <a href="#experience" class="hover:text-white transition">Experience</a>
          <a href="#galeria" class="hover:text-white transition">Galería</a>
          <a href="#djs" class="hover:text-white transition">DJs</a>
          <a href="#reserva" class="hover:text-white transition">Reserva</a>
        </div>

        <a href="#reserva" class="btn-nebula btn-primary text-sm px-5 py-2">
          Reservar Ahora
        </a>
      </div>
    </nav>

    <!-- ══════════════════════════════════════════
         HERO
    ══════════════════════════════════════════ -->
    <section class="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <!-- Animated rings -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div class="hero-ring w-[900px] h-[900px]" style="animation-duration:60s;" />
        <div class="hero-ring absolute w-[650px] h-[650px]" style="animation-duration:40s;animation-direction:reverse;opacity:0.06;" />
        <div class="hero-ring absolute w-[400px] h-[400px]" style="animation-duration:25s;opacity:0.08;" />
      </div>

      <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-pink-500/30 mb-10">
          <div class="w-2 h-2 rounded-full bg-pink-400 pulse-dot" style="background:#F472B6;box-shadow:0 0 0 0 rgba(244,114,182,0.7);" />
          <span class="text-xs text-pink-300 font-mono tracking-widest uppercase">Los Eventos Más Perros Del Universo</span>
        </div>

        <h1 class="font-display font-black tracking-tighter mb-6 leading-none">
          <span class="block text-7xl md:text-9xl text-white text-glow-white">LAS</span>
          <span class="block text-7xl md:text-9xl gradient-text neon-gradient-text">NOCHES</span>
          <span class="block text-7xl md:text-9xl text-white text-glow-white">MÁS ÉPICAS</span>
        </h1>

        <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed font-light">
          Mejores DJs de Chiapas · Gogos · Gogas · Shows · Shots gratis · Concursos por botella
        </p>
        <p class="text-slate-500 font-mono tracking-wider mb-12 text-sm">
          Suchiapa, Chiapas
        </p>

        <div class="flex flex-col sm:flex-row gap-5 justify-center">
          <a href="#eventos" class="btn-nebula btn-primary text-base px-10 py-4 text-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Ver Próximos Eventos
          </a>
          <a href="#experience" class="btn-nebula btn-ghost text-base px-10 py-4 text-lg">
            El Experience →
          </a>
        </div>

        <!-- Stats rápidos -->
        <div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div v-for="s in heroStats" :key="s.label" class="text-center">
            <div class="font-display text-4xl font-black gradient-text">{{ s.value }}</div>
            <div class="text-xs text-slate-500 mt-1 uppercase tracking-widest">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span class="text-xs text-slate-600 font-mono tracking-widest">SCROLL</span>
        <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         PRÓXIMOS EVENTOS
    ══════════════════════════════════════════ -->
    <section id="eventos" class="py-28 relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs text-violet-400 font-mono tracking-widest uppercase mb-3">— Agenda —</p>
          <h2 class="font-display text-5xl font-black text-white mb-4">Próximos <span class="gradient-text neon-gradient-text">Eventos</span></h2>
          <p class="text-slate-400 max-w-lg mx-auto">No te quedes fuera. Las noches Nebula se agotan rápido.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div v-for="ev in events" :key="ev.name" class="event-card group relative overflow-hidden rounded-2xl border border-purple-900/30 hover:border-violet-500/60 transition-all duration-500">
            <!-- Fake event image placeholder with gradient art -->
            <div class="event-img relative h-56 overflow-hidden" :style="`background: ${ev.bg}`">
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div class="absolute top-4 left-4 flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" :style="`background:${ev.badgeBg};color:${ev.badgeColor};`">{{ ev.tag }}</span>
              </div>
              <div class="absolute top-4 right-4 w-8 h-8 text-white/70" v-html="ev.emoji" />
              <!-- Decorative art inside the image -->
              <div class="absolute inset-0 flex items-center justify-center opacity-20">
                <span class="font-display text-6xl font-black text-white">{{ ev.letter }}</span>
              </div>
            </div>

            <div class="p-6" style="background:rgba(6,9,20,0.65);backdrop-filter:blur(14px);">
              <div class="flex items-center gap-2 text-xs text-slate-500 font-mono mb-3">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ ev.date }}
                <span class="text-slate-700">·</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ ev.venue }}
              </div>
              <h3 class="font-display text-2xl font-black text-white mb-2">{{ ev.name }}</h3>
              <p class="text-slate-400 text-sm mb-4">{{ ev.desc }}</p>

              <div class="flex flex-wrap gap-2 mb-5">
                <span v-for="feat in ev.features" :key="feat" class="px-2 py-1 rounded-md text-xs font-mono" style="background:rgba(109,40,217,0.15);color:#A78BFA;border:1px solid rgba(109,40,217,0.2);">
                  {{ feat }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-slate-600 uppercase tracking-wider">Desde</div>
                  <div class="font-display text-2xl font-bold text-white">{{ ev.price }}</div>
                </div>
                <a href="#reserva" class="btn-nebula btn-primary text-sm px-5 py-2">
                  Reservar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         EL EXPERIENCE NEBULA
    ══════════════════════════════════════════ -->
    <section id="experience" class="py-28 relative">
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-3">— Lo que te espera —</p>
          <h2 class="font-display text-5xl font-black text-white mb-4">El <span class="gradient-text neon-gradient-text">Experience</span> Nebula</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Cada noche Nebula es un universo aparte. Esto es lo que vives cuando entras.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div
            v-for="exp in experiences"
            :key="exp.title"
            class="experience-card card-nebula p-6 group hover:scale-105 transition-all duration-300"
            :style="`--card-color: ${exp.color}`"
          >
            <div class="mb-4 w-12 h-12 rounded-xl flex items-center justify-center" :style="`background:${exp.color}22; color:${exp.color};`" v-html="exp.icon" />
            <h3 class="font-display font-bold text-white text-lg mb-2">{{ exp.title }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ exp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         GALERÍA DE EVENTOS
    ══════════════════════════════════════════ -->
    <section id="galeria" class="py-28 relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs text-pink-400 font-mono tracking-widest uppercase mb-3">— Revive la noche —</p>
          <h2 class="font-display text-5xl font-black text-white mb-4">Galería <span class="gradient-text neon-gradient-text">Nebula</span></h2>
          <p class="text-slate-400 max-w-lg mx-auto">Puras noches de otro planeta. Próximamente aquí tus fotos y videos.</p>
        </div>

        <!-- Gallery grid with CSS art placeholders -->
        <div class="gallery-grid">
          <div v-for="(cell, i) in gallery" :key="i"
            class="gallery-cell group relative overflow-hidden rounded-xl cursor-pointer border border-purple-900/20 hover:border-violet-500/50 transition-all duration-500"
            :class="cell.span"
          >
            <div class="absolute inset-0" :style="`background: ${cell.bg}`" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div class="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <span class="font-display text-9xl font-black text-white">{{ cell.letter }}</span>
            </div>
            <!-- Animated neon dots -->
            <div class="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" :style="`background:${cell.dot}`" />
            <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
              <span class="text-xs font-mono text-white/70 uppercase tracking-wider">{{ cell.label }}</span>
            </div>
            <!-- Video play icon on some cells -->
            <div v-if="cell.video" class="absolute inset-0 flex items-center justify-center">
              <div class="w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <p class="text-slate-600 text-sm font-mono">📸 Fotos y videos de cada evento disponibles tras la noche</p>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         NUESTROS DJs
    ══════════════════════════════════════════ -->
    <section id="djs" class="py-28 relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs text-violet-400 font-mono tracking-widest uppercase mb-3">— Lineup —</p>
          <h2 class="font-display text-5xl font-black text-white mb-4">Nuestros <span class="gradient-text neon-gradient-text">DJs</span></h2>
          <p class="text-slate-400 max-w-lg mx-auto">Los mejores selectores de la escena. Cada fecha, una experiencia única.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <div v-for="dj in djs" :key="dj.name" class="dj-card group text-center card-nebula p-5 hover:border-violet-500/50 transition-all duration-300">
            <div class="dj-avatar mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden"
              :style="`background: ${dj.bg}`">
              <div class="absolute inset-0 rounded-full" :style="`box-shadow: inset 0 0 20px ${dj.glow};`" />
              <span class="relative z-10 w-8 h-8 text-white flex items-center justify-center" v-html="dj.emoji" />
            </div>
            <div class="font-display font-black text-white text-sm uppercase tracking-wider">{{ dj.name }}</div>
            <div class="text-xs text-slate-500 mt-1">{{ dj.genre }}</div>
            <div class="mt-3 flex flex-wrap justify-center gap-1">
              <span v-for="tag in dj.tags" :key="tag"
                class="px-2 py-0.5 rounded text-xs font-mono"
                style="background:rgba(109,40,217,0.12);color:#7C3AED;">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         VIDEO / HYPE SECTION
    ══════════════════════════════════════════ -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      </div>

      <div class="max-w-5xl mx-auto px-6">
        <div class="hype-box card-nebula relative overflow-hidden rounded-3xl p-12 text-center"
          style="border-color: rgba(168,85,247,0.25);">
          <div class="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/15" />
          <!-- Neon lines decoration -->
          <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />
          <div class="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent" />

          <div class="relative z-10">
            <div class="w-14 h-14 mx-auto mb-6 text-violet-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
              </svg>
            </div>
            <h2 class="font-display text-4xl md:text-5xl font-black text-white mb-4">
              El Video <span class="gradient-text neon-gradient-text">Te Va a Convencer</span>
            </h2>
            <p class="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Mira lo que pasa cuando Nebula prende la pista. Luces, humo, gente bailando, y esa energía que no existe en otro lugar.
            </p>
            <div class="inline-flex items-center gap-3 px-8 py-4 rounded-full glass border border-violet-500/40 cursor-pointer hover:border-violet-400/70 transition-all duration-300 group"
              style="box-shadow: 0 0 30px rgba(109,40,217,0.2);">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span class="font-display font-bold text-white">Reproducir Aftermovie</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         TESTIMONIOS
    ══════════════════════════════════════════ -->
    <section class="py-24 relative">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <p class="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-3">— La gente habla —</p>
          <h2 class="font-display text-4xl font-black text-white mb-2">Lo que dicen <span class="gradient-text">los que fueron</span></h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="t in testimonios" :key="t.name" class="card-nebula p-6">
            <div class="flex items-center gap-1 mb-4">
              <span v-for="n in 5" :key="n" class="text-yellow-400 text-sm">★</span>
            </div>
            <p class="text-slate-300 italic text-sm leading-relaxed mb-5">"{{ t.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white"
                :style="`background: linear-gradient(135deg, ${t.color1}, ${t.color2})`">
                {{ t.name[0] }}
              </div>
              <div>
                <div class="font-semibold text-white text-sm">{{ t.name }}</div>
                <div class="text-xs text-slate-600">{{ t.location }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         RESERVA TU LUGAR
    ══════════════════════════════════════════ -->
    <section id="reserva" class="py-28 relative">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="card-nebula p-14 relative overflow-hidden" style="border-color:rgba(168,85,247,0.3);">
          <div class="absolute inset-0 bg-gradient-to-br from-violet-900/25 to-pink-900/10" />
          <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
          <div class="relative z-10">
            <div class="w-14 h-14 mx-auto mb-4 text-violet-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </div>
            <h2 class="font-display text-4xl md:text-5xl font-black text-white mb-4">
              ¿Listo Para <span class="gradient-text neon-gradient-text">Despegar</span>?
            </h2>
            <p class="text-slate-400 mb-4 leading-relaxed">
              Los lugares son limitados. La lista de espera no.
              Asegura tu spot antes de que se agote.
            </p>
            <p class="text-slate-500 text-sm mb-8 font-mono">Escríbenos por WhatsApp · DM en Instagram · O llega directo</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/5213312345678" class="btn-nebula text-base px-8 py-3"
                style="background:linear-gradient(135deg,#25D366,#128C7E);border:1px solid rgba(37,211,102,0.4);color:white;">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.847L.057 23.882l6.18-1.621A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.887 0-3.66-.494-5.195-1.358l-.373-.222-3.667.962.979-3.576-.243-.389A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </a>
              <a href="https://instagram.com/nebulaeventos" class="btn-nebula text-base px-8 py-3"
                style="background:linear-gradient(135deg,#E1306C,#833AB4,#FD1D1D);border:1px solid rgba(225,48,108,0.4);color:white;">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════ -->
    <footer class="border-t py-12" style="border-color:rgba(109,40,217,0.15);">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div />

          <div class="flex items-center gap-6 text-xs text-slate-600 font-mono">
            <span>Suchiapa, Chiapas</span>
          </div>

          <div class="flex items-center gap-4">
            <p class="text-xs text-slate-700">© {{ new Date().getFullYear() }} NEBULA EVENTOS</p>
            <NuxtLink to="/nebula-access-portal" class="text-xs text-slate-800 hover:text-slate-600 transition font-mono">
              · BlackRubick
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'NEBULA EVENTOS — Las Noches Más Épicas del Universo',
  description: 'Los mejores eventos, DJs, gogos, shows y noches épicas en Guadalajara, Monterrey y CDMX. Reserva tu lugar ahora.',
})

const ic = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;">${paths}</svg>`

const heroStats = [
  { value: '+200', label: 'Eventos' },
  { value: '+50K', label: 'Asistentes' },
  { value: '5★', label: 'Rating' },
  { value: 'Chis.', label: 'Chiapas' },
]

const events = [
  {
    name: 'NEBULA NOIR',
    date: 'Vie 20 Jun 2025',
    venue: 'Suchiapa, Chis.',
    tag: 'Próximo',
    badgeBg: 'rgba(6,182,212,0.2)',
    badgeColor: '#67E8F9',
    desc: 'La noche más oscura y electrizante de la temporada. Open bar premium, show de gogos y DJ internacional invitado.',
    features: ['Open Bar', 'Show Gogos', 'DJ Int\'l', 'Confeti'],
    price: '$350',
    bg: 'linear-gradient(135deg, #0B0B2A 0%, #1a0533 50%, #050816 100%)',
    emoji: ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
    letter: 'N',
  },
  {
    name: 'STELLAR BASH',
    date: 'Sáb 5 Jul 2025',
    venue: 'Suchiapa, Chis.',
    tag: 'Agotándose',
    badgeBg: 'rgba(239,68,68,0.2)',
    badgeColor: '#FCA5A5',
    desc: 'Dos pisos, dos ambientes. Reggaeton abajo, electrónica arriba. Show de enanos, gogos y concurso por botella VIP.',
    features: ['2 Pisos', 'Show Enanos', 'Shots', 'Concurso Botella'],
    price: '$280',
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #1e1b4b 100%)',
    emoji: ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    letter: 'S',
  },
  {
    name: 'COSMIC RAVE',
    date: 'Vie 18 Jul 2025',
    venue: 'Suchiapa, Chis.',
    tag: 'Nuevo',
    badgeBg: 'rgba(168,85,247,0.2)',
    badgeColor: '#C084FC',
    desc: 'La experiencia más inmersiva. Mapping 3D, pantallas LED de 360°, 3 DJs en una sola noche. Shots de bienvenida incluidos.',
    features: ['Mapping 3D', '3 DJs', 'Shots Gratis', 'VIP Lounge'],
    price: '$450',
    bg: 'linear-gradient(135deg, #042f2e 0%, #0e7490 40%, #1e3a5f 100%)',
    emoji: ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'),
    letter: 'C',
  },
]

const experiences = [
  { icon: ic('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'), title: 'Los Mejores DJs de Tuxtla', desc: 'Los selectores más perros de Tuxtla Gutiérrez que mueven la pista desde el primer track.', color: '#7C3AED' },
  { icon: ic('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'), title: 'Gogos y Gogas', desc: 'Los mejores bailarines y bailarinas en tarima. Energía, coreografías y fuego sobre la pista.', color: '#EC4899' },
  { icon: ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'), title: 'Show de Enanos', desc: 'El número más viral de la noche. Garantía de carcajadas y fotos para el recuerdo.', color: '#06B6D4' },
  { icon: ic('<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M17 2H7l2 8h6z"/>'), title: 'Shots de Bienvenida', desc: 'Arranca la noche con un shot en la entrada. Sin filas, sin pretextos.', color: '#F59E0B' },
  { icon: ic('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>'), title: 'Concurso por Botella', desc: 'El que más baila, gana. Botella de licor premium para el ganador del concurso en pista.', color: '#10B981' },
  { icon: ic('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/>'), title: 'Confeti & Efectos', desc: 'Cañones de confeti, máquinas de humo, luces stroboscópicas. Show visual brutal.', color: '#6366F1' },
  { icon: ic('<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>'), title: 'VIP Lounge', desc: 'Área exclusiva con servicio de mesa, mesero personal y acceso priority.', color: '#8B5CF6' },
  { icon: ic('<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'), title: 'Cortesías & Sorpresas', desc: 'Premios, cortesías y sorpresas que no anunciamos para que sean aún más perras.', color: '#EF4444' },
  { icon: ic('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'), title: 'Sonido Profesional', desc: 'Sistema de sonido d&b audiotechnik. Lo escuchas en el pecho, no solo en los oídos.', color: '#A855F7' },
  { icon: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'), title: 'Seguridad Total', desc: 'Staff profesional, protocolos de seguridad y ambiente controlado. Tu noche, sin drama.', color: '#14B8A6' },
]

const gallery = [
  { bg: 'linear-gradient(135deg,#1a0533,#6D28D9,#2563EB)', letter: 'A', dot: '#A855F7', label: 'NEBULA NOIR · Marzo 2025', span: 'col-span-2 row-span-2', video: false },
  { bg: 'linear-gradient(135deg,#042f2e,#0e7490)', letter: 'B', dot: '#06B6D4', label: 'STELLAR BASH · Feb 2025', span: '', video: true },
  { bg: 'linear-gradient(135deg,#1e1b4b,#4F46E5)', letter: 'C', dot: '#818CF8', label: 'COSMIC RAVE · Ene 2025', span: '', video: false },
  { bg: 'linear-gradient(135deg,#4a044e,#be185d)', letter: 'D', dot: '#F472B6', label: 'NEBULA PINK · Dic 2024', span: '', video: false },
  { bg: 'linear-gradient(135deg,#1c1917,#78350f,#451a03)', letter: 'E', dot: '#F59E0B', label: 'FIRE NIGHT · Nov 2024', span: '', video: true },
  { bg: 'linear-gradient(135deg,#022c22,#065f46)', letter: 'F', dot: '#34D399', label: 'GREEN LABEL · Oct 2024', span: 'col-span-2', video: false },
]

const djs = [
  { name: 'DJ XENON', genre: 'Tech House', emoji: ic('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'), bg: 'linear-gradient(135deg,#6D28D9,#2563EB)', glow: 'rgba(109,40,217,0.5)', tags: ['Tech', 'House'] },
  { name: 'LUNA', genre: 'Electrónica', emoji: ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'), bg: 'linear-gradient(135deg,#BE185D,#9333EA)', glow: 'rgba(147,51,234,0.5)', tags: ['EDM', 'Trance'] },
  { name: 'DJ PULSAR', genre: 'Reggaeton', emoji: ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'), bg: 'linear-gradient(135deg,#B45309,#DC2626)', glow: 'rgba(220,38,38,0.5)', tags: ['Reggaeton', 'Latin'] },
  { name: 'NOVA', genre: 'Future Bass', emoji: ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'), bg: 'linear-gradient(135deg,#0E7490,#1D4ED8)', glow: 'rgba(14,116,144,0.5)', tags: ['Bass', 'Future'] },
  { name: 'DJ ORBITAL', genre: 'Techno', emoji: ic('<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-20 12 12)"/>'), bg: 'linear-gradient(135deg,#1F2937,#374151)', glow: 'rgba(255,255,255,0.2)', tags: ['Techno', 'Dark'] },
]

const testimonios = [
  {
    name: 'Rodrigo M.',
    text: 'Alv, fui a STELLAR BASH y no me quería ir. El show de enanos estuvo de poca y el DJ rompió todo. Ya compré para el siguiente.',
    location: 'Suchiapa, Chiapas',
    color1: '#6D28D9',
    color2: '#2563EB',
  },
  {
    name: 'Valeria T.',
    text: 'El ambiente, la música, los shots de bienvenida... todo perfecto. Las gogos estuvieron increíbles y me saqué en el concurso una botella jaja.',
    location: 'Suchiapa, Chiapas',
    color1: '#BE185D',
    color2: '#9333EA',
  },
  {
    name: 'Diego R.',
    text: 'COSMIC RAVE me dejó sin palabras. El mapping 3D es de otro nivel. Si no has ido a Nebula no sabes lo que es una fiesta.',
    location: 'Suchiapa, Chiapas',
    color1: '#0E7490',
    color2: '#1D4ED8',
  },
]
</script>

<style scoped>
/* Hero rings */
.hero-ring {
  border-radius: 50%;
  border: 1px solid rgba(109, 40, 217, 0.12);
  animation: hero-spin linear infinite;
  position: absolute;
}
@keyframes hero-spin { to { transform: rotate(360deg); } }

/* Experience card neon accent on hover */
.experience-card {
  border-top: 2px solid transparent;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}
.experience-card:hover {
  border-top-color: var(--card-color);
  box-shadow: 0 0 30px color-mix(in srgb, var(--card-color) 20%, transparent);
}

/* Gallery grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 0.75rem;
}
.gallery-cell { min-height: 180px; }
.gallery-cell.col-span-2 { grid-column: span 2; }
.gallery-cell.row-span-2 { grid-row: span 2; min-height: 375px; }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-cell.col-span-2 { grid-column: span 2; }
  .gallery-cell.row-span-2 { grid-row: span 1; min-height: 180px; }
}
@media (max-width: 480px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-cell.col-span-2,
  .gallery-cell.row-span-2 { grid-column: span 1; grid-row: span 1; }
}

/* DJ avatar glow on hover */
.dj-card:hover .dj-avatar {
  transform: scale(1.08);
  transition: transform 0.3s ease;
}
</style>
