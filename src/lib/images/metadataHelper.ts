import fs from "fs";
import yaml from "yaml";
import { GENERATED_IMAGE_EXTENSION, PATHS } from "./consts";
import path from "path";
import log from "./log";

/**
 * Reads metadata from disk.
 */
export function readMetadata(): Record<string, ImageMetadataYamlSchema> {
    if (!fs.existsSync(PATHS.METADATA)) {
        return {};
    }

    const buffer = fs.readFileSync(PATHS.METADATA);
    const contents = buffer.toString();
    return yaml.parse(contents) ?? {};
}

/**
 * Writes metadata to disk.
 */
export function writeMetadata(metadata: Record<string, ImageMetadataYamlSchema>) {

    const yamlString = yaml.stringify(metadata, {
        sortMapEntries: true,
        keepUndefined: false,
        indent: 4,
    });

    fs.writeFileSync(PATHS.METADATA, yamlString);
}

/**
 * Generates a types file with all images' friendly names and tags.
 */
export function writeTypes(metadata: Record<string, ImageMetadataYamlSchema>) {

    const imageNames = new Set<string>();
    const imageTags = new Set<string>();
    const keys = Object.keys(metadata);

    keys.forEach(key => {
        const entry = metadata[key];
        if (imageNames.has(entry.friendlyName)) {
            throw "duplicate image name! " + entry.friendlyName;
        }
        imageNames.add(entry.friendlyName);
        entry.tags?.forEach(tag => imageTags.add(tag));
    });

    const genMessage = "//GENERATED CODE - MODIFICATIONS WILL BE OVERWRITTEN"

    let types = genMessage;
    let arrays = genMessage;

    if (keys.length) {
        types += `\n\ntype ImageKey = "${keys.join(`" | "`)}";`
        arrays += `\n\nexport const IMAGE_KEYS = ["${keys.join(`", "`)}"] as const;`
    }
    else {
        types += `\n\ntype ImageKey = never;`;
        arrays += `\n\export const IMAGE_KEYS = [];`;
    }

    if (imageNames.size) {
        types += `\n\ntype ImageName = "${[...imageNames].join(`" | "`)}";`;
        arrays += `\n\nexport const IMAGE_NAMES = ["${[...imageNames].join(`", "`)}"] as const;`
    }
    else {
        types += `\n\ntype ImageName = never;`;
        arrays += `\n\export const IMAGE_NAMES = [];`;
    }

    if (imageTags.size) {
        types += `\n\ntype ImageTag = "${[...imageTags].join(`" | "`)}";`;
        arrays += `\n\nexport const IMAGE_TAGS = ["${[...imageTags].join(`", "`)}"] as const;`
    }
    else {
        types += `\n\ntype ImageTag = never;`;
        arrays += `\n\export const IMAGE_TAGS = [];`;
    }

    types += `\n`;
    arrays += `\n`;
    
    fs.writeFileSync(PATHS.TYPES, types);
    fs.writeFileSync(PATHS.KEYS, arrays);
}

/**
 * Deletes all entries in metadata which do not have a corresponding image in the output directory.
 */
export function removeMetadataEntriesWithoutFile(metadata: Record<string, ImageMetadataYamlSchema>) {
    const deleted = [];
    for (let key in metadata) {
        if (!fs.existsSync(path.join(PATHS.OUTPUT, key))) {
            deleted.push(key);
            delete metadata[key];
        }
    }

    if (deleted.length) {
        log(`deleted ${deleted.length} stale metadata entries`);
        log(deleted.join());
    }
}

/**
 * Deletes all generated files from output directory which do not have a corresponding entry in metadata.
 */
export function removeGeneratedFilesNotInMetadata(metadata: Record<string, ImageMetadataYamlSchema>) {
    const filenames = fs.readdirSync(PATHS.OUTPUT);
    for (let filename in filenames) {
        if (filename.endsWith(GENERATED_IMAGE_EXTENSION) && !(filename in metadata)) {
            fs.rmSync(path.join(PATHS.OUTPUT, filename));
        }
    }
}

/**
 * Deletes all specified filenames from the intake directory.
 */
export function cleanIntakeDir(filenames: string[]) {
    filenames.forEach(filename => {
        const filepath = path.join(PATHS.INTAKE, filename);
        if (fs.existsSync(filepath)) {
            fs.rmSync(filepath);
        }
    });
}