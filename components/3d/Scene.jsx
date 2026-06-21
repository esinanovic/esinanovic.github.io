'use client'

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Preload, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

// Imports préparés pour les prochaines étapes
import Sun from './Sun'
import CameraRig from './CameraRig'
import PlanetMercury from './PlanetMercury'
import PlanetVenus from './PlanetVenus'

// import PlanetEarth from './PlanetEarth'
// import PlanetMars from './PlanetMars'
// import PlanetJupiter from './PlanetJupiter'
// import PlanetSaturn from './PlanetSaturn'

export default function Scene() {
  // Gestion adaptative du Device Pixel Ratio (DPR)
  // Démarre à 1.5 pour une bonne qualité, descendra à 1 si l'appareil rame
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      dpr={dpr}
      camera={{
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [0, 0, 15] // Position initiale face au Soleil
      }}
      gl={{
        antialias: true,
        alpha: false, // Fond opaque noir : optimise grandement les performances WebGL
        powerPreference: "high-performance"
      }}
    >
      {/* 1. GARDIEN DE LA PERFORMANCE */}
      <PerformanceMonitor
        onIncline={() => setDpr(1.5)} // FPS stable -> maintient la qualité
        onDecline={() => setDpr(1)}   // Chute de FPS -> dégrade la résolution
      />

      {/* 2. LUMIÈRES GLOBALES */}
      {/* Lumière ambiante très faible pour l'espace. Le Soleil aura sa propre PointLight */}
      <ambientLight intensity={0.05} />

      {/* 3. ENVIRONNEMENT SPATIAL */}
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0} // Statique : évite de recalculer la position de 5000 particules à chaque frame
      />

      {/* 4. CHARGEMENT ASYNCHRONE DES OBJETS LOURDS */}
      <Suspense fallback={null}>
        {/* Les composants seront activés ici à la prochaine étape */}
        <Sun />
        <PlanetMercury /> 
        <PlanetVenus />
        {/* <PlanetEarth /> */}
        {/* <PlanetMars /> */}
        {/* <PlanetJupiter /> */}
        {/* <PlanetSaturn /> */}
        
        <CameraRig />
      </Suspense>

      {/* 5. POST-PROCESSING (Loi du Cheat Code) */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2} // Seuls les objets très lumineux (comme le Soleil) émettront un halo
          luminanceSmoothing={0.9}
          intensity={2.0}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>

      {/* 6. PRÉCHARGEMENT */}
      <Preload all />
    </Canvas>
  )
}