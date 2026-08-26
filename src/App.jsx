import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   SECURE NATION GROUP — Pixila-clone layout
   ═══════════════════════════════════════════════════════════ */

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#◆●◇○'

function scrambleText(target, current, progress) {
  return target.split('').map((char, i) => {
    if (char === ' ') return ' '
    if (i < progress) return char
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  }).join('')
}

function useScramble(text, delay = 0, speed = 30) {
  const [display, setDisplay] = useState('')
  useEffect(() => {
    let frame, timeout
    timeout = setTimeout(() => {
      let iter = 0
      const max = text.length * 3
      frame = setInterval(() => {
        setDisplay(scrambleText(text, '', iter / 3))
        iter++
        if (iter > max) { clearInterval(frame); setDisplay(text) }
      }, speed)
    }, delay)
    return () => { clearInterval(frame); clearTimeout(timeout) }
  }, [text, delay, speed])
  return display
}

function useRotatingScramble(texts, interval = 3500) {
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState(texts[0])
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (index + 1) % texts.length
      const target = texts[next]
      let iter = 0
      const max = Math.max(display.length, target.length) * 3
      const s = setInterval(() => {
        const len = Math.max(display.length, target.length)
        setDisplay(Array.from({ length: len }).map((_, i) => {
          if (i < iter / 3 && i < target.length) return target[i]
          if (i >= target.length && i < iter / 3) return ''
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }).join(''))
        iter++
        if (iter > max) { clearInterval(s); setDisplay(target); setIndex(next) }
      }, 22)
    }, interval)
    return () => clearInterval(timer)
  }, [index, display, texts, interval])
  return display
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null), started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 2000, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * end))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end])
  return <span ref={ref}>{count}{suffix}</span>
}

function DotCircle({ size = 120, className = '' }) {
  const rings = 5, dotsPerRing = [8, 14, 20, 26, 32]
  const colors = ['#C41E2A', '#B8972E', '#C41E2A', '#D2B48C', '#B8972E']
  const cx = size / 2, cy = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle cx={cx} cy={cy} r={3} fill="#C8963E" />
      {Array.from({ length: rings }).map((_, r) =>
        Array.from({ length: dotsPerRing[r] }).map((_, d) => {
          const a = (d / dotsPerRing[r]) * Math.PI * 2 - Math.PI / 2
          return <circle key={`${r}-${d}`} cx={cx + Math.cos(a) * (10 + r * 12)} cy={cy + Math.sin(a) * (10 + r * 12)} r={2.2 - r * 0.2} fill={colors[r % 5]} opacity={0.7 - r * 0.08} />
        })
      )}
    </svg>
  )
}

// ── Logo mark — dot crescent from the SN logo (Aboriginal flag colors) ──
function LogoMark({ size = 36, className = '' }) {
  const cx = size / 2, cy = size / 2
  const red = '#C41E2A'  // Aboriginal flag red (land)
  const gold = '#B8972E' // Aboriginal flag gold (sun)

  // 3 arcs of dots forming a crescent — outer red, middle gold, inner red
  const arcs = [
    { radius: size * 0.42, dots: 14, color: red, dotSize: size * 0.045, startAngle: -140, endAngle: 140 },
    { radius: size * 0.33, dots: 10, color: gold, dotSize: size * 0.04, startAngle: -130, endAngle: 130 },
    { radius: size * 0.24, dots: 8, color: red, dotSize: size * 0.035, startAngle: -120, endAngle: 120 },
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      {arcs.map((arc, ai) =>
        Array.from({ length: arc.dots }).map((_, di) => {
          const t = di / (arc.dots - 1)
          const angleDeg = arc.startAngle + t * (arc.endAngle - arc.startAngle)
          const angle = (angleDeg - 90) * (Math.PI / 180)
          return (
            <circle
              key={`${ai}-${di}`}
              cx={cx + Math.cos(angle) * arc.radius}
              cy={cy + Math.sin(angle) * arc.radius}
              r={arc.dotSize}
              fill={arc.color}
              opacity={0.85}
            />
          )
        })
      )}
    </svg>
  )
}

// ── Preloader text ──
function PreloaderText() {
  const text = useScramble('SECURE NATION', 800)
  return (
    <div className="font-display text-2xl sm:text-3xl font-800 text-earth-50 tracking-tight mb-3" style={{ animation: 'fade-up 0.8s ease 1s both' }}>
      {text}
    </div>
  )
}

// ── Magnetic button component ──
function MagButton({ children, href, className = '' }) {
  const ref = useRef(null)
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onMouseMove={e => {
        const rect = ref.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
      }}
      onMouseLeave={() => { ref.current.style.transform = 'translate(0,0)' }}
      style={{ transition: 'transform 0.3s ease' }}
    >
      {children}
    </a>
  )
}

