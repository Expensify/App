/**
 * Result the avatar crop screen writes back for the opener to consume. The cropped image is stored
 * as a base64 data URL on web (so it survives a page refresh) or a file URI on native.
 */
type AvatarCropResult = {
    /** Matches the token of the crop draft that started this flow */
    token: string;

    /** Cropped image, as a base64 data URL (web) or file URI (native) */
    uri: string;

    /** Name of the cropped image */
    name: string;

    /** MIME type of the cropped image */
    type: string;

    /** Size of the cropped image in bytes */
    size?: number;

    /** Width of the cropped image in pixels (native image manipulator result) */
    width?: number;

    /** Height of the cropped image in pixels (native image manipulator result) */
    height?: number;
};

export default AvatarCropResult;
