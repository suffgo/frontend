// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react'

import tailwind from '@astrojs/tailwind';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations:[react(), tailwind(), vue()],
});