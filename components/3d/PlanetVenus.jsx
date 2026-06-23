'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function PlanetVenus({ position = [0, 0, -60] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  const textRef = useRef()
  const { camera } = useThree()

  const [colorMap] = useTexture(['/textures/venus_color.webp'])

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

    // 1. Inertie de rotation
    if (isDragging.current) {
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 15 * delta

    // 2. NOUVELLE LOGIQUE D'APPARITION (Basée sur l'axe Z de la caméra)
    if (textRef.current) {
      // La caméra avance vers les Z négatifs.
      // Mercure est à -30. On commence à afficher Vénus quand la caméra dépasse -35.
      // L'opacité passe de 0 à 1 entre z = -35 et z = -45.
      let opacity = 0
      if (camera.position.z <= -35) {
        opacity = (-35 - camera.position.z) / 10 // Calcul du fondu sur 10 unités de distance
        opacity = Math.max(0, Math.min(1, opacity)) // Bloque la valeur entre 0 et 1
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
        <sphereGeometry ref={geometryRef} args={[2, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      <Html position={[-3.5, 0, 2]} center distanceFactor={15} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          // J'ai mis opacity-0 par défaut pour qu'il soit invisible au tout premier chargement
          className="w-[380px] opacity-0 bg-black/80 p-5 rounded-xl border border-yellow-500/40 backdrop-blur-md transition-opacity duration-75"
        >
          <h1 className="text-xl font-bold text-yellow-400 mb-1">Du Code qui a un Impact</h1>
          <h2 className="text-sm text-gray-400 mb-4">2021 – 2022 · Travail d'équipe & Livraisons réelles</h2>
          
          <div className="mb-3">
            <strong className="text-white">Climate Simulator</strong>
            <p className="text-sm text-gray-300 leading-relaxed mt-1 m-0">
              Développement Python en équipe agile d'un jeu sérieux destiné à la sensibilisation climatique agricole — de la modélisation de données à la livraison d'un produit fonctionnel.
            </p>
          </div>

          <div className="mb-3">
            <strong className="text-white">Juego de Calamar</strong>
            <p className="text-sm text-gray-300 leading-relaxed mt-1 m-0">
              Application éducative gamifiée pour l'apprentissage de l'espagnol. Premier exercice d'UX : concevoir pour un public non-technique.
            </p>
          </div>

          <div>
            <strong className="text-white">Logiciel d'information</strong>
            <p className="text-sm text-gray-300 leading-relaxed mt-1 m-0">
              Chef de projet à 20 ans. Coordination d'une équipe dev, gestion du client (Lycée Marcel Rudloff), livraison d'un outil de centralisation d'actualités en production réelle.
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}