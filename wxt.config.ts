import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
      name: 'WYNTab',
      description: 'Write Your NewTab, lets you replace the default new tab page with your own custom HTML',
      version: '0.3.8',
      action: {}, 
      permissions: ['tabs', 'storage', 'unlimitedStorage'],
      icons: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '96': 'icon/96.png',
        '128': 'icon/128.png',
      },
    },
});