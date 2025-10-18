// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkLineBreaks from './tools/markdown/remarkLineBreaks';
import rehypeUnwrapImages from 'rehype-unwrap-images';

export default defineConfig({
  integrations: [mdx({
    remarkPlugins: [remarkLineBreaks],
    rehypePlugins: [rehypeUnwrapImages],
  })],
});