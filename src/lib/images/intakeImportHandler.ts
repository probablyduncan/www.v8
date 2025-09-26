import sharp from "sharp";
import { GENERATED_IMAGE_EXTENSION, PATHS } from "./consts";
import log from "./log";
import path from "path";
import fs from "fs";
import { getPlaceholder } from "./placeholderHelper";
import { toSeveral } from "@probablyduncan/common/sos";
import exifr from "exifr";

export default async function doIntakeImport(metadataCollection: Record<string, ImageMetadataYamlSchema>): Promise<(string | undefined)[]> {

    // no intake dir, create it and get out
    if (!fs.existsSync(PATHS.INTAKE)) {
        fs.mkdirSync(PATHS.INTAKE);
        return Promise.resolve([]);
    }

    const filenames = fs.readdirSync(PATHS.INTAKE);
    return Promise.all(filenames.map(processIntake));

    async function processIntake(filename: string) {

        if (![".jpg", ".tif", ".png", ".heic", ".avif", ".iiq"].includes(path.parse(filename).ext)) {
            // don't process unsupported images
            log("(warn) unsupported intake filetype", filename);
            return;
        }

        const start = performance.now();

        const intakeBuffer = fs.readFileSync(path.join(PATHS.INTAKE, filename));
        const exifData: ExifData = await exifr.parse(intakeBuffer, true);
        const { width, height } = await sharp(intakeBuffer).metadata();

        const outputBufferPromise = sharp(intakeBuffer)
            .resize(800, 800, { fit: 'inside' })
            .avif({
                quality: 80,
                effort: 9,
            })
            .toBuffer();

        const uriPromise = getPlaceholder(sharp(intakeBuffer));

        let key: string;
        let metadata: ImageMetadataYamlSchema;

        if (exifData.Software?.toLowerCase().includes("lightroom")) {

            if (!exifData.DateTimeOriginal || !exifData.RawFileName) {
                log("(warn) missing date or original filename", filename);
                return;
            }

            const dateString = getDateString(exifData.DateTimeOriginal);
            key = dateString + "-" + path.parse(exifData.RawFileName).name + GENERATED_IMAGE_EXTENSION;
            const newAlt = exifData.ImageDescription ?? exifData.ObjectName;

            metadata = metadataCollection[key] ?? {
                // name is key by default, but we don't want to overwrite custom names
                friendlyName: key,
            }

            // set name to caption if we were previously using the key
            if (newAlt && key == metadata.friendlyName) {
                metadata.friendlyName = sanitizeForFilename(newAlt) + "-" + dateString;
            }

            // only overwrite old caption if new caption exists
            if (newAlt) {
                metadata.alt = newAlt;
            }

            metadata.source = "lightroom-intake";
            metadata.date = dateString;

            // set tags from lightroom
            metadata.tags = [
                exifData.Keywords,
                exifData.Location,
                exifData.City,
                exifData.State,
                exifData.Country,
            ].flat(2).filter(t => t && t !== "").map(t => t!.toLowerCase());
        }

        // non-lightroom
        else {
            key = path.parse(filename).name + GENERATED_IMAGE_EXTENSION;
            metadata = metadataCollection[key] ?? {
                alt: "",
            };
            metadata.source = "misc-intake";
            metadata.friendlyName = key;
        }

        // common info
        metadata.ratio = width / height;
        metadata.placeholderUri = await uriPromise;

        metadataCollection[key] = metadata;

        fs.writeFileSync(path.join(PATHS.OUTPUT, key), await outputBufferPromise);

        const end = performance.now();
        const elapsed = (end - start);

        log(`${filename} processed in ${(elapsed / 1000).toFixed(3)}s`);
        return filename;
    }
}

/**
 * Returns a date string like "YYYY_MM_DD".
 */
const getDateString = (date: Date | undefined) => date?.toISOString().split('T')[0] ?? "";

/**
 * Converts to lowercase,
 * replaces spaces and dashes with underscores,
 * and removes all non-alphanumeric characters.
 */
function sanitizeForFilename(str: string) {
    return str?.toLowerCase().replaceAll(/[ \-]/g, "_").replaceAll(/[^a-zA-Z0-9\_]/g, "");
}