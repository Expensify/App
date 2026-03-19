// eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-deprecated -- The new ImageManipulator.manipulate() API produces empty/corrupted results
// for blob URIs from the browser file picker on web, breaking avatar uploads (#85726, #85673). Using the deprecated manipulateAsync until the new API is fixed for web.
import {manipulateAsync} from 'expo-image-manipulator';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage} from './types';

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve, reject) => {
        const format = getSaveFormat(options.type);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        manipulateAsync(uri, actions, {compress: options.compress, format})
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
