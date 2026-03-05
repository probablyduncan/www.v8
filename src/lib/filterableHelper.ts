export interface FilterButtonProps {
    /**
     * used in the class name of the tags, and to link the tags to the filterable items
     */
    listName: string;
    /**
     * list of all tags to be displayed. will render in order
     */
    tags: string[];
    /**
     * whether and where to put the 'show all' tag
     */
    showAll?: "off" | "first" | "last";
    /**
     * instead of 'all', what will be displayed in the 'show all' tag
     */
    allText?: string;
    /**
     * Tag that will be selected by default. If not set, the first tag (or all) will be the default.
     */
    defaultTag?: string;
};

/**
 * like {listName}-filters
 */
export function getFilterListId(listName: string) {
    return hyphenate(listName, "filters");
}

/**
 * like {listName}-tag-{tagName} or {listName}-tag
 */
export function getFilterableTag(listName: string, tagName?: string) {
    return hyphenate(listName, "tag", tagName);
}

/**
 * like {listName}-filter-{tagName} or {listName}-filter
 */
export function getFilterName(listName: string, tagName?: string) {
    return hyphenate(listName, "filter", tagName);
}

function hyphenate(...strings: (string | undefined)[]) {
    return strings.filter(Boolean).join("-");
}