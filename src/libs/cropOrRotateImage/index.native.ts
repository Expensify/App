import {manipulateAsync} from 'expo-image-manipulator';
import RNFetchBlob from 'react-native-blob-util';
import getSaveFormat from './getSaveFormat';
import type {CropOrRotateImage} from './types';

/**
 * Crops and rotates the image on ios/android
 */
const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve) => {
        const format = getSaveFormat(options.type);
        // We need to remove the base64 value from the result, as it is causing crashes on Release builds.
        // More info: https://github.com/Expensify/App/issues/37963#issuecomment-1989260033
        manipulateAsync(uri, actions, {compress: options.compress, format}).then(({base64, ...result}) => {
            RNFetchBlob.fs.stat(result.uri.replace('file://', '')).then(({size}) => {
                resolve({
                    ...result,
                    size,
                    type: options.type || 'image/jpeg',
                    name: options.name || 'fileName.jpg',
                });
            });
        });
    });

export default cropOrRotateImage;
