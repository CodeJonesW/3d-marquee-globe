import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import LedMarqueeOrb from './components/LedMarqueeOrb'
import { useState } from 'react'

// Message and color configurations
const messageConfigs = [
  {
    word: 'GO DAWGS!! SIC EM!!',
    speed: 0.125,
    dimColor: '#ff0000',
    brightColor: '#FFFFFF',
  },
  {
    word: 'THE OBSTACLE IS THE WAY',
    speed: 0.08,
    dimColor: '#1a1a2e',
    brightColor: '#e94560',
  },
  {
    word: 'CODING IS COOL',
    speed: 0.1,
    dimColor: '#0a0a0a',
    brightColor: '#00ff41',
  },
  {
    word: 'DAIRY QUEEN HAS THE BEST BURGER',
    speed: 0.15,
    dimColor: '#1a0033',
    brightColor: '#ff6b35',
  },
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentConfig = messageConfigs[currentIndex]

  const cycleMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % messageConfigs.length)
  }


  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Cycle button in top right */}
      <button
        onClick={cycleMessage}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          border: '2px solid #ffffff',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        }}
      >
        {'>'}
      </button>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting and environment */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Environment preset="city" />

        {/* Main orb component */}
        <LedMarqueeOrb 
          word={currentConfig.word}
          speed={currentConfig.speed} 
          dimColor={currentConfig.dimColor}
          brightColor={currentConfig.brightColor}
        />

        {/* Orbit controls for camera interaction */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI - Math.PI / 3}
        />

        {/* Post-processing for bloom effect */}
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

export default App

