// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkLineBreaks from './src/lib/remarkLineBreaks';

export default defineConfig({
  integrations: [mdx({
    remarkPlugins: [remarkLineBreaks]
  })],
});