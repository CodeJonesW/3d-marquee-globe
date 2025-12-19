import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import LedMarqueeOrb from './components/LedMarqueeOrb'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting and environment */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Environment preset="city" />

        {/* Main orb component */}
        <LedMarqueeOrb word="ROADHERO" />

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

