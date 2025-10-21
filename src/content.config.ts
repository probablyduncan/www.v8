import { file, glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { IMAGE_KEYS, IMAGE_NAMES, IMAGE_TAGS } from "./content/images/imageKeys.g";
import { shuffle } from "@probablyduncan/common";

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

const zImageName = z.enum(IMAGE_NAMES);
const zImageKey = z.enum(IMAGE_KEYS);
const zImageTag = z.enum(IMAGE_TAGS);
const zImage = zImageName.or(zImageKey);

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

const index = defineCollection({
    loader: file("src/content/index.yaml"),
    schema: z.object({
        date: z.string(),
        tags: z.array(z.string())
            .or(z.string().transform((tag: string) => [tag])),
        content: z.string(),
        img: zImage.optional(),
    })
})

const text = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/text" }),
    schema: z.object({
        title: z.string(),

        date: z.date(),
        modDate: z.date().optional(),

        align: z.enum(["left", "right"]).default("left"),
        stance: z.enum(["center", "side", "golden", "wide"]).default("golden"),
    }),
})

const photo = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/photo" }),
    schema: z.object({
        title: z.string(),
        date: z.string().or(z.date()),
        shuffle: z.boolean().default(false),
        
        names: z.array(zImage).optional(),
        tags: z.array(zImageTag).optional(),
    })
})

export const collections = { weblinks, ticker, index, text, photo };