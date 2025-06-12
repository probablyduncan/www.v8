import { file } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const links = defineCollection({
    loader: file("src/content/links.yaml"),
    schema: z.object({
        title: z.string(),
        href: z.string(),
        desc: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
    }),
});

export const collections = { links };