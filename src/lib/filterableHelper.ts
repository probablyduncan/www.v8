export interface FilterButtonProps {
    listName: string;
    tags: string[];
    showAll?: "off" | "first" | "last";
    
    /**
     * Tag that will be selected by default. If not set, the first tag (or all) will be the default.
     */
    defaultTag?: string;
}

export function getFilterableTagClass(listName: string, tag?: string) {
    if (tag !== undefined) {
        return listName + "-tag-" + tag;
    }

    return listName + "-tag";
}