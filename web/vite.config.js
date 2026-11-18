import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH lets the same build run at a domain root ("/") or under a sub-path (GitHub Pages: "/astroforeveryone/")
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
