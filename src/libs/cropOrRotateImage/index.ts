import {CropOptions, CropOrRotateImage, CropOrRotateImageOptions} from './types';

type SizeFromAngle = {
    width: number;
    height: number;
};

/**
 * Calculates a size of canvas after rotation
 */
function sizeFromAngle(width: number, height: number, angle: number): SizeFromAngle {
    const radians = (angle * Math.PI) / 180;
    let sine = Math.cos(radians);
    let cosine = Math.sin(radians);
    if (cosine < 0) {
        cosine = -cosine;
    }
    if (sine < 0) {
        sine = -sine;
    }
    return {width: height * cosine + width * sine, height: height * sine + width * cosine};
}

/**
 * Creates a new rotated canvas
 */
function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
    const {width, height} = sizeFromAngle(canvas.width, canvas.height, degrees);

    // We have to create a new canvas because it is not possible to change already drawn
    // elements. Transformations such as rotation have to be applied before drawing
    const result = document.createElement('canvas');
    result.width = width;
    result.height = height;

    const context = result.getContext('2d');
    if (context) {
        // In order to rotate image along its center we have to apply next transformation
        context.translate(result.width / 2, result.height / 2);

        const radians = (degrees * Math.PI) / 180;
        context.rotate(radians);

        context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    }
    return result;
}

/**
 * Creates new cropped canvas and returns it
 */
function cropCanvas(canvas: HTMLCanvasElement, options: CropOptions) {
    let {originX = 0, originY = 0, width = 0, height = 0} = options;
    const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

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
    context?.drawImage(canvas, originX, originY, width, height, 0, 0, width, height);

    return result;
}

function convertCanvasToFile(canvas: HTMLCanvasElement, options: CropOrRotateImageOptions): Promise<File> {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return;
            }
            const file = new File([blob], options.name || 'fileName.jpeg', {type: options.type || 'image/jpeg'});
            file.uri = URL.createObjectURL(file);
            resolve(file);
        });
    });
}

/**
 * Loads image from specified url
 */
function loadImageAsync(uri: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const imageSource = new Image();
        imageSource.crossOrigin = 'anonymous';
        const canvas = document.createElement('canvas');
        imageSource.onload = () => {
            canvas.width = imageSource.naturalWidth;
            canvas.height = imageSource.naturalHeight;

            const context = canvas.getContext('2d');
            context?.drawImage(imageSource, 0, 0, imageSource.naturalWidth, imageSource.naturalHeight);

            resolve(canvas);
        };
        imageSource.onerror = () => reject(canvas);
        imageSource.src = uri;
    });
}

/**
 * Crops and rotates the image on web
 */

const cropOrRotateImage: CropOrRotateImage = (uri, actions, options) =>
    loadImageAsync(uri).then((originalCanvas) => {
        const resultCanvas = actions.reduce((canvas, action) => {
            if (action.crop) {
                return cropCanvas(canvas, action.crop);
            }
            if (action.rotate) {
                return rotateCanvas(canvas, action.rotate);
            }
            return canvas;
        }, originalCanvas);
        return convertCanvasToFile(resultCanvas, options);
    });

export default cropOrRotateImage;
