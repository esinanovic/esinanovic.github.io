// ============================================================
// components/3d/PlanetNeptune.jsx
// Rôle : Conclusion du portfolio, Stack Globale et Contact
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function PlanetNeptune({ position = [0, 0, -480] }) {
  const meshRef = useRef()
  const atmosphereRef = useRef()
  const textRef = useRef()
  const { camera } = useThree()
  
  const [colorMap] = useTexture(['/textures/neptune_color.webp'])

  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.06)
  const baseSpeed = 0.06

  useEffect(() => {
    return () => {
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
    targetRotation.current += deltaX * 0.01
  }

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isDragging.current) {
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }
    
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 10 * delta
    if (atmosphereRef.current) atmosphereRef.current.rotation.y -= currentSpeed.current * 0.2 * delta

    // Logique d'apparition : Commence à apparaître après la ceinture d'astéroïdes (z = -410)
    if (textRef.current) {
      let opacity = 0
      if (camera.position.z <= -410) {
        opacity = (-410 - camera.position.z) / 40
        opacity = Math.max(0, Math.min(1, opacity))
      }
      textRef.current.style.opacity = opacity
      textRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <group position={position}>
      {/* NOYAU DE NEPTUNE */}
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshStandardMaterial map={colorMap} roughness={0.4} metalness={0.1} />

        {/* ATMOSPHÈRE BLEUTÉE */}
        <mesh ref={atmosphereRef} scale={1.02}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.2} 
            blending={THREE.AdditiveBlending} 
            roughness={1} 
            depthWrite={false}
          />
        </mesh>
      </mesh>

      {/* CARTE HTML : Placée à gauche pour alterner avec Uranus */}
      <Html position={[-16, 2, 5]} center distanceFactor={35} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          className="w-[600px] opacity-0 bg-black/85 p-10 rounded-3xl border border-indigo-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-opacity duration-100"
        >
          <h1 className="text-4xl font-black text-indigo-400 mb-2 tracking-tight">Prêt pour de nouveaux défis</h1>
          <h2 className="text-sm font-semibold text-indigo-300 uppercase tracking-widest mb-8">Stack Globale & Contact</h2>
          
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            De l'architecture backend robuste à l'orchestration cloud, je construis des solutions complètes, scalables et orientées business.
          </p>

          {/* GRILLE DE COMPÉTENCES */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20">
              <h3 className="text-indigo-400 font-bold mb-2 text-sm uppercase">Développement</h3>
              <p className="text-gray-300 text-sm">React, Node.js, TypeScript, Python, Prisma</p>
            </div>
            <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20">
              <h3 className="text-indigo-400 font-bold mb-2 text-sm uppercase">Infra & DevOps</h3>
              <p className="text-gray-300 text-sm">Docker, Linux, Prometheus, Grafana, SQL Server</p>
            </div>
          </div>

          {/* BOUTONS DE CONTACT */}
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/in/emirsinanovic/" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-transparent border border-indigo-500 hover:bg-indigo-900/30 text-indigo-300 font-bold py-3 px-6 rounded-xl transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </Html>
    </group>
  )
}