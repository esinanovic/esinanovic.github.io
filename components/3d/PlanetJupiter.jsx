'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function PlanetJupiter({ position = [0, 0, -200] }) {
  const meshRef = useRef()
  const cloudsRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  const atmosphereMaterialRef = useRef()
  const textRef = useRef()
  
  const { camera } = useThree()
  const [colorMap] = useTexture(['/textures/jupiter_color.webp'])

  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.08)
  const baseSpeed = 0.08

  useEffect(() => {
    return () => {
      if (geometryRef.current) geometryRef.current.dispose()
      if (materialRef.current) materialRef.current.dispose()
      if (atmosphereMaterialRef.current) atmosphereMaterialRef.current.dispose()
      if (colorMap) colorMap.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [colorMap])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    isDragging.current = true
    previousMouseX.current = e.clientX
    document.body.style.cursor = 'grabbing'
    e.target.setPointerCapture(e.pointerId)
    if (meshRef.current) {
      targetRotation.current = meshRef.current.rotation.y
      lastTargetRotation.current = meshRef.current.rotation.y
    }
  }

  const handlePointerUp = (e) => {
    isDragging.current = false
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
  }

  const handlePointerOver = () => {
    if (!isDragging.current) document.body.style.cursor = 'grab'
  }

  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    e.stopPropagation()
    const deltaX = e.clientX - previousMouseX.current
    previousMouseX.current = e.clientX
    targetRotation.current += deltaX * 0.008
  }

  useFrame((_, delta) => {
    if (!meshRef.current || !cloudsRef.current) return

    if (isDragging.current) {
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }

    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 12 * delta
    cloudsRef.current.rotation.y -= currentSpeed.current * 0.4 * delta

    if (textRef.current) {
      let opacity = 0
      if (camera.position.z <= -155) {
        opacity = (-155 - camera.position.z) / 15
        opacity = Math.max(0, Math.min(1, opacity))
      }
      textRef.current.style.opacity = opacity
      textRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry ref={geometryRef} args={[7, 64, 64]} />
        <meshStandardMaterial ref={materialRef} map={colorMap} roughness={0.7} metalness={0.0} />

        <mesh ref={cloudsRef} scale={1.015}>
          <sphereGeometry args={[7, 32, 32]} />
          <meshStandardMaterial 
            ref={atmosphereMaterialRef}
            map={colorMap} 
            transparent 
            opacity={0.25} 
            blending={THREE.AdditiveBlending} 
            roughness={1} 
            depthWrite={false}
          />
        </mesh>
      </mesh>

      {/* CORRECTION : distanceFactor=30 (2x plus grand) et position X=16 pour ne pas cacher la planète */}
      <Html position={[16, 2, 5]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          className="w-[850px] opacity-0 bg-black/85 p-12 rounded-3xl border border-amber-600/30 backdrop-blur-lg transition-opacity duration-100 shadow-2xl shadow-amber-950/20"
        >
          <h1 className="text-5xl font-black text-amber-400 tracking-wide mb-3 uppercase">
            Ingénierie DevOps & Cloud
          </h1>
          <h2 className="text-sm font-semibold text-amber-600/80 uppercase tracking-widest mb-8">
            Maturité Systémique · 2025 – 2026
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed mb-8 border-l-4 border-amber-500/40 pl-5 italic">
            Un système qui ne tombe pas en panne n'a pas été suffisamment
stressé. Je conçois des infrastructures Cloud qui transforment
la panne d'une éventualité en une anomalie tracée, contenue,
et corrigée avant que l'utilisateur ne la ressente.          </p>

          <div className="space-y-6">
            <div className="bg-amber-950/20 p-6 rounded-xl border border-amber-500/10">
              <span className="text-sm font-bold text-amber-500 uppercase tracking-wider block mb-2">
                🔬 Projet Majeur : Observability & Resilience Lab
              </span>
              <p className="text-base text-gray-400 leading-relaxed m-0">
                Infrastructure de supervision prédictive pour applications
conteneurisées à fort trafic — zéro alerte silencieuse,
zéro incident non qualifié.
              </p>
            </div>

            <ul className="space-y-4 m-0 p-0 list-none">
              <li className="text-lg text-gray-300 flex items-start">
                <span className="text-amber-500 mr-3 mt-1 text-xs">◆</span>
                <span><strong className="text-white"> Conteneurisation avancée :</strong> Gestion du cycle de vie complet d'écosystèmes distribués
multi-services (React / Node.js) en environnement isolé.</span>
              </li>
              <li className="text-lg text-gray-300 flex items-start">
                <span className="text-amber-500 mr-3 mt-1 text-xs">◆</span>
                <span><strong className="text-white">Supervision Proactive :</strong> Collecte télémétriques asynchrone — métriques système,
latence applicative, saturation des ressources. </span>
              </li>
              <li className="text-lg text-gray-300 flex items-start">
                <span className="text-amber-500 mr-3 mt-1 text-xs">◆</span>
                <span><strong className="text-white">Résilience & Incident Response :</strong> Dashboards de santé temps réel, chaos testing, routage
d'alertes critiques vers les cellules SRE avec contexte enrichi.</span>
              </li>
            </ul>

            <div className="pt-5 border-t border-gray-800 flex flex-wrap gap-3 text-xs font-mono text-amber-300/90">
              <span className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Docker</span>
              <span className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Prometheus</span>
              <span className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Grafana</span>
              <span className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Alertmanager</span>
              <span className="bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Slack API</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}