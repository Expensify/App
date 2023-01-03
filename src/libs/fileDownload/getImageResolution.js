/**
 * Get image resolution
 * File object is returned as a result of a user selecting image using the <input type="file" />
 * We need to create a new Image object and get dimensions from it
 * Opposite to native where we already have width and height properties coming from library
 *
 * new Image() is used specifically for performance reasons, opposed to using FileReader (5ms vs +100ms)
 * because FileReader is slow and causes a noticeable delay in the UI when selecting an image.
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
