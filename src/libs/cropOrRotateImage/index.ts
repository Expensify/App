import {ImageManipulator} from 'expo-image-manipulator';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage} from './types';

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve, reject) => {
        const format = getSaveFormat(options.type);
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
                        const file = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
                        file.uri = URL.createObjectURL(file);
                        resolve(file);
                    })
                    .catch(reject),
            )
            .catch(reject);
    });

export default cropOrRotateImage;
