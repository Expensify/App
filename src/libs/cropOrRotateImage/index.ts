import {manipulateAsync} from 'expo-image-manipulator';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage} from './types';

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
