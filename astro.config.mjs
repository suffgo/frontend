// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import vue from '@astrojs/vue';
import nodeAdapter from '@astrojs/node';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
    base: '/',
    output: 'server',
    adapter: nodeAdapter({
      mode: 'standalone', // genera todo junto en .output/standalone
    }),
    integrations:[tailwind(), vue({appEntrypoint: '/src/_app',}), icon()],
    vite: {
        ssr: {
          noExternal: ['vuetify'],
        },
      },
});