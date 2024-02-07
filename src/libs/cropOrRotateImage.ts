import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';
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

function getSaveFormat(type: string) {
    switch (type) {
        case 'image/png':
            return SaveFormat.PNG;
        case 'image/webp':
            return SaveFormat.WEBP;
        case 'image/jpeg':
            return SaveFormat.JPEG;
        default:
            return SaveFormat.JPEG;
    }
}
/**
 * Crops and rotates the image on ios/android
 */
const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve) => {
        const format = getSaveFormat(options.type);
        manipulateAsync(uri, actions, {compress: options.compress, format}).then((result) => {
            fetch(result.uri)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
                    file.uri = URL.createObjectURL(file);
                    resolve(file);
                });
        });
    });

export default cropOrRotateImage;
export type {CustomRNImageManipulatorResult};
