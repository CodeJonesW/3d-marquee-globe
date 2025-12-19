# LED Marquee Orb

A React + Vite single-page application featuring a 3D rotating orb with a scrolling LED marquee effect. The word scrolls horizontally across the center band of the sphere, creating a seamless ticker display.

## Features

- **3D Rotating Orb**: Smoothly rotating sphere with orbit controls
- **LED Marquee Effect**: Text scrolls horizontally across the center band
- **Shader-Based Rendering**: High-performance GPU-accelerated LED matrix effect
- **Bloom Post-Processing**: Glowing LED effect with bloom shader
- **Responsive Design**: Full viewport canvas that adapts to screen size

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Component API

The `LedMarqueeOrb` component accepts the following props:

- `word` (string, required): The text to display on the marquee
- `speed` (number, optional, default: 0.25): Scroll speed multiplier
- `radius` (number, optional, default: 1): Sphere radius
- `bandHeight` (number, optional, default: 0.2): Height of the LED band (0-1)
- `ledSpacing` (number, optional, default: 0.05): Spacing between LED dots

## Example Usage

```tsx
<LedMarqueeOrb word="ROADHERO" speed={0.3} radius={1.2} />
```

## Technologies

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions
- **@react-three/postprocessing**: Post-processing effects (bloom)

## Controls

- **Mouse Drag**: Rotate the camera around the orb
- **Scroll**: Zoom in/out (if enabled)

## Implementation Details

The LED marquee effect is implemented using a custom shader material that:
1. Samples a canvas texture containing the repeated word
2. Constrains rendering to a horizontal band around the sphere's equator
3. Quantizes UV coordinates into a grid for the LED dot matrix effect
4. Applies scrolling offset for the marquee animation
5. Uses emissive colors and bloom post-processing for the glow effect

