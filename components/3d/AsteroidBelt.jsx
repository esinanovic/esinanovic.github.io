// ============================================================
// components/3d/AsteroidBelt.jsx
// Rôle : Barrage horizontal d'astéroïdes étalé à l'infini (Ruban)
//        avec profondeur solide (True depth sorting) et 3 textures uniques.
// Dépendances : @react-three/fiber, @react-three/drei, three
// ============================================================
'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// SHADERS ULTRA-PERFORMANTS MODIFIÉS POUR LA PROFONDEUR
const vertexShader = `
  uniform float uTime;
  uniform float uBeltWidth;
  uniform float uBeltHeight;
  attribute float aSize;
  attribute float aRotationAngle;
  attribute float aRotationSpeed;
  varying float vRotation;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Ajustement de la taille avec l'éloignement de la caméra
    gl_PointSize = aSize * (400.0 / -mvPosition.z); // On augmente un peu le multiplicateur de taille pour compenser la finesse

    // Calcul de la rotation individuelle au fil du temps
    vRotation = aRotationAngle + uTime * aRotationSpeed;

    // ON SUPPRIME LE FADE DE TRANSITION DOUCE car le ruban est infini
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying float vRotation;

  // Fonction magique pour faire tourner le sprite 2D sur lui-même
  vec2 rotateUV(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    uv -= 0.5;
    vec2 r;
    r.x = uv.x * c - uv.y * s;
    r.y = uv.x * s + uv.y * c;
    return r + 0.5;
  }

  void main() {
    vec2 rotatedUV = rotateUV(gl_PointCoord, vRotation);
    vec4 texColor = texture2D(uTexture, rotatedUV);
    
    // CRITIQUE : Découpe nette et profonde du fond transparent.
    // alphaTest: 0.5 est critique ici. Si le pixel est plus de 50% transparent,
    // on l'ignore totalement et on ne l'écrit pas dans le tampon de profondeur.
    if (texColor.a < 0.5) discard; 
    
    gl_FragColor = texColor; // On utilise la couleur naturelle
  }
`;

// SOUS-COMPOSANT : Gère un groupe d'astéroïdes pour UNE texture donnée
function AsteroidGroup({ texture, count, width, height, depth, baseSize }) {
  const pointsRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()

  useEffect(() => {
    const geometry = new THREE.BufferGeometry()
    geometryRef.current = geometry

    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const rotationAngles = new Float32Array(count)
    const rotationSpeeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 1. Positionnement dans le pavé ultra-étalé et fin
      const x = (Math.random() - 0.5) * width
      const y = (Math.random() - 0.5) * height // Hauteur très faible
      const z = (Math.random() - 0.5) * depth

      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // 2. LOGIQUE DE TAILLE DU GRAIN : Variété totale (pas de falloff au centre)
      // Car nous sommes dans une ligne infinie, pas un mur contained.
      sizes[i] = (Math.random() * 0.8 + 0.3) * baseSize

      // 3. Rotations de départ et vitesses de rotation aléatoires
      rotationAngles[i] = Math.random() * Math.PI * 2
      rotationSpeeds[i] = (Math.random() - 0.5) * 0.8 // Sens horaire ou anti-horaire
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aRotationAngle', new THREE.BufferAttribute(rotationAngles, 1))
    geometry.setAttribute('aRotationSpeed', new THREE.BufferAttribute(rotationSpeeds, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uBeltWidth: { value: width },
        uBeltHeight: { value: height }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // Nécessaire pour les bords du WebP
      
      // CRITIQUE : LE CORRECTIF DE PROFONDEUR S'APPLIQUE ICI
      blending: THREE.NormalBlending, // Cailloux solides et opaques
      depthWrite: true,  // Forcer Three.js à écrire dans le depth buffer pour chaque point
      depthTest: true,   // Forcer Three.js à tester la profondeur
    })
    materialRef.current = material

    if (pointsRef.current) {
      pointsRef.current.geometry = geometry
      pointsRef.current.material = material
    }

    return () => {
      if (geometryRef.current) geometryRef.current.dispose()
      if (materialRef.current) materialRef.current.dispose()
    }
  }, [texture, count, width, height, depth, baseSize])

  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.material.uniforms) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return <points ref={pointsRef} />
}

// COMPOSANT PRINCIPAL
export default function AsteroidBelt({ position = [0, 0, -150] }) {
  // Chargement simultané de tes 3 futurs cailloux détourés
  const [tex1, tex2, tex3] = useTexture([
    '/textures/asteroid1.webp',
    '/textures/asteroid2.webp',
    '/textures/asteroid3.webp'
  ])

  useEffect(() => {
    return () => {
      if (tex1) tex1.dispose()
      if (tex2) tex2.dispose()
      if (tex3) tex3.dispose()
    }
  }, [tex1, tex2, tex3])

  // ==========================================
  // CONFIGURATION DU RUBAN INFINI
  // ==========================================
  const config = {
    // Largeur massive pour étaler de gauche à droite sur tout l'écran
    width: 600,   // (Avant 170)
    // Hauteur très faible pour créer un "ruban" ou une "lame" fine
    height: 10,   // (Avant 45)
    depth: 25,    // Épaisseur en profondeur cinématique
    // On augmente un peu le nombre pour maintenir une densité correcte sur l'envergure
    totalCountPerGroup: 2000 // 2000 * 3 = 6000 astéroïdes au total
  }

  return (
    <group position={position}>
      {/* Texture 1 : Les cailloux de taille moyenne standard */}
      <AsteroidGroup texture={tex1} count={config.totalCountPerGroup} {...config} baseSize={1.2} />
      
      {/* Texture 2 : Configuré pour être globalement un peu plus massif */}
      <AsteroidGroup texture={tex2} count={config.totalCountPerGroup} {...config} baseSize={1.6} />
      
      {/* Texture 3 : Configuré pour faire les débris plus fins */}
      <AsteroidGroup texture={tex3} count={config.totalCountPerGroup} {...config} baseSize={0.8} />
    </group>
  )
}