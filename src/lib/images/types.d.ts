type ImageCLIMode = "static" | "intake" | "metadata" | "types";

type ImageMetadataRuntimeSchema = Omit<ImageMetadataYamlSchema, "friendlyName" | "dominantColor"> & {
    /**
     * Path to image asset in /public.
     */
    path: string,
    /**
     * CSS color string.
     */
    color: string,
};

type ImageSource = "lightroom-intake" | "misc-intake" | "static";

/**
 * Everything here gets regenerated when an image is processed.
 */
type ImageMetadataYamlSchema = {
    /**
     * "lightroom-intake" if this image was generated from intake and has lightroom exif data.\
     * "misc-intake" if this image was generated from intake.\
     * "static" if this image was added to the output dir manually.
     */
    source: ImageSource;
    /**
     * Used for typescript type (only?).
     * If image has a caption, that's used with date.
     * Same as the key by default (?) but can be overwritten.
     */
    friendlyName: string;
    /**
     * Date photo was originally taken, or image was originally exported, etc.
     * Might not be super accurate, might not exist.
     */
    date?: string;
    /**
     * From caption or title field in Lightroom. Can be overwritten.
     */
    alt?: string;
    /**
     * Lightroom tags. Can be overwritten.
     */
    tags?: string[];
    /**
     * Aspect ratio of image (width/height).
     */
    ratio: number;
    /**
     * Generated data uri for background placeholder.
     */
    placeholderUri: string;
    /**
     * Dominant color, as [r,g,b]. Can be overwritten as a css color value.
     */
    dominantColor: [number, number, number] | string;
};


/**
 * A lot of this is Lightroom-specific, a lot might not be used.
 * Just trying to give a type to exifr.parse()
 */
interface ExifData {
    /**
     * "Adobe Lightroom 8.1 (Macintosh)", "Adobe Photoshop 23.5 (Windows)", etc.
     * 
     * Same as: ["CreatorTool"]
     */
    Software?: string;
    /**
     * From Lightroom, refers to filename of imported asset,
     * consistent across multiple exports of the same photo.
     */
    RawFileName?: string;
    /**
     * On assets exported by Adobe software.
     * References original raw file or psd document, etc.
     */
    OriginalDocumentID?: string;
    /**
     * From Lightroom, refers to the date the photo was taken.
     * 
     * Same as: `["CreateDate"]`. See also: `["DateCreated"] (string)` and `["DigitalCreationDate"] (number)`.
     */
    DateTimeOriginal?: Date;
    /**
     * From Lightroom, refers to the Caption field.
     * 
     * Same as: `["ImageDescription"]` and `["description"]["value"]`.
     */
    ImageDescription?: string;
    /**
     * From Lightroom, refers to the Title field.
     * 
     * Same as `["title"]["value"]`.
     */
    ObjectName?: string;
    /**
     * From Lightroom, refers to the Location field.
     * 
     * Same as `["SubLocation"]`, for some reason.
     */
    Location?: string;
    /**
     * From Lightroom, refers to the City field.
     */
    City?: string;
    /**
     * From Lightroom, refers to the State field.
     */
    State?: string;
    /**
     * From Lightroom, refers to the Country field.
     */
    Country?: string;
    /**
     * From Lightroom, list of tags.
     * 
     * Same as `["subject"]`.
     */
    Keywords?: string | string[];
    /**
     * From Lightroom, stars from 0 to 5.
     */
    Rating?: number;
    /**
     * From Lightroom, camera name, like NIKON D500.
     */
    Model?: string;
    /**
     * From Lightroom, alt text field.
     */
    AltTextAccessibility?: string;
    /**
     * From Lightroom, expanded alt text field.
     */
    ExtDescrAccessibility?: string;
    /**
     * From Lightroom, lens specs, like 24.0-120.0 mm f/4.0.
     */
    LensModel?: string;
    /**
     * From Lightroom, photo's focal length, like 24 or 120.
     */
    FocalLength?: number;
    /**
     * From Lightroom, photo's ISO, like 400 or 1600.
     */
    ISO?: number;
    /**
     * From Lightroom, photo's shutter speed in seconds, like 3, or 0.0025.
     */
    ExposureTime?: number;
    /**
     * From Lightroom, photo's aperture, like 5.6 or 8.
     */
    FNumber?: number;
}