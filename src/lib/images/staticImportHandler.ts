import sharp from "sharp";
import { IMAGE_SOURCES, PATHS, SHARP_SUPPORTED_FILE_TYPES, type ImageMetadataYamlSchema } from "./constsAndTypes";
import log from "./log";
import path from "path";
import fs from "fs";
import { getPlaceholder } from "./placeholderHelper";

export default async function doStaticImport(metadataCollection: Record<string, ImageMetadataYamlSchema>) {

    // no intake dir, create it and get out
    if (!fs.existsSync(PATHS.STATIC)) {
        fs.mkdirSync(PATHS.STATIC);
        return Promise.resolve([]);
    }

    const filenames = fs.readdirSync(PATHS.STATIC);
    return Promise.all(filenames.map(processStatic));

    async function processStatic(filename: string) {

        if (!SHARP_SUPPORTED_FILE_TYPES.includes(path.parse(filename).ext)) {
            // don't process unsupported types
            return;
        }

        const start = performance.now();

        const buffer = fs.readFileSync(path.join(PATHS.STATIC, filename));
        const placeholderPromise = getPlaceholder(sharp(buffer));

        const metadata = metadataCollection[filename] ?? {
            source: IMAGE_SOURCES.STATIC_INTAKE,
            friendlyName: filename,
        };

        const { width, height } = await sharp(buffer).metadata();
        metadata.ratio = width / height;

        const placeholderResult = await placeholderPromise;
        metadata.placeholderUri = placeholderResult.uri;

        // only update color if it's an array. String means we've overridden it
        if (!metadata.dominantColor || Array.isArray(metadata.dominantColor)) {
            metadata.dominantColor = placeholderResult.color;
        }

        metadataCollection[filename] = metadata;

        const end = performance.now();
        const elapsed = (end - start);

        log(`${filename} processed in ${(elapsed / 1000).toFixed(3)}s`);
    }
}