// ═══════════════════════════════════════
export default function App() {
  const [preloading, setPreloading] = useState(true)
  const [preloaderFading, setPreloaderFading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const cursorTrail = useRef([])
  const cursorRef = useRef(null)
  const isTouchDevice = useRef(false)

  // Preloader sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPreloaderFading(true), 3500)
    const t2 = setTimeout(() => { setPreloading(false); setLoaded(true) }, 4200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (preloading) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
  }, [preloading])

  useEffect(() => {
    // Detect touch device
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      setShowBackToTop(window.scrollY > 600)
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(h > 0 ? window.scrollY / h : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Custom cursor trail — desktop only
    let onMouse
    if (!isTouchDevice.current) {
      const trail = []
      for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div')
        dot.style.cssText = `position:fixed;width:${8 - i}px;height:${8 - i}px;border-radius:50%;pointer-events:none;z-index:9999;background:${i % 2 === 0 ? '#C41E2A' : '#B8972E'};opacity:${0.5 - i * 0.05};transition:transform ${60 + i * 25}ms ease;`
        document.body.appendChild(dot)
        trail.push(dot)
      }
      cursorTrail.current = trail
      onMouse = (e) => {
        trail.forEach((dot, i) => {
          setTimeout(() => {
            dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
          }, i * 40)
        })
      }
      window.addEventListener('mousemove', onMouse, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (onMouse) window.removeEventListener('mousemove', onMouse)
      cursorTrail.current.forEach(d => d.remove())
    }
  }, [])

  const heroText = useScramble('SECURE NATION', 900)
  const rotatingLabel = useRotatingScramble([
    'INDIGENOUS OWNED', 'NATIONALLY TRUSTED', 'CULTURALLY INFORMED',
    'PROTECTING COUNTRY', 'SECURING THE FUTURE', 'COMMUNITY FIRST'
  ])

  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal()
  const r5 = useReveal(), r6 = useReveal(), r7 = useReveal(), r8 = useReveal()

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Heritage', href: '#heritage' },
    { label: 'Contact', href: '#contact' },
  ]

  const faqs = [
    { q: 'What makes Secure Nation Group different?', a: 'We are Australia\'s only Indigenous-owned national security company. Our unique cultural perspective, combined with over 50 years of industry experience, allows us to deliver security solutions that are both operationally excellent and culturally informed.' },
    { q: 'What services do you offer?', a: 'We provide comprehensive risk assessments, security personnel deployment (static guards, mobile patrols, event security, executive protection), advanced technology integration (CCTV, access control, alarm systems), security consulting, and training programs.' },
    { q: 'Where do you operate?', a: 'We operate nationally across every Australian state and territory, with capability in both urban centres and remote locations including mining sites, construction projects, and regional communities.' },
    { q: 'How do you support Indigenous communities?', a: 'We create meaningful employment pathways for Indigenous Australians through training, mentorship, and career development programs. We also invest directly in community empowerment initiatives and maintain strong relationships with Traditional Custodians across our operational areas.' },
    { q: 'What industries do you serve?', a: 'We serve government and defence, mining and resources, construction, healthcare, education, transport and logistics, events and entertainment, retail and commercial, critical infrastructure, and hospitality sectors.' },
    { q: 'How quickly can you deploy security personnel?', a: 'Our 24/7 operations centre enables rapid deployment. For planned engagements, we can mobilise within 48-72 hours. For emergency or urgent requirements, we maintain a rapid response capability for same-day deployment in major metropolitan areas.' },
    { q: 'What certifications do you hold?', a: 'We hold a Master Security Licence, ASIAL membership, ISO 9001 Quality Management certification, and Supply Nation certification as a verified Indigenous-owned business.' },
  ]

  return (
    <div className="grain">

      {/* ═══ PRELOADER ═══ */}
      {preloading && (
        <div className={`fixed inset-0 z-[9999] bg-earth-950 flex flex-col items-center justify-center transition-opacity duration-700 ${preloaderFading ? 'opacity-0' : 'opacity-100'}`}>
          {/* Preloader background */}
          <div className="absolute inset-0 dot-pattern opacity-[0.04]" />
          <div className="absolute inset-0 topo-lines opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-ochre/[0.04] blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Animated logo building */}
            <div className="mb-8" style={{ animation: 'fade-up 1s ease 0.3s both' }}>
              <LogoMark size={80} />
            </div>
            {/* Company name scramble */}
            <PreloaderText />
            <div className="font-display text-[10px] tracking-[0.4em] uppercase text-ochre/50 mb-12" style={{ animation: 'fade-up 0.8s ease 1.5s both' }}>
              GROUP
            </div>
            {/* Loading bar */}
            <div className="w-48 h-[2px] bg-earth-800 overflow-hidden" style={{ animation: 'fade-up 0.6s ease 2s both' }}>
              <div className="h-full bg-gradient-to-r from-flag-red via-flag-gold to-flag-red" style={{ animation: 'loading-bar 2s ease 2s both' }} />
            </div>
            <div className="mt-4 font-display text-[8px] tracking-[0.4em] uppercase text-earth-600" style={{ animation: 'fade-up 0.6s ease 2.2s both' }}>
              Securing the Nation
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCROLL PROGRESS BAR ═══ */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div className="h-full bg-gradient-to-r from-flag-red via-flag-gold to-ochre transition-none" style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* ═══ NAV — minimal like Pixila ═══ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-earth-950/90 backdrop-blur-md' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-14 flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-3">
            <LogoMark size={36} />
            <div><div className="font-display text-xs font-bold tracking-wide text-earth-50 leading-none">SECURE NATION</div><div className="font-display text-[7px] tracking-[0.25em] text-ochre/60">GROUP</div></div>
          </a>
          <div className="hidden lg:flex items-center gap-10">
            {links.map(l => (
              <a key={l.href} href={l.href} className="font-display text-[11px] tracking-[0.2em] uppercase text-earth-400 hover:text-ochre transition-colors">{l.label}</a>
            ))}
            <a href="#contact" className="px-5 py-2.5 bg-ochre hover:bg-ochre-light text-earth-950 font-display text-[11px] tracking-[0.15em] uppercase font-bold transition-all hover:shadow-[0_0_20px_rgba(200,150,62,0.3)]">Contact</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-earth-300">
            <div className="flex flex-col gap-1.5">
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-8 py-6 bg-earth-950/95 backdrop-blur-md border-t border-ochre/10 space-y-1">
            {links.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block py-3 font-display text-sm tracking-wider uppercase text-earth-300 hover:text-ochre border-b border-earth-800/30">{l.label}</a>)}
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block mt-4 py-3.5 bg-ochre text-earth-950 font-display text-sm tracking-[0.15em] uppercase font-bold text-center">Contact Us</a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO — Full viewport, Pixila-style
          Giant text over atmospheric background
      ═══════════════════════════════════════ */}
      <section
        className="relative h-[100dvh] flex flex-col overflow-hidden"
        onMouseMove={e => {
          if (isTouchDevice.current) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          const bg = e.currentTarget.querySelector('.hero-parallax')
          const glow = e.currentTarget.querySelector('.hero-glow')
          const particles = e.currentTarget.querySelector('.hero-particles')
          if (bg) bg.style.transform = `scale(1.08) translate(${x * -20}px, ${y * -15}px)`
          if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px' }
          if (particles) particles.style.transform = `translate(${x * 30}px, ${y * 20}px)`
        }}
      >
        {/* BG video — parallax on mouse */}
        <div className="absolute inset-[-40px] hero-parallax transition-transform duration-300 ease-out">
          <video
            autoPlay muted loop playsInline
            poster="/hero-bg.jpg"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.5) contrast(1.2) saturate(1.1)' }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Mouse-following glow — hidden on touch */}
        <div className="hero-glow pointer-events-none fixed z-10 hidden lg:block" style={{ width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,150,62,0.08) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', transition: 'left 0.15s ease-out, top 0.15s ease-out' }} />

        {/* Floating particles */}
        <div className="hero-particles absolute inset-0 z-[5] pointer-events-none transition-transform duration-500 ease-out">
          {Array.from({ length: typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 30 }).map((_, i) => {
            const size = 2 + Math.random() * 4
            const x = Math.random() * 100
            const y = Math.random() * 100
            const delay = Math.random() * 5
            const dur = 4 + Math.random() * 6
            const opacity = 0.15 + Math.random() * 0.35
            const colors = ['#C8963E', '#DEAD5A', '#A0522D', '#D2B48C', '#8B3A2A']
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: size, height: size,
                  left: `${x}%`, top: `${y}%`,
                  backgroundColor: colors[i % colors.length],
                  opacity,
                  animation: `float-particle ${dur}s ease-in-out ${delay}s infinite alternate`,
                }}
              />
            )
          })}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/20 to-earth-950/50 z-[6]" />
        <div className="absolute inset-0 bg-gradient-to-b from-earth-950/60 via-transparent to-transparent z-[6]" />

        {/* Top label corners */}
        <div className={`absolute top-24 left-8 lg:left-14 z-30 transition-all duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <DotCircle size={36} className="opacity-40 mb-2" />
          <span className="font-display text-[9px] tracking-[0.35em] uppercase text-ochre/50 font-medium">Indigenous Owned</span>
        </div>
        <div className={`absolute top-24 right-8 lg:right-14 z-30 text-right transition-all duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex gap-1 justify-end mb-2">
            <div className="w-5 h-0.5 bg-ochre/30 rotate-[30deg]" />
            <div className="w-5 h-0.5 bg-ochre/50 rotate-[30deg]" />
          </div>
          <span className="font-display text-[9px] tracking-[0.35em] uppercase text-ochre/50 font-medium">Est. Australia</span>
        </div>

        {/* Center content — MASSIVE TEXT */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 px-6">
          {/* Rotating service label above */}
          <div className={`mb-4 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
            <span className="font-display text-[10px] sm:text-[12px] tracking-[0.5em] uppercase text-ochre/60 font-medium">
              {rotatingLabel}
            </span>
          </div>

          {/* Company name — viewport-filling like Pixila */}
          <h1 className={`font-display font-800 text-center leading-[0.85] tracking-tight transition-all duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-12'}`}>
            <span className="block text-[14vw] sm:text-[11vw] lg:text-[9vw] text-earth-50"
              style={{ textShadow: '0 0 100px rgba(200,150,62,0.12)' }}>
              {heroText}
            </span>
          </h1>

          {/* Subtitle below name */}
          <div className={`mt-5 transition-all duration-1000 delay-800 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <p className="font-display text-sm sm:text-base tracking-[0.35em] uppercase text-earth-500 text-center">
              Australia's First Indigenous Security Company
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`relative z-30 transition-all duration-1000 delay-1200 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          <div className="shimmer-line h-px mx-8 lg:mx-14" />
          <div className="flex items-center justify-between px-8 lg:px-14 py-4">
            <span className="font-display text-[8px] tracking-[0.4em] uppercase text-earth-600 hidden sm:block">Security Solutions</span>
            <svg className="w-4 h-4 text-ochre/30 animate-bounce mx-auto sm:mx-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
            <span className="font-display text-[8px] tracking-[0.4em] uppercase text-earth-600 hidden sm:block">Scroll to Explore</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TAGLINE — Like Pixila's "à la hauteur" section
          Big headline + copy + CTA, generous spacing
      ═══════════════════════════════════════ */}
      <section id="about" className="relative py-32 lg:py-44">
        <div className="absolute inset-0 topo-lines opacity-30" />
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div ref={r1} className="reveal">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-24">
              {/* Left — big headline */}
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-ochre" />
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    <div className="w-1.5 h-1.5 rounded-full bg-ochre-light" />
                  </div>
                  <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">About Secure Nation</span>
                </div>
                <h2 className="font-display text-4xl lg:text-[3.2rem] font-800 text-earth-50 leading-[1.05] tracking-tight">
                  At the Height<br />of Your<br />
                  <span className="text-ochre">Security</span>
                </h2>
              </div>
              {/* Right — body copy */}
              <div className="flex flex-col justify-center">
                <p className="text-earth-300 leading-[1.85] mb-6">
                  Australia's first Indigenous-owned national security company, delivering innovative and tailored solutions backed by over 50 years of combined experience. We specialise in comprehensive risk assessments, on-ground personnel deployment, and advanced technology integration.
                </p>
                <p className="text-earth-400 leading-[1.85] mb-8">
                  Trusted by Australia's leading companies and government bodies, we prioritise safety, inclusivity, and community empowerment while ensuring the utmost protection for essential infrastructure and high-stakes projects across the nation.
                </p>
                <a href="#services" className="group inline-flex items-center gap-3 font-display text-[11px] tracking-[0.2em] uppercase text-ochre font-bold hover:text-ochre-light transition-colors">
                  Discover Our Services
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3 FEATURE ICONS — Like Pixila's helmet/rope/axe
      ═══════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 border-y border-earth-800/30 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-[0.02]" />
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Protection at the Summit',
                desc: 'Strategic risk management combining Indigenous knowledge with modern security expertise to deliver unmatched situational awareness.',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                num: '01',
              },
              {
                title: 'Community First Approach',
                desc: 'Building meaningful relationships with communities, creating employment pathways, and delivering security with cultural respect and understanding.',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                num: '02',
              },
              {
                title: 'Innovation & Technology',
                desc: 'Integrating AI-powered surveillance, advanced access control, and smart monitoring with human expertise for complete security solutions.',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                ),
                num: '03',
              },
            ].map((f, i) => (
              <div key={i} ref={useReveal()} className={`reveal reveal-delay-${i + 1} group relative p-8 lg:p-10 border border-earth-800/30 bg-earth-900/20 hover:border-flag-gold/25 hover:bg-earth-900/40 transition-all duration-500`}>
                {/* Number */}
                <span className="absolute top-6 right-6 font-display text-[11px] tracking-[0.2em] text-earth-700 font-bold">{f.num}</span>
                {/* Dot accent */}
                <div className="flex gap-1 mb-6">
                  <div className="w-2 h-2 rounded-full bg-flag-red" />
                  <div className="w-2 h-2 rounded-full bg-flag-gold" />
                  <div className="w-2 h-2 rounded-full bg-flag-red opacity-50" />
                </div>
                {/* Icon */}
                <div className="text-ochre mb-5 group-hover:text-flag-gold transition-colors">{f.icon}</div>
                <h3 className="font-display text-lg font-bold text-earth-50 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-earth-400 leading-[1.85]">{f.desc}</p>
                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-flag-red/0 via-flag-gold/40 to-flag-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SHOWCASE — Clean 3-card layout
      ═══════════════════════════════════════ */}
      <section id="services" className="relative py-28 lg:py-36">
        <div className="absolute top-0 inset-x-0 h-px shimmer-line" />
        <div className="max-w-[1200px] mx-auto px-8 lg:px-14">
          <div ref={r2} className="reveal mb-16">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-end">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-flag-red" />
                    <div className="w-1.5 h-1.5 rounded-full bg-flag-gold" />
                  </div>
                  <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">What We Protect</span>
                </div>
                <h2 className="font-display text-3xl lg:text-[2.8rem] font-800 text-earth-50 leading-[1.1] tracking-tight">
                  Trusted Across<br /><span className="text-ochre">Every Sector</span>
                </h2>
              </div>
              <p className="text-earth-400 leading-[1.85] lg:text-right">
                From remote mining operations to Commonwealth government buildings, from major festivals to critical infrastructure — culturally informed protection at the highest standard.
              </p>
            </div>
          </div>

          {/* 3 showcase cards */}
          <div className="grid lg:grid-cols-3 gap-5">
            {[
              { src: '/showcase-mining.jpg', label: 'Mining & Resources', title: 'Outback Site Security', desc: 'Remote deployment across Australia\'s largest mining operations' },
              { src: '/showcase-govt.jpg', label: 'Government & Defence', title: 'Commonwealth Security', desc: 'Trusted by federal and state government bodies nationwide' },
              { src: '/showcase-event1.jpg', label: 'Events & Festivals', title: 'Event Security Teams', desc: 'Large-scale event protection with cultural awareness' },
            ].map((card, i) => (
              <div key={i} ref={useReveal()} className={`reveal reveal-delay-${i + 1} group cursor-pointer`}>
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <img
                    src={card.src} alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ filter: 'brightness(0.85) contrast(1.05) saturate(1.1)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-950/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-earth-950/60 backdrop-blur-sm font-display text-[8px] tracking-[0.25em] uppercase text-ochre font-medium">
                      {card.label}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-earth-50 mb-1.5 group-hover:text-ochre transition-colors">{card.title}</h3>
                <p className="text-sm text-earth-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CINEMATIC B-ROLL BREAK ═══ */}
      <section className="relative h-64 lg:h-80 overflow-hidden">
        <video autoPlay muted loop playsInline preload="none" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.4) contrast(1.15) saturate(1.1)' }}>
          <source src="/broll-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-earth-950/70 via-transparent to-earth-950/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={useReveal()} className="reveal text-center px-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-flag-gold/40" />
              <LogoMark size={28} className="opacity-50" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-flag-gold/40" />
            </div>
            <p className="font-display text-lg sm:text-2xl font-800 text-earth-50 tracking-tight">
              Connected to Country. <span className="text-ochre">Committed to You.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST MARQUEE — Like Pixila's client banner
      ═══════════════════════════════════════ */}
      <section className="relative py-14 border-y border-earth-800/30 overflow-hidden">
        <div className="relative" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
          <div className="flex whitespace-nowrap scroll-strip">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="font-display text-[13px] tracking-[0.25em] uppercase text-earth-600 mx-12 flex-shrink-0">
                Trusted by Australia's Leading Organisations
                <span className="inline-block mx-6 text-ochre/30">◆</span>
                Indigenous Owned & Operated
                <span className="inline-block mx-6 text-ochre/30">◆</span>
                50+ Years Combined Experience
                <span className="inline-block mx-6 text-ochre/30">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS — Clean horizontal
      ═══════════════════════════════════════ */}
      <section ref={r3} className="reveal relative py-24 lg:py-32">
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: 50, suffix: '+', label: 'Years Combined\nExperience' },
              { value: 500, suffix: '+', label: 'Security\nPersonnel' },
              { value: 100, suffix: '%', label: 'Indigenous\nOwned' },
              { value: 24, suffix: '/7', label: 'Operations\nCentre' },
            ].map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="font-display text-5xl lg:text-6xl font-800 text-ochre mb-3 tracking-tight"><Counter end={s.value} suffix={s.suffix} /></div>
                <div className="font-display text-[10px] tracking-[0.2em] uppercase text-earth-500 font-medium whitespace-pre-line leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOUNDER — Alex Wymarra
      ═══════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 topo-lines opacity-30" />
        <DotCircle size={300} className="absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.04] hidden lg:block" />
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-center">
            {/* Left — founder image placeholder */}
            <div ref={useReveal()} className="reveal relative">
              <div className="aspect-[3/4] bg-earth-800/40 border border-earth-700/30 overflow-hidden relative">
                <img src="/alex-wymarra.jpg" alt="Alex Wymarra" className="w-full h-full object-cover object-top" style={{ filter: 'brightness(0.9) contrast(1.05)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-transparent to-earth-950/20" />
                <div className="absolute bottom-6 left-6">
                  <span className="font-display text-[9px] tracking-[0.3em] uppercase text-flag-gold/70">Founder & Director</span>
                </div>
              </div>
              {/* Decorative offset border */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border border-flag-red/15 -z-10" />
              <div className="absolute -bottom-6 -right-6 w-full h-full border border-flag-gold/8 -z-10" />
            </div>

            {/* Right — bio */}
            <div ref={useReveal()} className="reveal reveal-delay-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-flag-red" />
                  <div className="w-1.5 h-1.5 rounded-full bg-flag-gold" />
                </div>
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">The Founder</span>
              </div>

              <h2 className="font-display text-3xl lg:text-[2.8rem] font-800 text-earth-50 leading-[1.05] tracking-tight mb-2">
                Alex Wymarra
              </h2>
              <p className="font-display text-sm text-flag-gold tracking-wide mb-8">Gudang/Yadhaykenu Tribal Leader &bull; Co-Founder &bull; Director</p>

              <div className="space-y-5 text-earth-300 leading-[1.85]">
                <p>
                  A proud Gudang/Yadhaykenu man and tribal leader from Cape York Peninsula in Far North Queensland, Alex Wymarra is the driving force behind Secure Nation Group — Australia's first and only Indigenous-owned national security company.
                </p>
                <p>
                  Alex brings the cultural authority, community trust, and visionary leadership that sets Secure Nation apart. His deep connection to Country and his standing as a custodian of one of the world's oldest continuous cultures gives the company a perspective no other security provider can match.
                </p>
                <p>
                  Backed by a leadership team with over 50 years of combined security industry experience, Alex's vision is clear: build a company that protects Australia's people, places, and infrastructure — while creating real opportunities for Indigenous communities. With Secure Nation Group, that vision is now reality.
                </p>
              </div>

              {/* Highlights */}
              <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  { num: '50+', label: 'Years Team\nExperience' },
                  { num: '100%', label: 'Indigenous\nOwned' },
                  { num: '8', label: 'States &\nTerritories' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 sm:p-4 border border-earth-800/30">
                    <div className="font-display text-xl sm:text-2xl font-800 text-ochre mb-1">{s.num}</div>
                    <div className="font-display text-[7px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-earth-500 whitespace-pre-line leading-relaxed">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AUSTRALIA MAP — 3D Coverage
      ═══════════════════════════════════════ */}
      <section className="relative py-28 lg:py-40 bg-earth-900/20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px shimmer-line" />
        <div className="absolute inset-0 dot-pattern opacity-[0.02]" />
        <div className="max-w-[1200px] mx-auto px-8 lg:px-14">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16 items-center">
            {/* Left — text */}
            <div ref={useReveal()} className="reveal">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-flag-red" /><div className="w-1.5 h-1.5 rounded-full bg-flag-gold" /></div>
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">National Reach</span>
              </div>
              <h2 className="font-display text-3xl lg:text-[2.6rem] font-800 text-earth-50 leading-[1.1] tracking-tight mb-6">
                Operations Across<br /><span className="text-ochre">The Entire Nation</span>
              </h2>
              <p className="text-earth-400 leading-[1.85] mb-8">
                From Perth to Sydney, Darwin to Hobart — our operations centre coordinates security personnel and rapid response across all eight states and territories, 24 hours a day.
              </p>
              {/* City list */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { city: 'Sydney', state: 'NSW' },
                  { city: 'Melbourne', state: 'VIC' },
                  { city: 'Brisbane', state: 'QLD' },
                  { city: 'Perth', state: 'WA' },
                  { city: 'Adelaide', state: 'SA' },
                  { city: 'Darwin', state: 'NT' },
                  { city: 'Canberra', state: 'ACT' },
                  { city: 'Hobart', state: 'TAS' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-flag-red" />
                    <span className="text-sm text-earth-200 font-medium">{c.city}</span>
                    <span className="text-[10px] text-earth-600">{c.state}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 3D tilted map image */}
            <div ref={useReveal()} className="reveal reveal-delay-2 relative"
              onMouseMove={e => {
                if (isTouchDevice.current) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                const map = e.currentTarget.querySelector('.map-3d')
                if (map) map.style.transform = `perspective(800px) rotateX(${y * -8 + 8}deg) rotateY(${x * 12}deg) scale(1.02)`
              }}
              onMouseLeave={e => {
                if (isTouchDevice.current) return
                const map = e.currentTarget.querySelector('.map-3d')
                if (map) map.style.transform = 'perspective(800px) rotateX(8deg) rotateY(0deg) scale(1)'
              }}
            >
              {/* Glow behind map */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[400px] rounded-full bg-ochre/[0.08] blur-[100px]" />
              </div>

              <div className="map-3d transition-transform duration-300 ease-out" style={{ transform: 'perspective(800px) rotateX(8deg) rotateY(0deg)', transformStyle: 'preserve-3d' }}>
                <img
                  src="/australia-map.jpg"
                  alt="Secure Nation Group — National Coverage"
                  className="w-full h-auto rounded-sm"
                  style={{ filter: 'brightness(1.1) contrast(1.05)', boxShadow: '0 30px 80px rgba(200,150,62,0.12), 0 0 120px rgba(200,150,62,0.05)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CERTIFICATIONS — Badge wall
      ═══════════════════════════════════════ */}
      <section className="relative py-20 border-y border-earth-800/30">
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="text-center mb-12">
            <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/50 font-medium">Accredited & Certified</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Supply Nation', sub: 'Certified Indigenous Business' },
              { name: 'ASIAL', sub: 'Industry Member' },
              { name: 'Master Licence', sub: 'Security Provider' },
              { name: 'ISO 9001', sub: 'Quality Management' },
              { name: 'Indigenous Owned', sub: '100% Aboriginal Owned' },
            ].map((cert, i) => (
              <div key={i} ref={useReveal()} className={`reveal reveal-delay-${i + 1} group text-center p-6 border border-earth-800/30 hover:border-flag-gold/30 bg-earth-900/20 hover:bg-flag-gold/[0.03] transition-all duration-500 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <LogoMark size={32} className="mx-auto mb-3 opacity-30 group-hover:opacity-60 transition-opacity" />
                <div className="font-display text-xs font-bold text-earth-100 group-hover:text-flag-gold transition-colors">{cert.name}</div>
                <div className="font-display text-[8px] tracking-[0.15em] uppercase text-earth-600 mt-1">{cert.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HERITAGE — 3 cards like Pixila's feature cards
      ═══════════════════════════════════════ */}
      <section id="heritage" className="relative py-28 lg:py-36 bg-earth-900/20">
        <div className="absolute top-0 inset-x-0 h-px shimmer-line" />
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div ref={r4} className="reveal mb-16">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-ochre" />
                <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                <div className="w-1.5 h-1.5 rounded-full bg-ochre-light" />
              </div>
              <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">Our Heritage</span>
            </div>
            <h2 className="font-display text-3xl lg:text-[2.8rem] font-800 text-earth-50 leading-[1.1] tracking-tight">
              Walking in Two Worlds.<br /><span className="text-ochre">Protecting One Nation.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { title: 'Connection to Country', desc: 'Our Indigenous heritage gives us a deep understanding of the land we protect. Cultural knowledge and community connections that no other security company can offer.', dots: 5 },
              { title: 'Community Empowerment', desc: 'Meaningful employment pathways for Indigenous Australians — training, mentorship, and career development. When you partner with us, you invest in community.', dots: 4 },
              { title: 'Reconciliation in Action', desc: "We don't just talk about reconciliation — we live it. Bridging cultures, building trust, demonstrating that Indigenous businesses deliver world-class results.", dots: 3 },
            ].map((c, i) => (
              <div key={i} ref={useReveal()} className={`reveal reveal-delay-${i + 1} p-8 lg:p-10 bg-earth-900/40 border border-earth-800/40 hover:border-ochre/20 transition-all duration-500`}>
                <div className="flex gap-1.5 mb-8">
                  {Array.from({ length: c.dots }).map((_, d) => <div key={d} className="w-2.5 h-2.5 rounded-full bg-ochre" style={{ opacity: 1 - d * 0.18 }} />)}
                </div>
                <h3 className="font-display text-xl font-bold text-earth-50 mb-4 tracking-tight">{c.title}</h3>
                <p className="text-sm text-earth-400 leading-[1.85]">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Acknowledgement */}
          <div ref={r5} className="reveal mt-14 p-8 border border-ochre/12 bg-ochre/[0.02]">
            <div className="flex items-start gap-5">
              <DotCircle size={44} className="flex-shrink-0 opacity-50 mt-1" />
              <div>
                <h4 className="font-display text-xs font-bold text-ochre mb-2 tracking-wider uppercase">Acknowledgement of Country</h4>
                <p className="text-earth-400 text-sm leading-[1.8]">Secure Nation Group acknowledges the Traditional Custodians of the lands on which we operate and live. We pay our respects to Elders past, present, and emerging, and recognise the enduring connection Aboriginal and Torres Strait Islander peoples have to Country, culture, and community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ — Like Pixila's accordion
      ═══════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36">
        <div className="max-w-[900px] mx-auto px-8 lg:px-14">
          <div ref={r6} className="reveal mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-800 text-earth-50 tracking-tight">
              Frequently Asked<br /><span className="text-ochre">Questions</span>
            </h2>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-earth-800/40">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className={`font-display text-sm lg:text-base font-semibold tracking-tight transition-colors ${faqOpen === i ? 'text-ochre' : 'text-earth-200 group-hover:text-earth-50'}`}>
                    {faq.q}
                  </span>
                  <span className={`text-xl text-earth-500 transition-transform duration-300 flex-shrink-0 ml-4 ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: faqOpen === i ? 300 : 0 }}>
                  <p className="pb-6 text-sm text-earth-400 leading-[1.85] pr-12">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — Bold final section
      ═══════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.3) blur(3px)' }} />
        </div>
        <div className="absolute inset-0 bg-earth-950/85" />
        <div className="relative max-w-[900px] mx-auto px-8 lg:px-14 text-center">
          <div ref={r7} className="reveal">
            <DotCircle size={64} className="mx-auto mb-8 opacity-30" />
            <h2 className="font-display text-3xl lg:text-5xl font-800 text-earth-50 leading-[1.1] tracking-tight mb-6">
              Securing Today.<br /><span className="text-ochre">Safeguarding Tomorrow.</span>
            </h2>
            <p className="text-earth-300 leading-[1.85] mb-10 max-w-xl mx-auto">
              Partner with Australia's first Indigenous-owned national security company. Experience the difference.
            </p>
            <a href="#contact" className="group inline-flex items-center gap-3 px-10 py-4 bg-ochre hover:bg-ochre-light text-earth-950 font-display text-[12px] tracking-[0.15em] uppercase font-bold transition-all hover:shadow-[0_0_40px_rgba(200,150,62,0.25)]">
              Start a Conversation
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="relative py-28 lg:py-36 bg-earth-900/30">
        <div className="absolute top-0 inset-x-0 h-px shimmer-line" />
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <div ref={r8} className="reveal">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-ochre" /><div className="w-1.5 h-1.5 rounded-full bg-terracotta" /></div>
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-ochre/60 font-medium">Contact</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-800 text-earth-50 leading-[1.1] tracking-tight mb-6">
                Let's Discuss Your<br /><span className="text-ochre">Security Needs</span>
              </h2>
              <p className="text-earth-300 leading-[1.85] mb-10">Whether you need a comprehensive risk assessment, ongoing security personnel, or technology solutions — our team is ready.</p>
              <div className="space-y-5">
                {[
                  { label: 'Email', value: 'info@securenationgroup.com.au' },
                  { label: 'Phone', value: '1300 SECURE' },
                  { label: 'Location', value: 'Melbourne, Victoria, Australia' },
                  { label: 'Operations', value: '24/7 National Coverage' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-1 h-1 rounded-full bg-ochre/50" />
                    <div>
                      <span className="font-display text-[9px] tracking-[0.2em] uppercase text-earth-500 font-medium">{c.label}</span>
                      <div className="text-earth-100 text-sm font-medium">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div ref={useReveal()} className="reveal reveal-delay-2">
              <form onSubmit={e => e.preventDefault()} className="p-5 sm:p-8 lg:p-10 bg-earth-900/40 border border-earth-800/40">
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[['Full Name', 'text', 'Your name'], ['Email', 'email', 'your@email.com']].map(([label, type, ph]) => (
                      <div key={label}>
                        <label className="block font-display text-[9px] tracking-[0.2em] uppercase text-earth-500 font-medium mb-2">{label}</label>
                        <input type={type} placeholder={ph} className="w-full bg-earth-950/50 border border-earth-700/40 px-4 py-3 text-earth-100 text-sm outline-none focus:border-ochre/40 transition-colors placeholder:text-earth-700" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block font-display text-[9px] tracking-[0.2em] uppercase text-earth-500 font-medium mb-2">Organisation</label>
                    <input type="text" placeholder="Company or organisation" className="w-full bg-earth-950/50 border border-earth-700/40 px-4 py-3 text-earth-100 text-sm outline-none focus:border-ochre/40 transition-colors placeholder:text-earth-700" />
                  </div>
                  <div>
                    <label className="block font-display text-[9px] tracking-[0.2em] uppercase text-earth-500 font-medium mb-2">Message</label>
                    <textarea rows={4} placeholder="Tell us about your security requirements..." className="w-full bg-earth-950/50 border border-earth-700/40 px-4 py-3 text-earth-100 text-sm outline-none focus:border-ochre/40 transition-colors resize-none placeholder:text-earth-700" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-ochre hover:bg-ochre-light text-earth-950 font-display text-[12px] tracking-[0.15em] uppercase font-bold transition-all hover:shadow-[0_0_24px_rgba(200,150,62,0.2)]">Send Enquiry</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — Like Pixila ═══ */}
      <footer className="relative py-16 bg-earth-950 border-t border-earth-800/30">
        <div className="max-w-[1100px] mx-auto px-8 lg:px-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div>
              <div className="flex items-center gap-2 mb-5">
              <LogoMark size={30} />
              <div><div className="font-display text-[10px] font-bold tracking-wide text-earth-100 leading-none">SECURE NATION</div><div className="font-display text-[6px] tracking-[0.25em] text-ochre/50">GROUP</div></div>
            </div>
              <p className="text-sm text-earth-500 leading-[1.8]">Australia's first Indigenous-owned national security company.</p>
            </div>
            <div>
              <h4 className="font-display text-[9px] tracking-[0.3em] uppercase text-earth-500 font-semibold mb-5">Company</h4>
              <div className="space-y-3">{['About', 'Heritage', 'Services', 'Contact'].map(l => <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-earth-600 hover:text-ochre transition-colors">{l}</a>)}</div>
            </div>
            <div>
              <h4 className="font-display text-[9px] tracking-[0.3em] uppercase text-earth-500 font-semibold mb-5">Services</h4>
              <div className="space-y-3 text-sm text-earth-600">{['Risk Assessment', 'Security Guards', 'Mobile Patrols', 'Event Security', 'Technology', 'Consulting'].map(l => <span key={l} className="block">{l}</span>)}</div>
            </div>
            <div>
              <h4 className="font-display text-[9px] tracking-[0.3em] uppercase text-earth-500 font-semibold mb-5">Certifications</h4>
              <div className="space-y-3 text-sm text-earth-600">{['Master Security Licence', 'ASIAL Member', 'Supply Nation Certified', 'Indigenous Owned'].map(l => <span key={l} className="block">{l}</span>)}</div>
            </div>
          </div>
          <div className="pt-8 border-t border-earth-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-display text-[9px] tracking-[0.15em] text-earth-700">&copy; {new Date().getFullYear()} Secure Nation Group Pty Ltd</span>
            <div className="flex gap-6">
              <span className="font-display text-[9px] tracking-[0.15em] text-earth-700">Privacy Policy</span>
              <span className="font-display text-[9px] tracking-[0.15em] text-earth-700">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ BACK TO TOP ═══ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-ochre/90 hover:bg-ochre text-earth-950 transition-all duration-300 shadow-lg shadow-ochre/20 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      </button>
    </div>
  )
}
