import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
      name: 'Write Your NewTab',
      version: '0.2.0',
      action: {}, 
      permissions: ['tabs', 'storage'],
    },
});