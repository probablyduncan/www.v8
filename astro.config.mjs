// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkLineBreaks from './tools/markdown/remarkLineBreaks';

export default defineConfig({
  integrations: [mdx({
    remarkPlugins: [remarkLineBreaks]
  })],
});