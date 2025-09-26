import sharp from "sharp";
import { GENERATED_IMAGE_EXTENSION, PATHS } from "./consts";
import log from "./log";
import path from "path";
import fs from "fs";
import { getPlaceholder } from "./placeholderHelper";

export default async function doStaticImport(metadataCollection: Record<string, ImageMetadataYamlSchema>) {

    // no intake dir, create it and get out
    if (!fs.existsSync(PATHS.OUTPUT)) {
        fs.mkdirSync(PATHS.OUTPUT);
        return Promise.resolve([]);
    }

    const filenames = fs.readdirSync(PATHS.OUTPUT);
    return Promise.all(filenames.map(processStatic));

    async function processStatic(filename: string) {

        if (filename.endsWith(GENERATED_IMAGE_EXTENSION)) {
            // don't process generated images
            return;
        }

        const start = performance.now();

        const buffer = fs.readFileSync(path.join(PATHS.OUTPUT, filename));
        const placeholderPromise = getPlaceholder(sharp(buffer));

        const metadata = metadataCollection[filename] ?? {
            source: "static",
            friendlyName: filename,
        };

        const { width, height } = await sharp(buffer).metadata();
        metadata.ratio = width / height;

        metadata.placeholderUri = await placeholderPromise;

        metadataCollection[filename] = metadata;

        const end = performance.now();
        const elapsed = (end - start);

        log(`${filename} processed in ${(elapsed / 1000).toFixed(3)}s`);
    }
}