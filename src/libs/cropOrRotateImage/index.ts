import {ImageManipulator} from 'expo-image-manipulator';

import type {CropOrRotateImage} from './types';

import getSaveFormat from './getSaveFormat';

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve, reject) => {
        const format = getSaveFormat(options.type);
        const context = (
            ImageManipulator as unknown as {
                manipulate: (uri: string) => {
                    crop: (crop: unknown) => void;
                    rotate: (rotate: unknown) => void;
                    renderAsync: () => Promise<{saveAsync: (options: {compress?: number; format?: unknown}) => Promise<{uri: string}>}>;
                };
            }
        ).manipulate(uri);
        for (const action of actions) {
            if ('crop' in action) {
                context.crop(action.crop);
            } else if ('rotate' in action) {
                context.rotate(action.rotate);
            }
        }
        context
            .renderAsync()
            .then((imageRef: {saveAsync: (options: {compress?: number; format?: unknown}) => Promise<{uri: string}>}) => imageRef.saveAsync({compress: options.compress, format}))
            .then((result: {uri: string}) =>
                fetch(result.uri)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const file = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
                        file.uri = URL.createObjectURL(file);
                        resolve(file);
                    })
                    .catch(reject),
            )
            .catch(reject);
    });

export default cropOrRotateImage;
