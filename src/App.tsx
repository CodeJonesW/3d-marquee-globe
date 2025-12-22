import { useState } from 'react'
import { LedMarqueeOrbContainer } from './components/LedMarqueeOrbContainer'

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
    word: 'DAIRY QUEEN HAS THE BEST BURGERS',
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
      <LedMarqueeOrbContainer
        word={currentConfig.word}
        speed={currentConfig.speed}
        dimColor={currentConfig.dimColor}
        brightColor={currentConfig.brightColor}
      />
    </div>
  )
}

export default App

