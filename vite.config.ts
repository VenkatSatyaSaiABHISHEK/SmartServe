import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Custom plugin to log restaurant portal URLs in the terminal
const logRoutesPlugin = () => ({
  name: 'log-app-routes',
  configureServer(server: any) {
    server.httpServer?.once('listening', () => {
      const address = server.httpServer?.address();
      const port = typeof address === 'object' ? address?.port : 5173;
      const base = `http://localhost:${port}`;
      setTimeout(() => {
        console.log('\n  \x1b[1;35m➜\x1b[0m  \x1b[1;35mSmartServe Portals & Terminals:\x1b[0m');
        console.log(`  \x1b[32m➜\x1b[0m  Customer Portal:  \x1b[36m${base}/\x1b[0m`);
        console.log(`  \x1b[32m➜\x1b[0m  Waiter Terminal:  \x1b[36m${base}/waiter/login\x1b[0m`);
        console.log(`  \x1b[32m➜\x1b[0m  Chef Terminal:    \x1b[36m${base}/chef/login\x1b[0m`);
        console.log(`  \x1b[32m➜\x1b[0m  Admin Console:    \x1b[36m${base}/admin/login\x1b[0m`);
        console.log(`  \x1b[32m➜\x1b[0m  QR Table Manager: \x1b[36m${base}/admin/qr\x1b[0m\n`);
      }, 150);
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), logRoutesPlugin()],
  envPrefix: 'NEXT_PUBLIC_',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
