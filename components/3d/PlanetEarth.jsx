'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function PlanetEarth({ position = [0, 0, -90] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  const atmosphereMaterialRef = useRef() // NOUVEAU : Matériau de l'atmosphère
  const textRef = useRef()
  const { camera } = useThree()

  const [colorMap] = useTexture(['/textures/earth_color.webp'])

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

    if (textRef.current) {
      let opacity = 0
      if (camera.position.z <= -65) {
        opacity = (-65 - camera.position.z) / 10
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
        <sphereGeometry ref={geometryRef} args={[2, 64, 64]} />
        
        {/* LA TERRE (Rugosité et Métallisme appliqués) */}
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          roughness={0.6} // La terre n'est pas un miroir parfait
          metalness={0.1} // Légère réflexion sur les océans
        />

        {/* NOUVEAU : L'ATMOSPHÈRE (Une sphère légèrement plus grande, transparente) */}
        <mesh scale={1.03}>
          <sphereGeometry args={[1.8, 32, 32]} />
          <meshStandardMaterial 
            ref={atmosphereMaterialRef}
            color="#4ca6ff" 
            transparent 
            opacity={0.15} 
            roughness={1} 
            depthWrite={false} // Empêche les bugs d'affichage avec la transparence
          />
        </mesh>
      </mesh>

      <Html position={[3.5, 0, 2]} center distanceFactor={15} zIndexRange={[100, 0]}>
        <div 
          ref={textRef}
          className="w-[400px] opacity-0 bg-black/80 p-5 rounded-xl border border-blue-500/40 backdrop-blur-md transition-opacity duration-75"
        >
          <h1 className="text-xl font-bold text-blue-400 mb-1">Premier Impact en Entreprise</h1>
          <h2 className="text-sm text-gray-400 mb-4">2023 · Développeur Full Stack @ ENGLAB</h2>
          
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Premier contact avec la réalité industrielle : legacy code,contraintes de production, et zero droit à l'erreur.
          </p>

          <ul className="space-y-3 m-0 p-0 list-none">
            <li className="text-sm text-gray-300">
              <strong className="text-white">Frontend React :</strong> Refonte d'un gestionnaire de périphériques industriels — UX from scratch, composants réutilisables, état global maîtrisé.
            </li>
            <li className="text-sm text-gray-300">
              <strong className="text-white">Base de données :</strong> Architecture SQL Server couplée à des automates industriels. Des données machines qui arrivent en temps réel et ne pardonnent pas les approximations.
            </li>
            <li className="text-sm text-gray-300">
              <strong className="text-white">Backend Python :</strong> Reprise et optimisation d'une API en production. Comprendre du code qu'on n'a pas écrit, le stabiliser, l'améliorer — sans tout casser.
            </li>
          </ul>
        </div>
      </Html>
    </group>
  )
}