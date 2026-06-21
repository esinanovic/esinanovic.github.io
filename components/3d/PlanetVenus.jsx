// ============================================================
// components/3d/PlanetVenus.jsx
// Rôle : Section 2 - Projets Logiciels & Équipe (2021-2022)
// Dépendances : @react-three/fiber, @react-three/drei, three
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function PlanetVenus({ position = [0, 0, -60] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()

  const [colorMap] = useTexture(['/textures/venus_color.webp'])

  // --- ÉTATS POUR L'INTERACTIVITÉ ---
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
        {/* Vénus est légèrement plus grande que Mercure (rayon 1.8) */}
        <sphereGeometry ref={geometryRef} args={[1.8, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          roughness={0.6} // Atmosphère plus lisse
          metalness={0.1}
        />
      </mesh>

      {/* TEXTE FLOTTANT 3D - Placé à gauche (x=-3.5) pour alterner avec Mercure */}
      <Html
        position={[-3.5, 0, 2]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }} 
      >
        <div style={{ 
          color: 'white', 
          width: '380px', 
          background: 'rgba(10, 10, 10, 0.8)', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 200, 100, 0.4)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'sans-serif',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#ffcc66' }}>
            Projets Logiciels & Équipe
          </h1>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#aaa' }}>
            2021 - 2022
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#fff' }}>Climate Simulator (Python)</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', lineHeight: '1.4', color: '#ddd' }}>
              Développement en équipe d'un jeu sérieux pour sensibiliser à l'adaptation agricole face au changement climatique.
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#fff' }}>Juego de Calamar</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', lineHeight: '1.4', color: '#ddd' }}>
              Création d'une application éducative gamifiée pour l'apprentissage de l'espagnol.
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>Logiciel d'information</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', lineHeight: '1.4', color: '#ddd' }}>
              Chef de projet sur le développement d'un outil de centralisation et d'affichage dynamique des actualités pour le Lycée Marcel Rudloff.
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}