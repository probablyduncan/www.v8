import path from "path";
import { IMAGE_KEYS, IMAGE_NAMES, IMAGE_TAGS } from "../../content/images/imageKeys.g";
import { readMetadata } from "./metadataHelper";
import type { SingleOrSeveral } from "@probablyduncan/common/sos";
import { GENERATED_IMAGE_EXTENSION } from "./consts";

function yamlToRuntimeMetadata(key: ImageKey, yamlData: ImageMetadataYamlSchema): ImageMetadataRuntimeSchema {
    return {
        ...yamlData,
        key,
        name: yamlData.friendlyName as ImageName,
        path: path.normalize(path.join("images", key)),
        color: Array.isArray(yamlData.dominantColor) ? `rgb(${yamlData.dominantColor.map(c => c.toFixed()).join(", ")})` : yamlData.dominantColor,
        date: yamlData.date ? new Date(yamlData.date) : undefined,
        filename: yamlData.source === "lightroom-intake" ? key.replace(/^\d\d\d\d-\d\d-\d\d-/, "").replace(GENERATED_IMAGE_EXTENSION, "") : key,
    }
}

//#region public getters

/**
 * If the string is an image name or metadata key, returns the corresponding image.
 * Otherwise, returns undefined.
 */
export function getImage(nameOrKey: string) {
    return getImageByName(nameOrKey as ImageName) ?? getImageByKey(nameOrKey as ImageKey);
}

export function getImageByName(key: ImageName) {
    return imagesByName().get(key);
}

export function getImageByKey(key: ImageKey) {
    return imagesByKey().get(key);
}

export function getImagesByTag(tag: ImageTag) {
    return imagesByTag().get(tag) ?? [];
}

export function getImagesByNamesAndTags(...args: (SingleOrSeveral<ImageName | ImageTag | ImageKey | undefined>)[]) {

    const names = new Set<ImageName>();
    const tags = new Set<ImageTag>();
    const keys = new Set<ImageKey>();

    args.flat().forEach(arg => {
        if (IMAGE_TAGS.includes(arg as ImageTag)) {
            tags.add(arg as ImageTag);
        }
        else if (IMAGE_NAMES.includes(arg as ImageName)) {
            names.add(arg as ImageName);
        }
        else if (IMAGE_KEYS.includes(arg as ImageKey)) {
            keys.add(arg as ImageKey);
        }
    });

    return allImages().filter(image =>
        names.has(image.name)
        || keys.has(image.key)
        || image.tags?.some(tag => tags.has(tag))
    );
}

export function getAllImages(): ImageMetadataRuntimeSchema[] {
    return allImages();
}

//#endregion
//#region image maps

let _imagesByKey: Map<ImageKey, ImageMetadataRuntimeSchema>;
function imagesByKey() {
    return _imagesByKey ??= Object.entries(readMetadata()).reduce((map, [key, entry]) => {
        map.set(key as ImageKey, yamlToRuntimeMetadata(key as ImageKey, entry));
        return map;
    }, new Map<ImageKey, ImageMetadataRuntimeSchema>());
}

let _imagesByName: Map<ImageName, ImageMetadataRuntimeSchema>;
function imagesByName() {
    return _imagesByName ??= Object.entries(readMetadata()).reduce((map, [key, entry]) => {
        map.set(entry.friendlyName as ImageName, yamlToRuntimeMetadata(key as ImageKey, entry));
        return map;
    }, new Map<ImageName, ImageMetadataRuntimeSchema>());
}

let _imagesByTag: Map<ImageTag, ImageMetadataRuntimeSchema[]>;
function imagesByTag() {
    return _imagesByTag ??= allImages().reduce((map, image) => {
        image.tags?.forEach(tag => {
            map.get(tag as ImageTag)?.push(image);
        });
        return map;
    }, new Map<ImageTag, ImageMetadataRuntimeSchema[]>(IMAGE_TAGS.map(tag => [tag, []])));
}

let _allImages: ImageMetadataRuntimeSchema[];
function allImages() {
    return _allImages ??= Object.entries(readMetadata())
        .map(([key, entry]) => yamlToRuntimeMetadata(key as ImageKey, entry))
        .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}

//#endregion