import type AvatarCropImage from './AvatarCropImage';

/** Result the avatar crop screen writes back for the opener to consume. */
type AvatarCropResult = AvatarCropImage & {
    /** Size of the cropped image in bytes */
    size?: number;

    /** Width of the cropped image in pixels (native image manipulator result) */
    width?: number;

    /** Height of the cropped image in pixels (native image manipulator result) */
    height?: number;
};

export default AvatarCropResult;
