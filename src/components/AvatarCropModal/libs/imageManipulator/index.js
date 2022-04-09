import _ from 'underscore';

function getContext(canvas) {
    return canvas.getContext('2d');
}

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

    const context = getContext(result);

    // Set the origin to the center of the image
    context.translate(result.width / 2, result.height / 2);

    // Rotate the canvas around the origin
    const radians = (degrees * Math.PI) / 180;
    context.rotate(radians);

    // Draw the image
    context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    return result;
}

function crop(canvas, options) {
    // ensure values are defined.
    let {
        originX = 0, originY = 0, width = 0, height = 0,
    } = options;
    const clamp = (value, max) => Math.max(0, Math.min(max, value));

    // lock within bounds.
    width = clamp(width, canvas.width);
    height = clamp(height, canvas.height);
    originX = clamp(originX, canvas.width);
    originY = clamp(originY, canvas.height);

    // lock sum of crop.
    width = Math.min(originX + width, canvas.width) - originX;
    height = Math.min(originY + height, canvas.height) - originY;

    const result = document.createElement('canvas');
    result.width = width;
    result.height = height;

    const context = getContext(result);
    context.drawImage(canvas, originX, originY, width, height, 0, 0, width, height);

    return result;
}

function getResults(canvas, options) {
    let base64;
    if (options) {
        const {format = 'png'} = options;
        const quality = Math.min(1, Math.max(0, options.compress || 1));
        base64 = canvas.toDataURL(`image/${format}`, quality);
    } else {
    // defaults to PNG with no loss
        base64 = canvas.toDataURL();
    }
    return {
        uri: base64,
        width: canvas.width,
        height: canvas.height,
        base64,
    };
}

function loadImageAsync(uri) {
    return new Promise((resolve, reject) => {
        const imageSource = new Image();
        imageSource.crossOrigin = 'anonymous';
        const canvas = document.createElement('canvas');
        imageSource.onload = () => {
            canvas.width = imageSource.naturalWidth;
            canvas.height = imageSource.naturalHeight;

            const context = getContext(canvas);
            context.drawImage(imageSource, 0, 0, imageSource.naturalWidth, imageSource.naturalHeight);

            resolve(canvas);
        };
        imageSource.onerror = () => reject(canvas);
        imageSource.src = uri;
    });
}

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

            const result = getResults(resultCanvas, options);
            resolve(result);
        });
    });
}

export default imageManipulator;
