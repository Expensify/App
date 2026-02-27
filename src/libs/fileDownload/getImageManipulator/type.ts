import type {Dimensions} from '@src/types/utils/Layout';

type ImageManipulatorConfig = Dimensions & {
    fileUri: string;
    fileName: string;
    type?: string;
};

export default ImageManipulatorConfig;
