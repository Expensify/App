import releaseQuietly from '@libs/cameraCapture/releaseQuietly';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import getDeviceOrientationAwareImageSize from '@libs/cropOrRotateImage/getDeviceOrientationAwareImageSize';
import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import type {FileObject} from '@src/types/utils/Attachment';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';

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
): Promise<ImageObject> {
    return ImageSize.getSize(image.source)
        .then((imageSize) => {
            const {
                imageWidth,
                imageHeight,
                aspectRatioWidth: ratioWidth,
                aspectRatioHeight: ratioHeight,
            } = getDeviceOrientationAwareImageSize({imageSize, aspectRatioWidth, aspectRatioHeight});

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
type GenerateThumbnailOptions = {
    /** Width of the thumbnail, in pixels */
    maxWidth?: number;

    /**
     * Checked when the job reaches the front of the queue, so a thumbnail nobody needs anymore (its row scrolled away,
     * or another caller already made it) is not decoded at all.
     */
    shouldSkip?: () => boolean;
};

/**
 * Thumbnails are made one at a time. Each one decodes the full-size photo in native memory, and redraws it at full
 * size first when it has to be rotated upright, before shrinking it. A list of local receipts used to ask for all of its
 * thumbnails at once (every visible row mounts `useLocalReceiptThumbnail` together, and again after every relaunch since
 * the cache only lives in memory), which held all of those bitmaps together until iOS terminated the app.
 */
let thumbnailQueue: Promise<unknown> = Promise.resolve();

function enqueueThumbnailJob<T>(job: () => Promise<T>): Promise<T> {
    const result = thumbnailQueue.then(job);
    // A failed job must not stall the ones queued behind it.
    thumbnailQueue = result.catch(() => undefined);
    return result;
}

/** Frees the full-size decode and the thumbnail bitmap as soon as the file is written, since the garbage collector can't see native memory. */
function renderThumbnail(sourceUri: string, maxWidth: number): Promise<string> {
    const manipulatorContext = ImageManipulator.manipulate(sourceUri).resize({width: maxWidth});
    return manipulatorContext
        .renderAsync()
        .then((image) => image.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG}).finally(() => releaseQuietly(image)))
        .then((result) => result.uri)
        .finally(() => releaseQuietly(manipulatorContext));
}

function generateThumbnail(sourceUri: string, {maxWidth = THUMBNAIL_MAX_WIDTH, shouldSkip}: GenerateThumbnailOptions = {}): Promise<string | undefined> {
    return enqueueThumbnailJob(() => {
        if (shouldSkip?.()) {
            return Promise.resolve(undefined);
        }
        return renderThumbnail(sourceUri, maxWidth);
    }).catch((error) => {
        Log.warn(`Failed to generate thumbnail: ${error}`);
        return undefined;
    });
}

export type {ImageObject};
export {calculateCropRect, cropImageToAspectRatio, generateThumbnail};
