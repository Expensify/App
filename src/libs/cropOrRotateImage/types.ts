import {RNImageManipulatorResult} from '@oguzhnatly/react-native-image-manipulator';

type CropOrRotateImageOptions = {
    type: string;
    name: string;
    compress: number;
};

type CropOptions = {
    originX: number;
    originY: number;
    width: number;
    height: number;
};

type Action = {
    crop?: CropOptions;
    rotate?: number;
};

type CustomRNImageManipulatorResult = RNImageManipulatorResult & {size: number; type: string; name: string};

type CropOrRotateImage = (uri: string, actions: Action[], options: CropOrRotateImageOptions) => Promise<File | CustomRNImageManipulatorResult>;

export type {CropOrRotateImage, CropOptions, Action, CropOrRotateImageOptions, CustomRNImageManipulatorResult};
