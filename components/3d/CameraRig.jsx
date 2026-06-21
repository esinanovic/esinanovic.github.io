// ============================================================
// components/3d/CameraRig.jsx
// Rôle : Orchestration GSAP du mouvement de caméra sur l'axe Z
// Dépendances : @react-three/fiber, gsap, three
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Enregistrement du plugin GSAP
gsap.registerPlugin(ScrollTrigger)

export default function CameraRig() {
  const { camera } = useThree()
  
  // Proxy pour animer la cible de la caméra (LookAt) via GSAP
  const targetProxy = useRef({ x: 0, y: 0, z: 0 })
  
  // Vecteur réutilisable pour le useFrame (Loi Zéro-Allocation)
  const lookAtVec = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    // Position initiale stricte
    camera.position.set(0, 0, 15)
    targetProxy.current = { x: 0, y: 0, z: 0 }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, // Amortissement soyeux de 1.5s
        }
      })

      // La timeline est construite sur 100 unités de temps (représentant 0 à 100% du scroll)
      
      // SECTION 0 -> 1 (0% à 15%) : Dépasse le Soleil, approche Mercure
      tl.to(camera.position, { x: -4, y: 1, z: -15, duration: 15, ease: "none" }, 0)
        .to(targetProxy.current, { x: 0, y: 0, z: -30, duration: 15, ease: "none" }, 0)

      // SECTION 1 -> 2 (15% à 30%) : Dépasse Mercure, approche Vénus
      tl.to(camera.position, { x: 4, y: -1, z: -45, duration: 15, ease: "none" }, 15)
        .to(targetProxy.current, { x: 0, y: 0, z: -60, duration: 15, ease: "none" }, 15)

      // SECTION 2 -> 3 (30% à 45%) : Dépasse Vénus, approche Terre
      tl.to(camera.position, { x: -5, y: 2, z: -75, duration: 15, ease: "none" }, 30)
        .to(targetProxy.current, { x: 0, y: 0, z: -90, duration: 15, ease: "none" }, 30)

      // SECTION 3 -> 4 (45% à 60%) : Dépasse Terre, approche Mars
      tl.to(camera.position, { x: 5, y: -2, z: -105, duration: 15, ease: "none" }, 45)
        .to(targetProxy.current, { x: 0, y: 0, z: -120, duration: 15, ease: "none" }, 45)

      // SECTION 4 -> 5 (60% à 75%) : Dépasse Mars, approche Jupiter
      tl.to(camera.position, { x: -8, y: 3, z: -135, duration: 15, ease: "none" }, 60)
        .to(targetProxy.current, { x: 0, y: 0, z: -160, duration: 15, ease: "none" }, 60)

      // SECTION 5 -> 6 (75% à 90%) : Dépasse Jupiter, approche Saturne
      tl.to(camera.position, { x: 6, y: 1, z: -180, duration: 15, ease: "none" }, 75)
        .to(targetProxy.current, { x: 0, y: 0, z: -210, duration: 15, ease: "none" }, 75)

      // SECTION 6 FINALE (90% à 100%) : Décélération face à Saturne
      tl.to(camera.position, { x: 6, y: 1, z: -200, duration: 10, ease: "power2.out" }, 90)
        .to(targetProxy.current, { x: 0, y: 0, z: -210, duration: 10, ease: "power2.out" }, 90)
    })

    // NETTOYAGE GSAP OBLIGATOIRE
    return () => ctx.revert()
  }, [camera])

  // BOUCLE DE RENDU : Mise à jour de la cible de la caméra sans allocation mémoire
  useFrame(() => {
    lookAtVec.current.set(
      targetProxy.current.x,
      targetProxy.current.y,
      targetProxy.current.z
    )
    camera.lookAt(lookAtVec.current)
  })

  return null // Ce composant ne rend rien visuellement, il contrôle la logique
}