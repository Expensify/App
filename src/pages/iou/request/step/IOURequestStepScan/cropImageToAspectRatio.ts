import ImageSize from 'react-native-image-size';
import type {Orientation} from 'react-native-vision-camera';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import getDeviceOrientationAwareImageSize from '@libs/cropOrRotateImage/getDeviceOrientationAwareImageSize';
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
                rotation,
            } = getDeviceOrientationAwareImageSize({imageSize, orientation, aspectRatioWidth, aspectRatioHeight});

            if (!imageWidth || !imageHeight || !ratioWidth || !ratioHeight) {
                return image;
            }

            const crop = calculateCropRect(imageWidth, imageHeight, ratioWidth, ratioHeight, shouldAlignTop);
            const croppedFilename = `receipt_cropped_${Date.now()}.jpeg`;

            // On Android, when EXIF rotation of 90° or 270° is detected, the image loader (Glide)
            // may or may not auto-apply the rotation depending on the device. We normalize the
            // image first to strip EXIF metadata, then check whether rotation was already applied
            // by comparing pixel dimensions, and act accordingly. We only handle 90/270 because
            // 180° rotation doesn't swap dimensions, making auto-rotation undetectable.
            if (rotation === 90 || rotation === 270) {
                const tempFilename = `receipt_normalized_${Date.now()}.jpeg`;
                return cropOrRotateImage(image.source, [], {compress: 1, name: tempFilename, type: IMAGE_TYPE}).then((normalizedImage) => {
                    if (!normalizedImage?.uri) {
                        return image;
                    }
                    return ImageSize.getSize(normalizedImage.uri).then((normalizedSize) => {
                        // If the normalized image dimensions differ from the raw dimensions,
                        // the image loader already applied EXIF rotation during normalization.
                        const wasAutoRotated = normalizedSize.width !== imageSize.width || normalizedSize.height !== imageSize.height;

                        const cropPromise = wasAutoRotated
                            ? cropOrRotateImage(
                                  normalizedImage.uri,
                                  [{crop: calculateCropRect(normalizedSize.width, normalizedSize.height, ratioWidth, ratioHeight, shouldAlignTop)}],
                                  {compress: 1, name: croppedFilename, type: IMAGE_TYPE},
                              )
                            : cropOrRotateImage(normalizedImage.uri, [{rotate: rotation}, {crop}], {compress: 1, name: croppedFilename, type: IMAGE_TYPE});

                        return cropPromise.then((croppedImage) => {
                            if (!croppedImage?.uri || !croppedImage?.name) {
                                return image;
                            }
                            return {file: croppedImage, filename: croppedImage.name, source: croppedImage.uri};
                        });
                    });
                });
            }

            return cropOrRotateImage(image.source, [{crop}], {compress: 1, name: croppedFilename, type: IMAGE_TYPE}).then((croppedImage) => {
                if (!croppedImage?.uri || !croppedImage?.name) {
                    return image;
                }
                return {file: croppedImage, filename: croppedImage.name, source: croppedImage.uri};
            });
        })
        .catch(() => image);
}

export type {ImageObject};
export {calculateCropRect, cropImageToAspectRatio};
