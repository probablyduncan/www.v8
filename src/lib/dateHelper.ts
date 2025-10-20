/**
 * Returns a string like "14 Jan 2001"
 */
export function getDateDisplayString(d: Date | undefined) {

    if (d === undefined) {
        return ""
    }

    return d.toLocaleDateString("en-UK", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Returns a yyyy/mm/dd string like "2001/01/14"
 */
export function getYearMonthDay(d: Date | undefined) {
    if (d === undefined) {
        return ""
    }

    const isoString = d.toISOString();
    return isoString.substring(0, isoString.indexOf("T"));
}

/**
 * Returns a url to wikipedia's page for the given date,
 * like https://wikipedia.org/wiki/January_14
 */
export function toWikipediaDateURL(d: Date | undefined) {

    if (d === undefined) {
        return "";
    }

    const month = d.toLocaleString("en-UK", { month: "long" });
    const day = d.getDate();
    return `https://wikipedia.org/wiki/${month}_${day}`;
};