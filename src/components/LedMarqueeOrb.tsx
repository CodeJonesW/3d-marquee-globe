import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LedMarqueeOrbProps {
  word: string
  speed?: number
  radius?: number
  ledSpacing?: number
}

export default function LedMarqueeOrb({
  word = 'ROADHERO',
  speed = 0.05,
  radius = 1,
  ledSpacing = 0.03,
}: LedMarqueeOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const scrollOffsetRef = useRef(0)

  // Create LED texture from word text
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Set canvas size - wider to allow seamless wrapping
    const width = 2048
    const height = 256
    canvas.width = width
    canvas.height = height

    // Fill with black background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    // Configure text style for LED matrix look
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 120px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw the word multiple times for seamless wrapping
    const textWidth = ctx.measureText(word).width
    const spacing = textWidth + 200 // Space between repetitions
    const repetitions = Math.ceil(width / spacing) + 2

    for (let i = -1; i < repetitions; i++) {
      const x = width / 2 + i * spacing
      ctx.fillText(word, x, height / 2)
    }

    // Convert to texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true

    return texture
  }, [word])

  // Shader material for LED effect
  const material = useMemo(() => {
    if (!texture) return null

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uScrollOffset: { value: 0 },
        uLedSpacing: { value: ledSpacing },
        uRadius: { value: radius },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uScrollOffset;
        uniform float uLedSpacing;
        uniform float uRadius;
        uniform float uTime;
        
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        void main() {
          // Convert world position to spherical coordinates
          vec3 pos = normalize(vWorldPosition);
          float latitude = asin(pos.y); // -PI/2 to PI/2 (south pole to north pole)
          float longitude = atan(pos.z, pos.x); // -PI to PI
          float normalizedLongitude = (longitude + 3.14159) / (2.0 * 3.14159); // 0 to 1
          
          // Calculate distance from equator (latitude 0) for row detection
          // Latitude 0 = equator, which is our center row
          float latitudeDistance = abs(latitude); // Distance from equator
          
          // Middle three rows: we want approximately 3 rows around the equator
          // Convert latitude to a row-based threshold
          // Each row is roughly uLedSpacing in normalized space
          // For 3 rows, we want about 1.5 * row spacing from center
          float rowThreshold = 0.15; // Approximately 3 rows worth (adjustable)
          bool isInMessageRows = latitudeDistance <= rowThreshold;
          
          // Quantize UVs into LED grid for dot matrix effect
          float gridSize = 1.0 / uLedSpacing;
          vec2 gridUv = floor(vUv * gridSize) / gridSize;
          vec2 gridCenter = gridUv + vec2(uLedSpacing * 0.5);
          vec2 distFromCenter = abs(vUv - gridCenter);
          float maxDist = uLedSpacing * 0.2; // Smaller bulbs for denser grid
          
          // Create circular LED dots
          float dist = length(distFromCenter);
          float ledShape = smoothstep(maxDist, maxDist * 0.7, dist);
          
          // Sample texture only for middle rows to determine if text is present
          float textMask = 0.0;
          if (isInMessageRows) {
            // Apply scrolling offset for horizontal marquee
            float scrolledU = mod(normalizedLongitude + uScrollOffset, 1.0);
            vec4 texColor = texture2D(uTexture, vec2(scrolledU, 0.5));
            textMask = step(0.1, texColor.r);
          }
          
          // Always show LED bulbs across the entire globe
          // ledShape determines the circular LED bulb shape (0 = black space, 1 = center of bulb)
          
          // Dim LED color for all bulbs
          vec3 dimLedColor = vec3(0.1, 0.15, 0.1); // Dim green
          
          // Bright LED color for message bulbs
          vec3 brightLedColor = vec3(0.0, 1.0, 0.3); // Bright green
          
          // Mix between dim and bright based on text mask
          vec3 ledColor = mix(dimLedColor, brightLedColor, textMask);
          
          // Apply LED shape - this creates the circular bulbs with black space between
          vec3 finalColor = mix(
            vec3(0.0, 0.0, 0.0), // Black space between bulbs
            ledColor,             // LED color (dim or bright)
            ledShape
          );
          
          // Add emissive glow for bright message LEDs
          float emissive = textMask * ledShape * 1.5;
          
          gl_FragColor = vec4(finalColor + vec3(emissive * 0.2), 1.0);
        }
      `,
    })
  }, [texture, ledSpacing, radius])

  // Update scroll offset (no rotation)
  useFrame((state: any, delta: number) => {
    if (meshRef.current) {
      // Update scroll offset for marquee effect
      scrollOffsetRef.current += delta * speed
      if (scrollOffsetRef.current >= 1.0) {
        scrollOffsetRef.current -= 1.0
      }
      
      // Update shader uniform
      if (material && 'uniforms' in material) {
        material.uniforms.uScrollOffset.value = scrollOffsetRef.current
        material.uniforms.uTime.value = state.clock.elapsedTime
      }
    }
  })

  // Update texture when word changes
  useEffect(() => {
    if (texture && material && 'uniforms' in material) {
      material.uniforms.uTexture.value = texture
      material.needsUpdate = true
    }
  }, [texture, material])

  if (!material) return null

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  )
}

