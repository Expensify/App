import {manipulateAsync} from 'expo-image-manipulator';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage, CroppedRotatedFile} from './types';

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve) => {
        const format = getSaveFormat(options.type);
        manipulateAsync(uri, actions, {compress: options.compress, format}).then((result) => {
            fetch(result.uri)
                .then((res) => res.blob())
                .then((blob) => {
                    const file: CroppedRotatedFile = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
                    file.uri = URL.createObjectURL(file);

                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        file.base64 = (reader.result as string) ?? '';
                        resolve(file);
                    };
                });
        });
    });

export default cropOrRotateImage;
