/**
 * Returns image dimensions for picked File object
 * File object is returned as a result of a user selecting files using the <input> element
 *
 * @param {*} file Picked file blob
 * @returns {Promise}
 */
function getImageBlobResolution(file) {
    return Promise.resolve({width: file.width, height: file.height});
}

export default getImageBlobResolution;
