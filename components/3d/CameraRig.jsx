// ============================================================
// components/3d/CameraRig.jsx
// Timeline étendue à Neptune — Total : 515 unités
// Vitesse constante : duration proportionnelle à la distance Z
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CameraRig() {
  const { camera } = useThree()
  const targetProxy = useRef({ x: 0, y: 0, z: 0 })
  const lookAtVec = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    camera.position.set(0, 0, 15)
    targetProxy.current = { x: 0, y: 0, z: 0 }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        }
      })

      // sec1 — Soleil → Mercure (z: -30, dist: 30)
      tl.to(camera.position,    { x: -4, y: 1,  z: -15,  duration: 30, ease: "none" }, "sec1")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -30,  duration: 30, ease: "none" }, "sec1")

      // sec2 — Mercure → Vénus (z: -60, dist: 30)
      tl.to(camera.position,    { x: 4,  y: -1, z: -45,  duration: 30, ease: "none" }, "sec2")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -60,  duration: 30, ease: "none" }, "sec2")

      // sec3 — Vénus → Terre (dist: 30)
      tl.to(camera.position,    { x: -5, y: 2,  z: -75,  duration: 30, ease: "none" }, "sec3")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -90,  duration: 30, ease: "none" }, "sec3")

      // sec4 — Terre → Mars (dist: 30)
      tl.to(camera.position,    { x: 5,  y: -2, z: -105, duration: 30, ease: "none" }, "sec4")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -120, duration: 30, ease: "none" }, "sec4")

      // sec5 — Mars → Jupiter (dist: 70)
      tl.to(camera.position,    { x: -18, y: 4, z: -175, duration: 70, ease: "none" }, "sec5")
        .to(targetProxy.current, { x: 0,   y: 0, z: -200, duration: 70, ease: "none" }, "sec5")

      // sec6 — Jupiter → Saturne (dist: 100)
      tl.to(camera.position,    { x: 14, y: 2,  z: -275, duration: 100, ease: "none" }, "sec6")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -300, duration: 100, ease: "none" }, "sec6")

      // sec7 — Saturne → Uranus (dist: 85)
      tl.to(camera.position,    { x: -8, y: -1, z: -360, duration: 85, ease: "none" }, "sec7")
        .to(targetProxy.current, { x: 0,  y: 0,  z: -380, duration: 85, ease: "none" }, "sec7")

      // sec8 — Uranus → ceinture d'astéroïdes (dist: 60)
      tl.to(camera.position,    { x: 0, y: 0, z: -420, duration: 60, ease: "none" }, "sec8")
        .to(targetProxy.current, { x: 0, y: 0, z: -440, duration: 60, ease: "none" }, "sec8")

      // sec9 — Ceinture → Neptune (z: -480, dist: 80) — NOUVEAU
      // Approche par la droite pour alterner avec Uranus qui était à gauche
      tl.to(camera.position,    { x: 12, y: 2, z: -465, duration: 80, ease: "power2.out" }, "sec9")
        .to(targetProxy.current, { x: 0,  y: 0, z: -480, duration: 80, ease: "power2.out" }, "sec9")
    })

    return () => ctx.revert()
  }, [camera])

  useFrame(() => {
    lookAtVec.current.set(
      targetProxy.current.x,
      targetProxy.current.y,
      targetProxy.current.z
    )
    camera.lookAt(lookAtVec.current)
  })

  return null
}