import RNImageManipulator from '@oguzhnatly/react-native-image-manipulator';
import RNFetchBlob from 'react-native-blob-util';
import {CropOrRotateImage} from './types';

/**
 * Crops and rotates the image on ios/android
 */
const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    new Promise((resolve) => {
        RNImageManipulator.manipulate(uri, actions, options).then((result) => {
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
