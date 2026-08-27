import type {Dimensions} from '@src/types/utils/Layout';

type ImageManipulatorConfig = Dimensions & {
    fileUri: string;
    fileName: string;
    type?: string;

    /**
     * JPEG quality between 0 and 1 used when saving the manipulated image.
     * Omit to keep expo-image-manipulator's default, which re-encodes losslessly.
     */
    compress?: number;
};

export default ImageManipulatorConfig;
