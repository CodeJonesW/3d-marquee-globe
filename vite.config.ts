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
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
          ],
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

