import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// HTTPS configuration for local development
// Set VITE_HTTPS_KEY and VITE_HTTPS_CERT environment variables to enable HTTPS
// Or create certificate files using mkcert: mkcert localhost 127.0.0.1 ::1 YOUR_IP
const getHttpsConfig = () => {
  // Check for environment variables first
  const certPath = process.env.VITE_HTTPS_CERT
  const keyPath = process.env.VITE_HTTPS_KEY

  if (certPath && keyPath) {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  }

  // Fallback: check for common local development certificate names
  // This allows developers to create their own certificates without hardcoding IPs
  const commonCertNames = [
    'localhost+3.pem',
    'localhost.pem',
    'cert.pem',
  ]
  const commonKeyNames = [
    'localhost+3-key.pem',
    'localhost-key.pem',
    'key.pem',
  ]

  for (let i = 0; i < commonCertNames.length; i++) {
    const cert = path.resolve(__dirname, commonCertNames[i])
    const key = path.resolve(__dirname, commonKeyNames[i])
    if (fs.existsSync(cert) && fs.existsSync(key)) {
      return {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
      }
    }
  }

  return false
}

const httpsConfig = getHttpsConfig()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    ...(httpsConfig ? { https: httpsConfig } : { https: false }),
  },
})
