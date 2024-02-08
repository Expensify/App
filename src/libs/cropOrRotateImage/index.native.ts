import {manipulateAsync} from 'expo-image-manipulator';
import RNFetchBlob from 'react-native-blob-util';
import type CropOrRotateImage from './types';
import getSaveFormat from './utils';

/**
 * Crops and rotates the image on ios/android
 */
const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve) => {
        const format = getSaveFormat(options.type);
        manipulateAsync(uri, actions, {compress: options.compress, format}).then((result) => {
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
