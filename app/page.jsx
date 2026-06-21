// ============================================================
// app/page.jsx
// Rôle : Point d'entrée, conteneur de scroll 600vh et Canvas fixe
// Dépendances : next/dynamic
// ============================================================
'use client'

import dynamic from 'next/dynamic'

// Désactivation stricte du SSR pour éviter l'erreur "window is not defined" avec Three.js
const Scene = dynamic(() => import('@/components/3d/Scene'), { ssr: false })

export default function PortfolioPage() {
  return (
    // Conteneur principal qui crée la hauteur physique pour le scroll (6 sections = 600vh)
    <div style={{ height: '600vh', backgroundColor: '#000' }} id="scroll-container">
      
      {/* Conteneur fixe qui maintient le Canvas 3D toujours visible à l'écran */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100vh', 
          zIndex: 0 
        }}
      >
        <Scene />
      </div>

      {/* 
        Les textes HTML seront gérés directement dans la scène 3D via le composant <Html> de Drei.
        Nous n'avons donc pas besoin de superposer des divs HTML ici.
      */}
    </div>
  )
}