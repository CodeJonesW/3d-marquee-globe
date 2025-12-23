import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Library mode configuration
  if (mode === 'library') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'ThreeDMarquee',
          fileName: (format) => `3d-marquee.${format}.js`,
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          external: (id) => {
            // Externalize all React-related packages
            return (
              id === 'react' ||
              id === 'react-dom' ||
              id === 'react/jsx-runtime' ||
              id === 'react/jsx-dev-runtime' ||
              id.startsWith('react/') ||
              id.startsWith('react-dom/') ||
              id === 'three' ||
              id.startsWith('three/') ||
              id === '@react-three/fiber' ||
              id.startsWith('@react-three/fiber/') ||
              id === '@react-three/drei' ||
              id.startsWith('@react-three/drei/') ||
              id === '@react-three/postprocessing' ||
              id.startsWith('@react-three/postprocessing/')
            )
          },
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
              three: 'THREE',
              '@react-three/fiber': 'ReactThreeFiber',
              '@react-three/drei': 'Drei',
              '@react-three/postprocessing': 'Postprocessing',
            },
          },
        },
      },
    }
  }

  // Dev mode configuration (for example/demo)
  return {
    plugins: [react()],
  }
})

