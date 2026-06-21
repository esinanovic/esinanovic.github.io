// ============================================================
// components/3d/Sun.jsx
// Rôle : Point de départ, source de lumière globale et introduction interactive
// Dépendances : @react-three/fiber, @react-three/drei, three
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function Sun({ position = [0, 0, 0] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()

  const [colorMap] = useTexture(['/textures/sun_color.webp'])

  // --- ÉTATS POUR L'INTERACTIVITÉ ---
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  
  const targetRotation = useRef(0)
  
  // NOUVEAU : Variables pour calculer l'élan (inertie) au moment de relâcher
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.1)
  const baseSpeed = 0.1

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
      lastTargetRotation.current = meshRef.current.rotation.y // Synchronisation
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

  // --- BOUCLE DE RENDU ---
  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isDragging.current) {
      // 1. Pendant le drag : on calcule la vitesse exacte de ton mouvement
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      // 2. Quand on relâche : la vitesse actuelle rejoint doucement la vitesse de base
      // Le multiplicateur (2) gère la durée du freinage. Plus il est bas, plus le soleil glisse longtemps.
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      
      // On applique cette vitesse résiduelle à la rotation
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }

    // 3. Lerp : La rotation réelle rejoint la rotation cible de manière fluide
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 15 * delta
  })

  return (
    <group position={position}>
      <pointLight intensity={10} distance={200} decay={2} color="#ffddaa" />
      
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry ref={geometryRef} args={[4, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          emissive="#ffaa00"
          emissiveMap={colorMap}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      <Html
        position={[5, 0, 2]}
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
          border: '1px solid rgba(255, 170, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'sans-serif',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#ffaa00' }}>
            Emir Sinanovic
          </h1>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 'normal', color: '#ccc' }}>
            Développeur Full Stack, DevOps & Réseaux
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#ddd' }}>
            Fondateur d'Atifelt. Passionné par la technique et le monde de l'entreprise, je résous de vrais problèmes. De l'API robuste à l'entrepreneuriat, je construis des solutions web et des architectures modernes.
          </p>
        </div>
      </Html>
    </group>
  )
}