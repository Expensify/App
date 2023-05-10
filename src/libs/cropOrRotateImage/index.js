import _ from 'underscore';

/**
 * Calculates a size of canvas after rotation
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Number} angle
 * @returns {Object} Returns width and height of new canvas
 */
function sizeFromAngle(width, height, angle) {
    const radians = (angle * Math.PI) / 180;
    let sine = Math.cos(radians);
    let cosine = Math.sin(radians);
    if (cosine < 0) {
        cosine = -cosine;
    }
    if (sine < 0) {
        sine = -sine;
    }
    return {width: (height * cosine) + (width * sine), height: (height * sine) + (width * cosine)};
}

/**
 * Creates a new rotated canvas
 *
 * @param {Object} canvas
 * @param {Number} degrees
 * @returns {Object}
 */
function rotateCanvas(canvas, degrees) {
    const {width, height} = sizeFromAngle(canvas.width, canvas.height, degrees);

    // We have to create a new canvas because it is not possible to change already drawn
    // elements. Transformations such as rotation have to be applied before drawing
    const result = document.createElement('canvas');
    result.width = width;
    result.height = height;

    const context = result.getContext('2d');

    // In order to rotate image along its center we have to apply next transformation
    context.translate(result.width / 2, result.height / 2);

    const radians = (degrees * Math.PI) / 180;
    context.rotate(radians);

    context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    return result;
}

/**
 * Creates new cropped canvas and returns it
 *
 * @param {Object} canvas
 * @param {Object} options
 * @returns {Object}
 */
function cropCanvas(canvas, options) {
    let {
        originX = 0, originY = 0, width = 0, height = 0,
    } = options;
    const clamp = (value, max) => Math.max(0, Math.min(max, value));

    width = clamp(width, canvas.width);
    height = clamp(height, canvas.height);
    originX = clamp(originX, canvas.width);
    originY = clamp(originY, canvas.height);

    width = Math.min(originX + width, canvas.width) - originX;
    height = Math.min(originY + height, canvas.height) - originY;

    const result = document.createElement('canvas');
    result.width = width;
    result.height = height;

    const context = result.getContext('2d');
    context.drawImage(canvas, originX, originY, width, height, 0, 0, width, height);

    return result;
}

/**
 * @param {Object} canvas
 * @param {Object} options
 * @returns {Promise<File>}
 */
function convertCanvasToFile(canvas, options = {}) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const file = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
            file.uri = URL.createObjectURL(file);
            resolve(file);
        });
    });
}

/**
 * Loads image from specified url
 *
 * @param {String} uri
 * @returns {Promise<Object>}
 */
function loadImageAsync(uri) {
    return new Promise((resolve, reject) => {
        const imageSource = new Image();
        imageSource.crossOrigin = 'anonymous';
        const canvas = document.createElement('canvas');
        imageSource.onload = () => {
            canvas.width = imageSource.naturalWidth;
            canvas.height = imageSource.naturalHeight;

            const context = canvas.getContext('2d');
            context.drawImage(imageSource, 0, 0, imageSource.naturalWidth, imageSource.naturalHeight);

            resolve(canvas);
        };
        imageSource.onerror = () => reject(canvas);
        imageSource.src = uri;
    });
}

/**
 * Crops and rotates the image on web
 *
 * @param {String} uri
 * @param {Object} actions
 * @param {Object} options
 * @returns {Promise<Object>} Returns cropped and rotated image
 */
function cropOrRotateImage(uri, actions, options) {
    return loadImageAsync(uri).then((originalCanvas) => {
        const resultCanvas = _.reduce(actions, (canvas, action) => {
            if ('crop' in action) {
                return cropCanvas(canvas, action.crop);
            }
            if ('rotate' in action) {
                return rotateCanvas(canvas, action.rotate);
            }
            return canvas;
        }, originalCanvas);

        return convertCanvasToFile(resultCanvas, options);
    });
}

export default cropOrRotateImage;
