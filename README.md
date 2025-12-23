# 3D Marquee

A React library featuring a 3D rotating orb with a scrolling LED marquee effect. The word scrolls horizontally across the center band of the sphere, creating a seamless ticker display.

## Installation

Install the package and its peer dependencies:

```bash
npm install 3d-marquee @react-three/fiber @react-three/drei @react-three/postprocessing react react-dom three
```

### Peer Dependencies

- `react`: `^18.2.0 || ^19.0.0`
- `react-dom`: `^18.2.0 || ^19.0.0`
- `three`: `>=0.158.0`
- `@react-three/fiber`: `^8.15.11 || ^9.0.0`
- `@react-three/drei`: `^9.92.7 || ^10.0.0`
- `@react-three/postprocessing`: `^2.15.9 || ^3.0.0`

## Usage

Import and use the `LedMarqueeOrbContainer` component:

```tsx
import { LedMarqueeOrbContainer } from '3d-marquee'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LedMarqueeOrbContainer
        word="Hello World"
        speed={0.1}
        dimColor="red"
        brightColor="blue"
      />
    </div>
  )
}
```

### Vite Configuration

If you're using Vite, add this to your `vite.config.ts` to ensure React is properly deduplicated:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  },
})
```

## Component API

### `LedMarqueeOrbContainer`

The main component that includes the Canvas, lighting, controls, and post-processing effects.

**Props:**

- `word` (string, **required**): The text to display on the marquee
- `speed` (number, **required**): Scroll speed multiplier (higher = faster)
- `dimColor` (string, **required**): Color for inactive LEDs (e.g., `"#1a261a"` or `"red"`)
- `brightColor` (string, **required**): Color for active LEDs (e.g., `"#00ff4d"` or `"blue"`)
- `radius` (number, optional, default: `1`): Sphere radius
- `ledSpacing` (number, optional, default: `0.0075`): Spacing between LED dots
- `columnSpacing` (number, optional, default: `0.005`): Spacing between columns

### `LedMarqueeOrb`

The core orb component (used internally by `LedMarqueeOrbContainer`). You can use this directly if you need more control over the Canvas setup.

**Props:**

Same as `LedMarqueeOrbContainer`, but all props are optional with defaults.

## Features

- **3D Rotating Orb**: Smoothly rotating sphere with orbit controls
- **LED Marquee Effect**: Text scrolls horizontally across the center band
- **Shader-Based Rendering**: High-performance GPU-accelerated LED matrix effect
- **Bloom Post-Processing**: Glowing LED effect with bloom shader
- **Customizable Colors**: Set dim and bright LED colors via props
- **Responsive Design**: Full viewport canvas that adapts to screen size

## Controls

- **Mouse Drag**: Rotate the camera around the orb
- **Scroll**: Zoom in/out

## Development

### Building the Library

To build the library for distribution:

```bash
npm run build:lib
```

This creates the distribution files in the `dist/` directory.

### Running the Demo

To run the demo/example application:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building for Production

Build the production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Technologies

- **React 18/19**: UI framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions
- **@react-three/postprocessing**: Post-processing effects (bloom)

## Implementation Details

The LED marquee effect is implemented using a custom shader material that:

1. Samples a canvas texture containing the repeated word
2. Constrains rendering to a horizontal band around the sphere's equator
3. Quantizes UV coordinates into a grid for the LED dot matrix effect
4. Applies scrolling offset for the marquee animation
5. Uses emissive colors and bloom post-processing for the glow effect

## License

MIT
