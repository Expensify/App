import type {ImageResult} from 'expo-image-manipulator';

type CropOrRotateImageOptions = {
    type: string;
    name: string;
    compress: number;
};

type CropAction = {
    crop: {
        originX: number;
        originY: number;
        width: number;
        height: number;
    };
};

type RotateOption = {rotate: number};

type Action = CropAction | RotateOption;

type CustomRNImageManipulatorResult = ImageResult & {size: number; type: string; name: string};

type CropOrRotateImage = (uri: string, actions: Action[], options: CropOrRotateImageOptions) => Promise<File | CustomRNImageManipulatorResult>;

export type {CustomRNImageManipulatorResult, CropOrRotateImage};
