import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const certsDir = path.resolve(__dirname, '../backend/certs');
const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

// Détermine le protocole et le port du backend selon la présence des certificats
const backendProtocol = hasCerts ? 'https' : 'http';
const backendPort = hasCerts ? 3443 : 3001;
const backendUrl = `${backendProtocol}://localhost:${backendPort}`;

export default defineConfig({
  plugins: [react()],
  server: {
    https: hasCerts
      ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
      : false,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: backendUrl,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
