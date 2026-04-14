import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';
import type {Orientation} from 'react-native-vision-camera';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import getDeviceOrientationAwareImageSize from '@libs/cropOrRotateImage/getDeviceOrientationAwareImageSize';
import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import type {FileObject} from '@src/types/utils/Attachment';

type ImageObject = {
    /** File object of the image */
    file: FileObject;

    /** Name of the image */
    filename: string;

    /** URL of the image */
    source: string;
};

function calculateCropRect(imageWidth: number, imageHeight: number, aspectRatioWidth: number, aspectRatioHeight: number, shouldAlignTop?: boolean) {
    const sourceAspectRatio = imageWidth / imageHeight;
    const targetAspectRatio = aspectRatioWidth / aspectRatioHeight;

    let width = imageWidth;
    let height = imageHeight;
    let originX = 0;
    let originY = 0;
    if (sourceAspectRatio > targetAspectRatio) {
        width = height * targetAspectRatio;
        originX = (imageWidth - width) / 2;
    } else {
        height = width * (aspectRatioHeight / aspectRatioWidth);
        originY = shouldAlignTop ? 0 : (imageHeight - height) / 2;
    }

    return {width, height, originX, originY};
}

const IMAGE_TYPE = 'image/jpeg';

function cropImageToAspectRatio(
    /** Source image */
    image: ImageObject,

    /** Width portion of the target aspect ratio (e.g., 16 for 16:9) */
    aspectRatioWidth?: number,

    /** Height portion of the target aspect ratio (e.g., 9 for 16:9) */
    aspectRatioHeight?: number,

    /** Vertically align the crop to the top (true) or center (false) */
    shouldAlignTop?: boolean,

    /** Image orientation determined by react-native-image-size that depends on device orientation */
    orientation?: Orientation,
): Promise<ImageObject> {
    return ImageSize.getSize(image.source)
        .then((imageSize) => {
            const {
                imageWidth,
                imageHeight,
                aspectRatioWidth: ratioWidth,
                aspectRatioHeight: ratioHeight,
            } = getDeviceOrientationAwareImageSize({imageSize, orientation, aspectRatioWidth, aspectRatioHeight});

            if (!imageWidth || !imageHeight || !ratioWidth || !ratioHeight) {
                return image;
            }

            const crop = calculateCropRect(imageWidth, imageHeight, ratioWidth, ratioHeight, shouldAlignTop);
            const croppedFilename = `receipt_cropped_${Date.now()}.jpeg`;

            return cropOrRotateImage(image.source, [{crop}], {compress: 1, name: croppedFilename, type: IMAGE_TYPE}).then((croppedImage) => {
                if (!croppedImage?.uri || !croppedImage?.name) {
                    return image;
                }
                return {file: croppedImage, filename: croppedImage.name, source: croppedImage.uri};
            });
        })
        .catch(() => image);
}

const THUMBNAIL_MAX_WIDTH = 512;
/**
 * Generate a low-resolution thumbnail from an image URI.
 * Used on native to avoid decoding the full 12MP camera photo on the confirmation page.
 * 256px is sufficient for the confirmation screen preview and decodes ~4x faster than 512px.
 */
function generateThumbnail(sourceUri: string, maxWidth = THUMBNAIL_MAX_WIDTH): Promise<string | undefined> {
    return ImageManipulator.manipulate(sourceUri)
        .resize({width: maxWidth})
        .renderAsync()
        .then((image) => image.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG}))
        .then((result) => result.uri)
        .catch((error) => {
            Log.warn(`Failed to generate thumbnail: ${error}`);
            return undefined;
        });
}

export type {ImageObject};
export {calculateCropRect, cropImageToAspectRatio, generateThumbnail};
