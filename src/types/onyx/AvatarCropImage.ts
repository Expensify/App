/**
 * Shared shape of an image moving through the avatar crop flow, used by both the crop input
 * ([[AvatarCropDraft]]) and the cropped output ([[AvatarCropResult]]). The image is stored as a
 * base64 data URL on web (so it survives a page refresh) or a file URI on native.
 */
type AvatarCropImage = {
    /** Correlates this crop flow with the opener that started it */
    token: string;

    /** Image, as a base64 data URL (web) or file URI (native) */
    uri: string;

    /** Name of the image */
    name: string;

    /** MIME type of the image */
    type: string;
};

export default AvatarCropImage;
