import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import Log from '@libs/Log';

import type {Orientation} from 'react-native-vision-camera';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';

/**
 * Turns a full-resolution camera photo upright before it replaces a scanned receipt.
 */

type PhotoSize = {
    /** Pixel width of the photo as it sits on disk */
    width: number;

    /** Pixel height of the photo as it sits on disk */
    height: number;

    /** Clockwise degrees the file's metadata asks for, which only Android reports */
    rotation?: number;
};

/**
 * Clockwise degrees to turn the photo by, or `undefined` to keep the file as captured.
 *
 * Measure the frame the way the image loader hands it over, since the loader applies the file's rotation
 * metadata while decoding: a 1920x1440 photo whose metadata asks for 90 decodes as 1440x1920, and turning
 * that again puts it back on its side.
 */
function getUprightRotation({width, height, rotation = 0}: PhotoSize, orientation?: Orientation): number | undefined {
    const isSideways = rotation === 90 || rotation === 270;
    const decodedWidth = isSideways ? height : width;
    const decodedHeight = isSideways ? width : height;

    // This upgrade only runs on the portrait path, so a frame that decodes landscape carries no rotation
    // and needs the sensor's turn. Only a quarter-turn makes it portrait, so the hold picks the direction.
    //
    // `PhotoFile.orientation` is the display orientation relative to the sensor, as a counter-clockwise
    // angle (see VisionCamera's `RotationHelper`): a portrait capture off a landscape sensor reports
    // `landscape-left`, so 270 counter-clockwise, so 90 clockwise. The opposite hold turns the other way.
    const quarterTurn = orientation === 'landscape-right' ? 270 : 90;
    const angle = decodedWidth > decodedHeight ? quarterTurn : 0;

    if (!angle) {
        return undefined;
    }

    return angle;
}

/**
 * Bakes the rotation of a full-resolution camera photo into its pixels. Rejects instead of falling back to
 * the photo as captured, since a receipt lying on its side is worse than the snapshot the caller has.
 *
 * @param orientation decides the direction of a quarter-turn
 * @returns path of an upright temporary copy, or `undefined` when the photo needs no turn
 */
function rotatePhotoToUpright(stillPath: string, orientation?: Orientation): Promise<string | undefined> {
    const sourceUri = getPhotoSource(stillPath);
    const startedAt = Date.now();

    return ImageSize.getSize(sourceUri).then((imageSize) => {
        const angle = getUprightRotation(imageSize, orientation);
        if (angle === undefined) {
            return undefined;
        }

        const context = ImageManipulator.manipulate(sourceUri);
        if (angle) {
            context.rotate(angle);
        }

        return context
            .renderAsync()
            .then((image) => image.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG}))
            .then((result) => {
                // Reached only by a photo that genuinely decoded on its side, so `durationMs` is what
                // `ROTATE_TIMEOUT_MS` has to cover.
                Log.info('[PhotoUpgrade] rotated the full-resolution photo', false, {
                    durationMs: Date.now() - startedAt,
                    angle,
                    exifRotation: imageSize.rotation,
                    source: `${imageSize.width}x${imageSize.height}`,
                });
                return result.uri;
            });
    });
}

export default rotatePhotoToUpright;
export {getUprightRotation};
