// ============================================================
// components/3d/PlanetMercury.jsx
// Rôle : Section 1 - Les Fondations Backend (2021-2022)
// Dépendances : @react-three/fiber, @react-three/drei, three
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function PlanetMercury({ position = [0, 0, -30] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()

  const [colorMap] = useTexture(['/textures/mercury_color.webp'])

  // --- ÉTATS POUR L'INTERACTIVITÉ (Identique au Soleil) ---
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.1)
  const baseSpeed = 0.1

  // NETTOYAGE MÉMOIRE OBLIGATOIRE
  useEffect(() => {
    return () => {
      if (geometryRef.current) geometryRef.current.dispose()
      if (materialRef.current) materialRef.current.dispose()
      if (colorMap) colorMap.dispose()
      document.body.style.cursor = 'auto'
    }
  }, [colorMap])

  // --- GESTIONNAIRES D'ÉVÉNEMENTS SOURIS ---
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

  // --- BOUCLE DE RENDU (Inertie) ---
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

    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 15 * delta
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
        {/* Mercure est plus petite que le Soleil (rayon 1.5) */}
        <sphereGeometry ref={geometryRef} args={[1.5, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          roughness={0.8} // Planète rocheuse
          metalness={0.2}
        />
      </mesh>

      {/* TEXTE FLOTTANT 3D - Placé à droite (x=3) */}
      <Html
        position={[3, 0, 2]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }} 
      >
        <div style={{ 
          color: 'white', 
          width: '350px', 
          background: 'rgba(10, 10, 10, 0.8)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(150, 150, 150, 0.5)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'sans-serif',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#fff' }}>
            Les Fondations Backend
          </h1>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#aaa' }}>
            2021 - 2022
          </h2>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#4da6ff' }}>Library REST API</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', lineHeight: '1.4', color: '#ddd' }}>
              Conception d'une API REST scalable et maintenable. Gestion des relations complexes (One-to-Many, Many-to-Many) et application stricte des bonnes pratiques (handlers séparés).
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
              Stack : Node.js, TypeScript, Prisma
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}