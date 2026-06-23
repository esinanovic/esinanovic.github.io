// ============================================================
// components/3d/Sun.jsx
// Fix bug 1 : pointer-events sur le Html géré via style inline
// synchronisé avec l'opacité pour ne jamais bloquer le mesh 3D
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'

export default function Sun({ position = [0, 0, 0] }) {
  const meshRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  const textRef = useRef()
  const htmlWrapperRef = useRef()
  const { camera } = useThree()

  const [colorMap] = useTexture(['/textures/sun_color.webp'])

  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const targetRotation = useRef(0)
  const lastTargetRotation = useRef(0)
  const currentSpeed = useRef(0.1)
  const baseSpeed = 0.1

  useEffect(() => {
    // Au montage : s'assurer que le wrapper HTML ne bloque rien
    if (htmlWrapperRef.current) {
      htmlWrapperRef.current.style.pointerEvents = 'none'
    }
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

    // Rotation avec inertie
    if (isDragging.current) {
      currentSpeed.current = (targetRotation.current - lastTargetRotation.current) / delta
      lastTargetRotation.current = targetRotation.current
    } else {
      currentSpeed.current += (baseSpeed - currentSpeed.current) * 2 * delta
      targetRotation.current += currentSpeed.current * delta
      lastTargetRotation.current = targetRotation.current
    }
    meshRef.current.rotation.y += (targetRotation.current - meshRef.current.rotation.y) * 15 * delta

    // Opacité du texte selon distance caméra
    if (textRef.current && htmlWrapperRef.current) {
      const dist = camera.position.distanceTo(meshRef.current.position)
      const opacity = Math.max(0, Math.min(1, (35 - dist) / 10))
      
      textRef.current.style.opacity = opacity

      // FIX BUG 1 : le wrapper HTML ne reçoit les pointer-events
      // QUE quand le texte est suffisamment visible (opacity > 0.5)
      // Sinon le div invisible bloque les clics sur le mesh 3D
      htmlWrapperRef.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    }
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
        <sphereGeometry ref={geometryRef} args={[6, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          emissive="#ffaa00"
          emissiveMap={colorMap}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* FIX : le ref est sur le div wrapper du Html, pas sur le div interne */}
      {/* Comme ça on contrôle pointer-events sur ce que Drei injecte dans le DOM */}
      <Html
        position={[5, 0, 2]}
        center
        distanceFactor={15}
        zIndexRange={[100, 0]}
        // style appliqué au conteneur que Drei crée dans le DOM
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={htmlWrapperRef}
          style={{ pointerEvents: 'none' }} // par défaut bloqué
        >
          <div
            ref={textRef}
            className="w-[350px] bg-black/80 p-5 rounded-xl border border-orange-500/50 backdrop-blur-md transition-opacity duration-75"
            style={{ opacity: 0 }}
          >
            <h1 className="text-2xl font-bold text-orange-400 mb-2">Emir Sinanovic</h1>
            <h2 className="text-base text-gray-300 mb-4">Développeur Full Stack, DevOps & Réseaux</h2>
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              Fondateur d'Atifelt. Passionné par la technique et le monde de l'entreprise,
              je résous de vrais problèmes. De l'API robuste à l'entrepreneuriat, je construis
              des solutions web et des architectures modernes.
            </p>
          </div>
        </div>
      </Html>
    </group>
  )
}