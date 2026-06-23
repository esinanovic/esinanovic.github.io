// ============================================================
// app/page.jsx
// Fix bug 2 : la barre de progression suit le DOT ACTIF visuellement
// et non le scroll brut — alignement parfait garanti
// ============================================================
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/components/3d/Scene'), { ssr: false })

const timelineSteps = [
  {
    id: 'neptune',
    label: 'Stack & Contact',
    color: 'bg-indigo-500',
    glow:       'shadow-[0_0_8px_rgba(99,102,241,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(99,102,241,1)]',
    scrollFraction: 0.922,
  },
  {
    id: 'uranus',
    label: 'Architecte IA',
    color: 'bg-cyan-400',
    glow:       'shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(34,211,238,1)]',
    scrollFraction: 0.645,
  },
  {
    id: 'saturn',
    label: 'Administrateur Système',
    color: 'bg-yellow-200',
    glow:       'shadow-[0_0_8px_rgba(254,240,138,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(254,240,138,1)]',
    scrollFraction: 0.466,
  },
  {
    id: 'jupiter',
    label: 'DevOps & Cloud',
    color: 'bg-amber-500',
    glow:       'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(245,158,11,1)]',
    scrollFraction: 0.301,
  },
  {
    id: 'mars',
    label: 'Fondateur Atifelt',
    color: 'bg-red-500',
    glow:       'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(239,68,68,1)]',
    scrollFraction: 0.204,
  },
  {
    id: 'terre',
    label: 'Premières Expériences Pro',
    color: 'bg-blue-500',
    glow:       'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(59,130,246,1)]',
    scrollFraction: 0.146,
  },
  {
    id: 'venus',
    label: 'Premiers Projets',
    color: 'bg-orange-400',
    glow:       'shadow-[0_0_8px_rgba(251,146,60,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(251,146,60,1)]',
    scrollFraction: 0.087,
  },
  {
    id: 'mercure',
    label: 'Base du Développement',
    color: 'bg-gray-400',
    glow:       'shadow-[0_0_8px_rgba(156,163,175,0.6)]',
    glowActive: 'shadow-[0_0_18px_rgba(156,163,175,1)]',
    scrollFraction: 0.029,
  },
  {
    id: 'soleil',
    label: '',
    color: 'bg-yellow-400',
    glow:       'shadow-[0_0_12px_rgba(250,204,21,0.9)]',
    glowActive: 'shadow-[0_0_20px_rgba(250,204,21,1)]',
    scrollFraction: 0,
  },
]

// Nombre total d'intervalles entre dots (8 intervalles pour 9 dots)
const TOTAL_INTERVALS = timelineSteps.length - 1

export default function PortfolioPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activePlanetId, setActivePlanetId] = useState('soleil')
  const [hoveredId, setHoveredId] = useState(null)
  const rafRef = useRef(null)

  // ── Position visuelle de la barre ─────────────────────────
  // La barre doit atteindre exactement le dot actif.
  // Les dots sont espacés uniformément → position = index_depuis_bas / total_intervals
  const barHeight = useMemo(() => {
    const activeIndex = timelineSteps.findIndex(s => s.id === activePlanetId)
    if (activeIndex === -1) return 0
    // activeIndex 0 = neptune (haut) → depuis le bas = TOTAL_INTERVALS
    // activeIndex 8 = soleil  (bas)  → depuis le bas = 0
    const indexFromBottom = TOTAL_INTERVALS - activeIndex
    return (indexFromBottom / TOTAL_INTERVALS) * 100
  }, [activePlanetId])

  // ── Scroll handler ─────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.max(0, Math.min(1, window.scrollY / total))
        setScrollProgress(progress)

        const active =
          timelineSteps.find(s => progress >= s.scrollFraction) ??
          timelineSteps[timelineSteps.length - 1]
        setActivePlanetId(active.id)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Clic → scroll vers la planète ─────────────────────────
  const scrollToPlanet = (step) => {
    if (!step.label) return
    const total = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: step.scrollFraction * total, behavior: 'smooth' })
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ height: '1000vh', backgroundColor: '#000' }} id="scroll-container">

      {/* ============================================ */}
      {/* MINI-MAP DU SYSTÈME SOLAIRE                  */}
      {/* ============================================ */}
      <div className="fixed top-12 left-6 sm:left-10 z-50">
        <div className="relative flex flex-col gap-5 sm:gap-6">

          {/* Ligne de fond grise (statique) */}
          <div
            className="absolute z-0 pointer-events-none"
            style={{
              left: '5px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'rgba(55,65,81,0.35)',
            }}
          />

          {/* FIX BUG 2 : Ligne de progression alignée sur le dot actif */}
          {/* height = position visuelle du dot actif depuis le bas */}
          <div
            className="absolute z-0 overflow-hidden pointer-events-none"
            style={{ left: '5px', top: '8px', bottom: '8px', width: '2px' }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${barHeight}%`,
                background:
                  'linear-gradient(to top, rgba(250,204,21,0.9), rgba(251,146,60,0.6), rgba(59,130,246,0.7), rgba(34,211,238,0.8), rgba(99,102,241,0.9))',
                // Transition douce entre dots (pas de saut brusque)
                transition: 'height 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          {/* Points des planètes */}
          {timelineSteps.map((step) => {
            const isActive = activePlanetId === step.id
            const isPast   = scrollProgress >= step.scrollFraction

            return (
              <div
                key={step.id}
                className="relative z-10 flex items-center gap-3 sm:gap-4"
                style={{ cursor: step.label ? 'pointer' : 'default' }}
                onClick={() => scrollToPlanet(step)}
                onMouseEnter={() => setHoveredId(step.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Dot planète */}
                <div
                  className={`
                    rounded-full border border-black/50 flex-shrink-0
                    transition-all duration-300
                    ${step.color}
                    ${isActive ? step.glowActive : isPast ? step.glow : 'opacity-35'}
                    ${isActive ? 'w-4 h-4' : 'w-3 h-3'}
                  `}
                  style={{
                    animation: isActive ? 'pulse-planet 2s ease-in-out infinite' : 'none',
                  }}
                />

                {/* Label — masqué sur mobile */}
                {step.label && (
                  <span
                    className={`
                      hidden sm:block text-xs font-bold uppercase tracking-widest
                      select-none transition-all duration-300
                      ${isActive
                        ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]'
                        : isPast
                        ? 'text-gray-400/90'
                        : 'text-gray-600/50'}
                    `}
                  >
                    {step.label}
                  </span>
                )}

                {/* Tooltip mobile */}
                {step.label && hoveredId === step.id && (
                  <div
                    className="
                      sm:hidden absolute left-7 top-1/2 -translate-y-1/2 z-50
                      whitespace-nowrap text-xs text-white
                      bg-black/90 border border-white/10
                      px-3 py-1.5 rounded-lg pointer-events-none
                    "
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    {step.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* CANVAS 3D FIXE                               */}
      {/* ============================================ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0,
        }}
      >
        <Scene />
      </div>

      <style>{`
        @keyframes pulse-planet {
          0%, 100% { opacity: 1;    transform: scale(1);   }
          50%       { opacity: 0.65; transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}