import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
      // This tells the browser to show the icon in the toolbar
      action: {}, 
      permissions: ['tabs', 'storage'],
    },
});