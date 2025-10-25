import path from "path";

export const PATHS = {
    INTAKE: path.join(process.cwd(), "image-intake"),
    OUTPUT: path.join(process.cwd(), "public", "images"),
    METADATA: path.join(process.cwd(), "src", "content", "images", "imageMetadata.g.yaml"),
    TYPES: path.join(process.cwd(), "src", "content", "images", "imageTypes.g.d.ts"),
    KEYS: path.join(process.cwd(), "src", "content", "images", "imageKeys.g.ts"),
} as const;

export const GENERATED_IMAGE_EXTENSION = ".g.avif";

export const SHARP_SUPPORTED_FILE_TYPES = [".jpg", ".tif", ".png", ".heic", ".avif", ".iiq", ".gif", ".webp"];