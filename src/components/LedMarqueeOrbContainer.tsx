import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import LedMarqueeOrb, { LedMarqueeOrbProps } from './LedMarqueeOrb'


interface LedMarqueeOrbContainerProps extends LedMarqueeOrbProps {
    word: string
    speed: number
    dimColor: string
    brightColor: string
}

export const LedMarqueeOrbContainer = ({ word, speed, dimColor, brightColor }: LedMarqueeOrbContainerProps) => {

return (
    <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting and environment */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Environment preset="city" />

        {/* Main orb component */}
        <LedMarqueeOrb 
          word={word}
          speed={speed} 
          dimColor={dimColor}
          brightColor={brightColor}
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
)
}