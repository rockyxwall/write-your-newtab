import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
      name: 'WYNTab',
      version: '0.2.1',
      action: {}, 
      permissions: ['tabs', 'storage', 'unlimitedStorage'],
      icons: {
        '16': 'favicon/favicon-96x96.png',
        '32': 'favicon/favicon-96x96.png',
        '48': 'favicon/favicon-96x96.png',
        '96': 'favicon/favicon-96x96.png',
        '128': 'favicon/web-app-manifest-192x192.png',
      },
    },
});