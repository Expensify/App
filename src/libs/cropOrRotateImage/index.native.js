import RNImageManipulator from '@oguzhnatly/react-native-image-manipulator';
import RNFetchBlob from 'react-native-blob-util';

/**
 * Crops and rotates the image on ios/android
 *
 * @param {String} uri
 * @param {Array<Object>} actions
 * @param {Object} options
 * @returns {Promise<Object>} Returns cropped and rotated image
 */
function cropOrRotateImage(uri, actions, options = {}) {
    return new Promise((resolve) => {
        RNImageManipulator.manipulate(uri, actions, options).then((result) => {
            RNFetchBlob.fs.stat(result.uri.replace('file://', '')).then(({size}) => {
                resolve({
                    ...result, size, type: options.type || 'image/jpeg', name: options.name || 'fileName.jpg',
                });
            });
        });
    });
}

export default cropOrRotateImage;
