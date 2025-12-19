import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LedMarqueeOrbProps {
  word: string
  speed?: number
  radius?: number
  ledSpacing?: number
  columnSpacing?: number
  dimColor?: string | THREE.Color
  brightColor?: string | THREE.Color
}

export default function LedMarqueeOrb({
  word = 'ROADHERO',
  speed = 0.05,
  radius = 1,
  ledSpacing = 0.0075,
  columnSpacing = 0.005,
  dimColor = '#1a261a',
  brightColor = '#00ff4d',
}: LedMarqueeOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const scrollOffsetRef = useRef(0)
  const matrixRef = useRef<Uint8Array | null>(null)
  const matrixRowsRef = useRef(0)
  const matrixColsRef = useRef(0)

  // Calculate matrix dimensions
  // Rows = latitude bands from pole to pole (π radians total)
  // Cols = longitude positions around sphere (2π radians total)
  const matrixDimensions = useMemo(() => {
    const rows = Math.ceil(Math.PI / ledSpacing)
    const cols = Math.ceil((2 * Math.PI) / columnSpacing)
    return { rows, cols }
  }, [ledSpacing, columnSpacing])


  // Create empty LED matrix
  const createLedMatrix = (rows: number, cols: number): Uint8Array => {
    return new Uint8Array(rows * cols).fill(0)
  }

  // Map text to matrix by rendering to canvas and sampling pixels
  const mapTextToMatrix = (
    text: string,
    matrix: Uint8Array,
    rows: number,
    cols: number
  ) => {
    // Clear matrix first
    matrix.fill(0)

    // Create canvas to render text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas size - make it wide enough for text and wrapping
    const canvasWidth = 2048
    const canvasHeight = 256
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Fill with black background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Configure text style
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 80px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw text multiple times for seamless wrapping
    const textWidth = ctx.measureText(text).width
    const spacing = textWidth + 200
    const repetitions = Math.ceil(canvasWidth / spacing) + 2

    for (let i = -1; i < repetitions; i++) {
      const x = canvasWidth / 2 + i * spacing
      ctx.fillText(text, x, canvasHeight / 2)
    }

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const data = imageData.data

    // Map canvas pixels to matrix cells
    // We'll focus on the middle rows (around equator) for the message
    const messageRowStart = Math.floor(rows * 0.4) // Start at 40% from top
    const messageRowEnd = Math.floor(rows * 0.6) // End at 60% from top
    const messageRows = messageRowEnd - messageRowStart

    // Calculate the width of one text instance for proper wrapping
    const singleTextWidth = spacing

    // For each pixel in the rendered text
    for (let canvasY = 0; canvasY < canvasHeight; canvasY++) {
      for (let canvasX = 0; canvasX < canvasWidth; canvasX++) {
        const pixelIndex = (canvasY * canvasWidth + canvasX) * 4
        const r = data[pixelIndex]

        // If pixel is white (or near white), mark corresponding matrix cells
        if (r > 128) {
          // Map canvas X to matrix column, using modulo to wrap to single text instance
          // This prevents overlapping/duplicated characters from multiple text repetitions
          const wrappedX = canvasX % singleTextWidth
          const normalizedX = wrappedX / singleTextWidth // 0 to 1 for one text instance
          const col = Math.floor(normalizedX * cols)

          // Map canvas Y to matrix rows (only in message area)
          // Flip Y coordinate: canvas top (Y=0) should map to higher row numbers (north)
          const normalizedY = 1.0 - (canvasY / canvasHeight) // 1 to 0 (flipped)
          const messageRow = Math.floor(normalizedY * messageRows)
          const row = messageRowStart + messageRow

          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            matrix[row * cols + col] = 1
          }
        }
      }
    }
  }

  // Convert matrix to Three.js DataTexture
  const matrixToTexture = (matrix: Uint8Array, rows: number, cols: number): THREE.DataTexture => {
    // Create texture data - each pixel represents one matrix cell
    const textureData = new Uint8Array(rows * cols)
    for (let i = 0; i < matrix.length; i++) {
      textureData[i] = matrix[i] * 255 // Convert 0/1 to 0/255
    }

    const texture = new THREE.DataTexture(textureData, cols, rows, THREE.RedFormat)
    texture.needsUpdate = true
    return texture
  }

  // Initialize matrix
  const { rows, cols } = matrixDimensions
  matrixRowsRef.current = rows
  matrixColsRef.current = cols

  // Create and populate matrix
  const ledMatrix = useMemo(() => {
    const matrix = createLedMatrix(rows, cols)
    mapTextToMatrix(word, matrix, rows, cols)
    matrixRef.current = matrix
    return matrix
  }, [word, rows, cols])

  // Convert matrix to texture
  const matrixTexture = useMemo(() => {
    return matrixToTexture(ledMatrix, rows, cols)
  }, [ledMatrix, rows, cols])

  // Convert color props to Vector3 for shader
  const dimColorVec = useMemo(() => {
    const color = new THREE.Color(dimColor)
    return new THREE.Vector3(color.r, color.g, color.b)
  }, [dimColor])

  const brightColorVec = useMemo(() => {
    const color = new THREE.Color(brightColor)
    return new THREE.Vector3(color.r, color.g, color.b)
  }, [brightColor])

  // Shader material for LED effect
  const material = useMemo(() => {
    if (!matrixTexture) return null

    return new THREE.ShaderMaterial({
      uniforms: {
        uLedMatrix: { value: matrixTexture },
        uScrollOffset: { value: 0 },
        uLedSpacing: { value: ledSpacing },
        uColumnSpacing: { value: columnSpacing },
        uRadius: { value: radius },
        uTime: { value: 0 },
        uMatrixRows: { value: rows },
        uMatrixCols: { value: cols },
        uDimColor: { value: dimColorVec },
        uBrightColor: { value: brightColorVec },
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
        uniform sampler2D uLedMatrix;
        uniform float uScrollOffset;
        uniform float uLedSpacing;
        uniform float uColumnSpacing;
        uniform float uRadius;
        uniform float uTime;
        uniform float uMatrixRows;
        uniform float uMatrixCols;
        uniform vec3 uDimColor;
        uniform vec3 uBrightColor;
        
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        void main() {
          // Convert world position to spherical coordinates
          vec3 pos = normalize(vWorldPosition);
          float latitude = asin(pos.y); // -PI/2 to PI/2 (south pole to north pole)
          float longitude = atan(pos.z, pos.x); // -PI to PI
          
          // Calculate matrix coordinates from latitude/longitude
          // Latitude: -PI/2 to PI/2 -> row 0 to uMatrixRows-1
          float normalizedLat = (latitude + 1.5708) / 3.14159; // 0 to 1
          float row = floor(normalizedLat * uMatrixRows);
          row = clamp(row, 0.0, uMatrixRows - 1.0);
          
          // Longitude: -PI to PI -> col 0 to uMatrixCols-1
          // Apply scroll offset for marquee effect
          // Flip longitude direction to fix backwards text
          float normalizedLon = 1.0 - ((longitude + 3.14159) / (2.0 * 3.14159)); // 1 to 0 (flipped)
          float scrolledLon = mod(normalizedLon + uScrollOffset, 1.0);
          float col = floor(scrolledLon * uMatrixCols);
          col = clamp(col, 0.0, uMatrixCols - 1.0);
          
          // Sample matrix texture at calculated coordinates
          // Texture coordinates: (col/uMatrixCols, row/uMatrixRows)
          vec2 matrixUv = vec2(col / uMatrixCols, row / uMatrixRows);
          vec4 matrixValue = texture2D(uLedMatrix, matrixUv);
          float ledState = matrixValue.r; // 0.0 (off) or 1.0 (on)
          
          // Quantize UVs into LED grid for dot matrix effect
          float columnGridSize = 1.0 / uColumnSpacing;
          float rowGridSize = 1.0 / uLedSpacing;
          vec2 gridUv = vec2(
            floor(vUv.x * columnGridSize) / columnGridSize,
            floor(vUv.y * rowGridSize) / rowGridSize
          );
          vec2 gridCenter = vec2(
            gridUv.x + uColumnSpacing * 0.5,
            gridUv.y + uLedSpacing * 0.5
          );
          vec2 distFromCenter = abs(vUv - gridCenter);
          float maxDist = min(uColumnSpacing, uLedSpacing) * 0.2;
          
          // Create circular LED dots
          float dist = length(distFromCenter);
          float ledShape = smoothstep(maxDist, maxDist * 0.7, dist);
          
          // Use color uniforms from props
          vec3 dimLedColor = uDimColor;
          vec3 brightLedColor = uBrightColor;
          
          // Mix between dim and bright based on matrix state
          vec3 ledColor = mix(dimLedColor, brightLedColor, ledState);
          
          // Apply LED shape - this creates the circular bulbs with black space between
          vec3 finalColor = mix(
            vec3(0.0, 0.0, 0.0), // Black space between bulbs
            ledColor,             // LED color (dim or bright)
            ledShape
          );
          
          // Add emissive glow for bright message LEDs
          float emissive = ledState * ledShape * 1.5;
          
          gl_FragColor = vec4(finalColor + vec3(emissive * 0.2), 1.0);
        }
      `,
    })
  }, [matrixTexture, ledSpacing, columnSpacing, radius, rows, cols, dimColorVec, brightColorVec])

  // Update scroll offset and refresh matrix
  useFrame((state: any, delta: number) => {
    if (meshRef.current && matrixRef.current) {
      // Update scroll offset for marquee effect
      scrollOffsetRef.current += delta * speed
      if (scrollOffsetRef.current >= 1.0) {
        scrollOffsetRef.current -= 1.0
      }

      // Matrix doesn't need to be updated every frame - scroll is handled in shader

      // Update shader uniforms (texture only needs update when matrix changes, not every frame)
      if (material && 'uniforms' in material) {
        material.uniforms.uScrollOffset.value = scrollOffsetRef.current
        material.uniforms.uTime.value = state.clock.elapsedTime
      }
    }
  })

  // Update matrix when word changes
  useEffect(() => {
    if (matrixRef.current) {
      mapTextToMatrix(
        word,
        matrixRef.current,
        matrixRowsRef.current,
        matrixColsRef.current
      )
      if (material && 'uniforms' in material) {
        const newTexture = matrixToTexture(
          matrixRef.current,
          matrixRowsRef.current,
          matrixColsRef.current
        )
        material.uniforms.uLedMatrix.value = newTexture
        material.needsUpdate = true
      }
    }
  }, [word, material])

  if (!material) return null

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  )
}
