export interface FilterButtonProps {
    listName: string;
    tags: string[];
    showAll?: "off" | "first" | "last";
}

export function getFilterableTagClass(listName: string, tag?: string) {
    if (tag !== undefined) {
        return listName + "-tag-" + tag;
    }

    return listName + "-tag";
}