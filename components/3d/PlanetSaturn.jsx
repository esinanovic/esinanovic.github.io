'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function PlanetSaturn({ position = [0, 0, -300] }) {
  const planetRef = useRef()
  const ringsRef = useRef()
  const ringsGeometryRef = useRef()
  const textRef = useRef()
  const { camera } = useThree()

  const [saturnColor, saturnRings] = useTexture([
    '/textures/saturn_color.webp',
    '/textures/saturn_rings.webp'
  ])

  const saturnRadius = 3.8
  const innerRadius = 7.5
  const outerRadius = 9.8

  // --- ÉTATS POUR L'INTERACTIVITÉ ---
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.12)
  const baseSpeed = 0.12

  // 1. UV Mapping pour les anneaux
  useEffect(() => {
    if (ringsGeometryRef.current) {
      const geometry = ringsGeometryRef.current
      const pos = geometry.attributes.position
      const uv = geometry.attributes.uv
      const v3 = new THREE.Vector3()

      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i)
        const currentRadius = v3.length()
        const u = (currentRadius - innerRadius) / (outerRadius - innerRadius)
        uv.setXY(i, u, 0.5)
      }
      uv.needsUpdate = true
    }
  }, [])

  // 2. Nettoyage mémoire
  useEffect(() => {
    return () => {
      if (ringsGeometryRef.current) ringsGeometryRef.current.dispose()
      if (saturnColor) saturnColor.dispose()
      if (saturnRings) saturnRings.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [saturnColor, saturnRings])

  // --- GESTIONNAIRES D'ÉVÉNEMENTS SOURIS ---
  const handlePointerDown = (e) => {
    e.stopPropagation()
    isDragging.current = true
    previousMouseX.current = e.clientX
    document.body.style.cursor = 'grabbing'
    e.target.setPointerCapture(e.pointerId)
    if (planetRef.current) {
      targetRotation.current = planetRef.current.rotation.y
      lastTargetRotation.current = planetRef.current.rotation.y
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
    if (!planetRef.current) return

    // INERTIE SUR LA PLANÈTE
    if (isDragging.current) {
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }
    planetRef.current.rotation.y += (targetRotation.current - planetRef.current.rotation.y) * 10 * delta

    // LES ANNEAUX TOURNENT TOUT SEULS (Indépendants de la souris)
    if (ringsRef.current) ringsRef.current.rotation.z -= delta * 0.05

    // APPARITION DU TEXTE
    if (textRef.current) {
      let opacity = 0
      if (camera.position.z <= -200) {
        opacity = (-200 - camera.position.z) / 50 
        opacity = Math.max(0, Math.min(1, opacity))
      }
      textRef.current.style.opacity = opacity
      textRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
  })

  return (
    <group position={position}>
      {/* LA PLANÈTE (Reçoit les clics) */}
      <mesh 
        ref={planetRef} 
        rotation={[0.2, 0, 0.4]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry args={[saturnRadius, 64, 64]} />
        <meshStandardMaterial map={saturnColor} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* LES ANNEAUX (Ne reçoivent pas les clics) */}
      <mesh ref={ringsRef} rotation={[Math.PI / 2.3, 0.2, 0]}>
        <ringGeometry ref={ringsGeometryRef} args={[innerRadius, outerRadius, 128]} />
        <meshStandardMaterial 
          map={saturnRings} 
          transparent={true} 
          opacity={0.85} 
          side={THREE.DoubleSide} 
          roughness={0.6} 
        />
      </mesh>

      {/* CARTE HTML : distanceFactor=45 (Énorme) et position X=-24 */}
      <Html position={[-24, 2, 5]} center distanceFactor={45} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          className="w-[650px] opacity-0 bg-black/85 p-10 rounded-3xl border border-yellow-700/40 backdrop-blur-xl shadow-2xl transition-opacity duration-100"
        >
          <span className="text-sm uppercase tracking-[0.2em] text-yellow-500 font-bold block mb-2">
            Juin 2026 — Présent
          </span>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
            Infrastructure Physique & Continuité de Service
          </h2>
          <p className="text-lg text-gray-400 mb-6 leading-relaxed">
            L'infrastructure invisible qui fait tourner tout le reste.
Gestion de parc, sécurisation des données, et support utilisateur
dans un environnement où la continuité est non négociable.
          </p>

          <hr className="border-gray-800 my-6" />

          <h3 className="text-xl font-bold text-white mb-5 flex items-center flex-wrap gap-2">
            Technicien Support & Infra
            <span className="text-yellow-500 font-normal">@ École Eyyub Sultan</span>
            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded ml-2">Stage</span>
          </h3>

          <ul className="space-y-4 m-0 p-0 list-none">
            <li className="text-base text-gray-300 flex items-start">
              <span className="text-yellow-500 mr-3 mt-1">●</span>
              <span>Gestion du support Helpdesk et administration du système de tickets pour garantir la continuité pédagogique.</span>
            </li>
            <li className="text-base text-gray-300 flex items-start">
              <span className="text-yellow-500 mr-3 mt-1">●</span>
              <span>Assistance technique directe auprès des utilisateurs pour la résolution d'incidents matériels et logiciels.</span>
            </li>
            <li className="text-base text-gray-300 flex items-start">
              <span className="text-yellow-500 mr-3 mt-1">●</span>
              <span>Conception et déploiement d'une politique de sauvegarde globale (Backup) pour assurer l'intégrité des données critiques.</span>
            </li>
          </ul>
        </div>
      </Html>
    </group>
  )
}