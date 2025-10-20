import path from "path";
import { IMAGE_KEYS, IMAGE_NAMES, IMAGE_TAGS } from "../../content/imageKeys.g";
import { readMetadata } from "./metadataHelper";
import type { SingleOrSeveral } from "@probablyduncan/common/sos";

function yamlToRuntimeMetadata(key: ImageKey, yamlData: ImageMetadataYamlSchema): ImageMetadataRuntimeSchema {
    return {
        ...yamlData,
        path: path.normalize(path.join("images", key)),
        color: Array.isArray(yamlData.dominantColor) ? `rgb(${yamlData.dominantColor.join(", ")})` : yamlData.dominantColor
    }
}

//#region public getters

/**
 * If the string is an image name or metadata key, returns the corresponding image.
 * Otherwise, returns undefined.
 */
export function getImage(nameOrKey: string) {

    if (nameOrKey in IMAGE_NAMES) {
        return getImageByName(nameOrKey as ImageName);
    }

    if (nameOrKey in IMAGE_KEYS) {
        return getImageByKey(nameOrKey as ImageKey)
    }

    return undefined;
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
    return args.flat().flatMap(arg => {

        if (arg === undefined) {
            return;
        }

        if (IMAGE_TAGS.includes(arg as ImageTag)) {
            return getImagesByTag(arg as ImageTag);
        }

        return getImage(arg);
    }).filter(img => img) as ImageMetadataRuntimeSchema[];
}

export function getAllImages(): ImageMetadataRuntimeSchema[] {
    return allImages();
}

//#endregion
//#region image maps

let _allImages: ImageMetadataRuntimeSchema[];
function allImages() {
    return _allImages ??= Object.entries(readMetadata()).map(([key, entry]) => yamlToRuntimeMetadata(key as ImageKey, entry));
}

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
    return _imagesByTag ??= Object.entries(readMetadata()).reduce((map, [key, entry]) => {
        entry.tags?.forEach(tag => {
            map.get(tag as ImageTag)?.push(yamlToRuntimeMetadata(key as ImageKey, entry));
        });
        return map;
    }, new Map<ImageTag, ImageMetadataRuntimeSchema[]>(IMAGE_TAGS.map(tag => [tag, []])));
}

//#endregion