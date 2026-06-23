'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function PlanetMars({ position = [0, 0, -120] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  
  // DEUX références pour nos deux cartes éclatées
  const textRef1 = useRef()
  const textRef2 = useRef()
  
  const { camera } = useThree()

  const [colorMap] = useTexture(['/textures/mars_color.webp'])

  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
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
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 15 * delta

    // LOGIQUE D'APPARITION : Apparaît après avoir dépassé la Terre (z = -90)
    let opacity = 0
    if (camera.position.z <= -95) {
      opacity = (-95 - camera.position.z) / 10
      opacity = Math.max(0, Math.min(1, opacity))
    }

    // On applique l'opacité aux DEUX cartes
    if (textRef1.current) {
      textRef1.current.style.opacity = opacity
      textRef1.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
    if (textRef2.current) {
      textRef2.current.style.opacity = opacity
      textRef2.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
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
        <sphereGeometry ref={geometryRef} args={[1.8, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          roughness={0.9} // Mars est très rocailleuse et sèche
          metalness={0.1}
        />
      </mesh>

      {/* CARTE 1 : En haut à gauche (La Vision & Le Lien) */}
      <Html position={[-3, 1.5, 2]} center distanceFactor={15} zIndexRange={[100, 0]}>
        <div 
          ref={textRef1}
          className="w-[320px] opacity-0 bg-black/80 p-5 rounded-xl border border-red-500/40 backdrop-blur-md transition-opacity duration-75"
        >
          <h1 className="text-xl font-bold text-red-400 mb-1">Fondateur, pas seulement Développeur</h1>
          <h2 className="text-sm text-gray-400 mb-3">2025 – Présent · Atifelt</h2>
          
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            J'ai créé Atifelt pour une raison simple : trop d'entreprises subissent leur stack technique au lieu de la piloter. Je traduis les enjeux métier en décisions d'architecture — puis je construis.
          </p>

          <a 
            href="https://atifelt.fr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block w-full text-center bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Voir atifelt.fr →
          </a>
        </div>
      </Html>

      {/* CARTE 2 : En bas à droite (L'Expertise Technique) */}
      <Html position={[3.5, -1, 2]} center distanceFactor={15} zIndexRange={[100, 0]}>
        <div 
          ref={textRef2}
          className="w-[380px] opacity-0 bg-black/80 p-5 rounded-xl border border-orange-500/30 backdrop-blur-md transition-opacity duration-75"
        >
          <h2 className="text-lg font-bold text-orange-400 mb-3">Ce que je construis pour mes clients</h2>
          
          <ul className="space-y-3 m-0 p-0 list-none">
            <li className="text-sm text-gray-300 flex items-start">
              <span className="mr-2">🚀</span>
              <span><strong className="text-white">Développement Sur-Mesure :</strong> Pas de templates. Des solutions pensées pour le contexte exact du client,
de l'audit initial à la mise en production.</span>
            </li>
            <li className="text-sm text-gray-300 flex items-start">
              <span className="mr-2">🛠️</span>
              <span><strong className="text-white"> Audit & Dette Technique  :</strong> Diagnostic complet de l'existant, identification des points de rupture,
plan de refonte priorisé par impact business.</span>
            </li>
            <li className="text-sm text-gray-300 flex items-start">
              <span className="mr-2">📈</span>
              <span><strong className="text-white">Croissance & SEO </strong> Mise en place d'une stratégie d'acquisition durable — Analytics,
veille concurrentielle, optimisation de la conversion.</span>
            </li>
          </ul>
        </div>
      </Html>
    </group>
  )
}