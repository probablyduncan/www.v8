import { file } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const minDate = new Date(0);
const resolveDate = (d: string | undefined) => {
    if (!d) {
        return undefined;
    }

    const parsed = new Date(d);
    if (isNaN(parsed.valueOf())) {
        return undefined;
    }

    return parsed;
}

const weblinks = defineCollection({
    loader: file("src/content/weblinks.yaml"),
    schema: z.object({
        title: z.string(),
        href: z.string().transform(href => href.endsWith("/") ? href.substring(0, href.length - 1) : href),
        // href: z.string().transform(href => href.endsWith("/") ? href : href + "/"),
        desc: z.string(),
        date: z.string(),
        sortDate: z.string().optional(),
        tags: z.array(z.string())
            .or(z.string().transform((tag: string) => [tag])),
    }).transform(link => {
        return {
            title: link.title,
            href: link.href,
            desc: link.desc,
            tags: link.tags,
            date: {
                text: link.date,
                obj: resolveDate(link.sortDate) ?? resolveDate(link.date) ?? minDate,
            },
        };
    }),
});

const ticker = defineCollection({
    loader: file("src/content/ticker.yaml"),
    schema: z.object({
        href: z.string(),
        text: z.string(),
    }),
})

export const collections = { weblinks, ticker };