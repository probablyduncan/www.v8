import { blurhashToDataUri, getDominantColor } from "@unpic/placeholder";
import { encode } from "blurhash";
import type { Sharp } from "sharp";

/**
 * @returns blurhash placeholder image as data uri
 */
export async function getPlaceholder(sharpObject: Sharp) {
    const { data: sharpBuffer, info: { width, height } } = await sharpObject
        .ensureAlpha()
        .resize({
            // this means the longer edge will be 600px
            // possible optimization: only resize when image is larger than 600x600
            fit: "inside",
            width: 600,
            height: 600,
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixelArray = new Uint8ClampedArray(sharpBuffer);
    const blurhash = encode(pixelArray, width, height, 4, 4);
    const uri = blurhashToDataUri(blurhash, 16, 16);
    const color = getDominantColor(pixelArray)

    return { uri, color };
}