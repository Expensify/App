import type {ImageManipulatorContext} from 'expo-image-manipulator';

import {ImageManipulator} from 'expo-image-manipulator';

import type {CropOrRotateImage} from './types';

import getSaveFormat from './getSaveFormat';

type ImageManipulatorAPI = {
    manipulate: (source: string) => ImageManipulatorContext;
};

function hasImageManipulatorAPI(value: unknown): value is ImageManipulatorAPI {
    return value !== null && typeof value === 'object' && 'manipulate' in value && typeof value.manipulate === 'function';
}

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve, reject) => {
        const format = getSaveFormat(options.type);
        if (!hasImageManipulatorAPI(ImageManipulator)) {
            reject(new Error('Image manipulator is unavailable'));
            return;
        }
        const context = ImageManipulator.manipulate(uri);
        for (const action of actions) {
            if ('crop' in action) {
                context.crop(action.crop);
            } else if ('rotate' in action) {
                context.rotate(action.rotate);
            }
        }
        context
            .renderAsync()
            .then((imageRef) => imageRef.saveAsync({compress: options.compress, format}))
            .then((result) =>
                fetch(result.uri)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const file = new File([blob], options.name || 'fileName.jpeg', {
                            type: options.type || 'image/jpeg',
                        });
                        file.uri = URL.createObjectURL(file);
                        resolve(file);
                    })
                    .catch(reject),
            )
            .catch(reject);
    });

export default cropOrRotateImage;
