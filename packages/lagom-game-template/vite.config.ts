// vite.config.js
import {defineConfig} from 'vite'

export default defineConfig({
    optimizeDeps: {
        exclude: ['lagom-engine']
    },
    base: ''
})