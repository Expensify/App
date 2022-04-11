import RNImageManipulator from '@oguzhnatly/react-native-image-manipulator';
import RNFetchBlob from 'rn-fetch-blob';

/**
     * Crops and rotates the image on ios/android
     * @param {String} uri
     * @param {Array<Object>} actions
     * @param {Object} options
     * @returns {Promise<Object>} Returns cropped and rotated image
*/
function imageManipulator(uri, actions, options) {
    return new Promise((resolve) => {
        RNImageManipulator.manipulate(uri, actions, options).then((result) => {
            RNFetchBlob.fs.stat(result.uri.replace('file://', '')).then(({size}) => {
                resolve({
                    ...result, size, type: 'image/png', name: 'avatar.png',
                });
            });
        });
    });
}

export default imageManipulator;
