/**
 * Returns image dimensions for picked File object
 * File object is returned as a result of a user selecting files using the <input> element
 *
 * @param {*} file Picked file blob
 * @returns {Promise}
 */
function getImageResolution(file) {
    if (!(file instanceof File)) {
        return Promise.reject(new Error('Object is not an instance of File'));
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = function () {
            resolve({
                width: this.naturalWidth,
                height: this.naturalHeight,
            });
            URL.revokeObjectURL(objectUrl);
        };
        image.onerror = reject;
        image.src = objectUrl;
    });
}

export default getImageResolution;
