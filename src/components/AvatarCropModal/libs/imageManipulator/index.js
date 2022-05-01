import _ from 'underscore';

function sizeFromAngle(width, height, angle) {
    const radians = (angle * Math.PI) / 180;
    let c = Math.cos(radians);
    let s = Math.sin(radians);
    if (s < 0) {
        s = -s;
    }
    if (c < 0) {
        c = -c;
    }
    return {width: (height * s) + (width * c), height: (height * c) + (width * s)};
}

function rotate(canvas, degrees) {
    const {width, height} = sizeFromAngle(canvas.width, canvas.height, degrees);

    const result = document.createElement('canvas');
    result.width = width;
    result.height = height;

    const context = result.getContext('2d');
    context.translate(result.width / 2, result.height / 2);

    const radians = (degrees * Math.PI) / 180;
    context.rotate(radians);

    context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    return result;
}

function crop(canvas, options) {
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

function convertCanvasToFile(canvas) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const file = new File([blob], 'fileName.jpg', {type: 'image/jpeg'});
            file.uri = URL.createObjectURL(file);
            resolve(file);
        });
    });
}

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
 * @param {String} uri
 * @param {Object} actions
 * @param {Object} options
 * @returns {Promise<Object>} Returns cropped and rotated image
*/
function imageManipulator(uri, actions, options) {
    return new Promise((resolve) => {
        loadImageAsync(uri).then((originalCanvas) => {
            const resultCanvas = _.reduce(actions, (canvas, action) => {
                if ('crop' in action) {
                    return crop(canvas, action.crop);
                } if ('rotate' in action) {
                    return rotate(canvas, action.rotate);
                }
                return canvas;
            }, originalCanvas);

            convertCanvasToFile(resultCanvas, options).then(resolve);
        });
    });
}

export default imageManipulator;
