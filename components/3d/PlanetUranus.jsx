'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function PlanetUranus({ position = [0, 0, -380] }) {
  const meshRef = useRef()
  const textRef = useRef()
  const { camera } = useThree()
  
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.05)
  const baseSpeed = 0.05

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

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
    
    // Seule la planète tourne ici
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 10 * delta

    if (textRef.current) {
      let opacity = 0
      if (camera.position.z <= -310) {
        opacity = (-310 - camera.position.z) / 30
        opacity = Math.max(0, Math.min(1, opacity))
      }
      textRef.current.style.opacity = opacity
      textRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <group position={position}>
      {/* 1. LA PLANÈTE SEULE (Reçoit les événements de drag) */}
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial color="#8bd8e3" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. LES ANNEAUX VERTICAUX ET FINS (Statiques, ignorent la souris) */}
      <group rotation={[0, Math.PI / 2.5, 0]}>
        <mesh>
          <ringGeometry args={[5.2, 5.3, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[5.5, 5.7, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[6.0, 6.1, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. LA CARTE HTML */}
      <Html position={[14, 2, 5]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          className="w-[550px] opacity-0 bg-black/85 p-8 rounded-3xl border border-cyan-500/30 backdrop-blur-xl shadow-2xl transition-opacity duration-100"
        >
          <h1 className="text-4xl font-black text-cyan-400 mb-2 tracking-tight">L'ère de l'Orchestration IA</h1>
          <h2 className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-6">2026 · Micro-SaaS en construction</h2>
          
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Je ne consomme pas les APIs d'IA — je les orchestre.
Ce projet SaaS permet à des équipes métier de déployer
et piloter des agents autonomes sans écrire une ligne
de code. Le tout avec une couche d'abstraction qui rend
le switch entre OpenAI, Anthropic et open source
transparent, mesurable, et réversible.
          </p>

          <div className="bg-cyan-950/20 p-5 rounded-xl border border-cyan-500/10">
            <h3 className="text-sm font-bold text-cyan-500 uppercase mb-3">Approche Architecture</h3>
            <p className="text-base text-gray-400 mb-0 leading-relaxed">
              Utilisation de patterns <strong>Strategy & Factory</strong> pour une couche d'abstraction logicielle. Switch dynamique entre fournisseurs d'IA (OpenAI, Anthropic, Open Source) pour optimiser coût, latence et précision en temps réel.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-cyan-900/50 flex gap-3 text-xs font-mono text-cyan-400">
            <span className="bg-cyan-900/30 px-3 py-1.5 rounded border border-cyan-800/50">Next.js</span>
            <span className="bg-cyan-900/30 px-3 py-1.5 rounded border border-cyan-800/50">Supabase</span>
            <span className="bg-cyan-900/30 px-3 py-1.5 rounded border border-cyan-800/50">AI-Agents</span>
          </div>
        </div>
      </Html>
    </group>
  )
}