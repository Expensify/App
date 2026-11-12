/**
 * Rotates a captured still so the receipt reads upright. Returns undefined when the photo is already upright.
 */
import releaseQuietly from '@libs/cameraCapture/releaseQuietly';
import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import Log from '@libs/Log';

import type {CameraOrientation} from 'react-native-vision-camera';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';

type PhotoSize = {
    width: number;
    height: number;
    rotation?: number;
};

function getUprightRotation({width, height, rotation = 0}: PhotoSize, orientation?: CameraOrientation): number | undefined {
    // The image loader applies the file's rotation metadata while decoding, so measure the frame the way it
    // hands it over: a 1920x1440 photo whose metadata asks for 90 decodes as 1440x1920.
    const isSideways = rotation === 90 || rotation === 270;
    const decodedWidth = isSideways ? height : width;
    const decodedHeight = isSideways ? width : height;

    // VisionCamera v5 writes the rotation into the file, so this only catches a still saved without it. The size alone
    // can't tell a quarter turn from three quarters, so follow the capture's orientation: CameraX reports a 90 degree
    // turn as 'left' and 270 as 'right'.
    if (decodedWidth <= decodedHeight) {
        return undefined;
    }
    return orientation === 'right' ? 270 : 90;
}

function rotatePhotoToUpright(stillPath: string, orientation?: CameraOrientation): Promise<string | undefined> {
    const sourceUri = getPhotoSource(stillPath);
    const startedAt = Date.now();

    return ImageSize.getSize(sourceUri).then((imageSize) => {
        const angle = getUprightRotation(imageSize, orientation);
        if (angle === undefined) {
            return undefined;
        }

        const context = ImageManipulator.manipulate(sourceUri).rotate(angle);
        return context
            .renderAsync()
            .then((image) => image.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG}).finally(() => releaseQuietly(image)))
            .then((result) => {
                Log.info('[PhotoUpgrade] rotated the full-resolution photo', false, {
                    durationMs: Date.now() - startedAt,
                    angle,
                    exifRotation: imageSize.rotation,
                    source: `${imageSize.width}x${imageSize.height}`,
                });
                return result.uri;
            })
            .finally(() => releaseQuietly(context));
    });
}

export default rotatePhotoToUpright;
export {getUprightRotation};
