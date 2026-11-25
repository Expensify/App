import type {Image} from 'react-native-nitro-image';
import type {CameraOrientation} from 'react-native-vision-camera';

/** A captured image written to disk. */
type CapturedPhoto = {
    path: string;
    width: number;
    height: number;
    orientation?: CameraOrientation;
    captureDurationMs?: number;
    saveDurationMs?: number;

    /** Time spent in the transform before the save, when one ran */
    transformDurationMs?: number;

    /**
     * Set only when a transform ran: whether it changed the image. A changed capture is saved upright, while an unchanged
     * one is the camera's own file, which may still need rotating.
     */
    isTransformed?: boolean;
};

/** What a transform made of a captured image. */
type TransformedImage = {
    /** The changed image to save, or undefined to keep the capture as taken */
    image?: Image;

    /** Resolves once the transform has stopped reading the captured image, which may be after it gave up waiting */
    sourceReleased: Promise<unknown>;
};

/** Changes a captured image before it is saved, such as cropping it to the receipt. */
type TransformImage = (image: Image) => Promise<TransformedImage>;

export default CapturedPhoto;
export type {TransformImage, TransformedImage};
