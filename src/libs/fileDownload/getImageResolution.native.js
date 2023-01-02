/**
 * Returns image dimensions for image selected from react-native-image-picker
 *
 * @param {*} file Picked file blob
 * @returns {Promise}
 */
function getImageResolution(file) {
    return Promise.resolve({width: file.width, height: file.height});
}

export default getImageResolution;
