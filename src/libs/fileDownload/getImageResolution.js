"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get image resolution
 * File object is returned as a result of a user selecting image using the <input type="file" />
 * We need to create a new Image object and get dimensions from it
 * Opposite to native where we already have width and height properties coming from library
 *
 * new Image() is used specifically for performance reasons, opposed to using FileReader (5ms vs +100ms)
 * because FileReader is slow and causes a noticeable delay in the UI when selecting an image.
 *
 */
var getImageResolution = function (file) {
    if (!(file instanceof File)) {
        return Promise.reject(new Error('Object is not an instance of File'));
    }
    return new Promise(function (resolve, reject) {
        var image = new Image();
        var objectUrl = URL.createObjectURL(file);
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
};
exports.default = getImageResolution;
