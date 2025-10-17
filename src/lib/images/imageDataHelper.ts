import path from "path";
import { IMAGE_TAGS } from "../../content/imageKeys.g";
import { readMetadata } from "./metadataHelper";
import type { SingleOrSeveral } from "@probablyduncan/common/sos";

function yamlToRuntimeMetadata(key: string, yamlData: ImageMetadataYamlSchema): ImageMetadataRuntimeSchema {
    return {
        ...yamlData,
        path: path.normalize(path.join("images", key)),
        color: Array.isArray(yamlData.dominantColor) ? `rgb(${yamlData.dominantColor.join(", ")})` : yamlData.dominantColor
    }
}

let _imagesByName: Map<ImageName, ImageMetadataRuntimeSchema>;
export function getImageByName(key: ImageName): ImageMetadataRuntimeSchema {
    _imagesByName ??= Object.entries(readMetadata()).reduce((map, [key, entry]) => {
        map.set(entry.friendlyName as ImageName, yamlToRuntimeMetadata(key, entry));
        return map;
    }, new Map<ImageName, ImageMetadataRuntimeSchema>());
    return _imagesByName.get(key)!;
}

let _imagesByTag: Map<ImageTag, ImageMetadataRuntimeSchema[]>;
export function getImagesByTag(tag: ImageTag): ImageMetadataRuntimeSchema[] {
    _imagesByTag ??= Object.entries(readMetadata()).reduce((map, [key, entry]) => {
        entry.tags?.forEach(tag => {
            map.get(tag as ImageTag)?.push(yamlToRuntimeMetadata(key, entry));
        });
        return map;
    }, new Map<ImageTag, ImageMetadataRuntimeSchema[]>(IMAGE_TAGS.map(tag => [tag, []])));
    return _imagesByTag.get(tag)!;
}

export function getImagesByNamesAndTags(...args: (SingleOrSeveral<ImageName | ImageTag | undefined>)[]) {
    return args.flat().flatMap(arg => {

        if (arg === undefined) {
            return;
        }

        if (IMAGE_TAGS.includes(arg as ImageTag)) {
            return getImagesByTag(arg as ImageTag);
        }

        return getImageByName(arg as ImageName);
    }).filter(img => img);
}

let _allImages: ImageMetadataRuntimeSchema[];
export function getAllImages() {
    _allImages ??= Object.entries(readMetadata()).map(([key, entry]) => yamlToRuntimeMetadata(key, entry));
    return _allImages;
}