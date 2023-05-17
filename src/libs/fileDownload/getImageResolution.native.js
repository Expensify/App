/**
 * Get image resolution
 * Image object is returned as a result of a user selecting image using the react-native-image-picker
 * Image already has width and height properties coming from library so we just need to return them on native
 * Opposite to web where we need to create a new Image object and get dimensions from it
 *
 * @param {*} file Picked file blob
 * @returns {Promise}
 */
function getImageResolution(file) {
    return Promise.resolve({width: file.width, height: file.height});
}

export default getImageResolution;
