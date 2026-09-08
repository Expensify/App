import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';

/**
 * Turns a full-resolution camera still upright before it replaces a scanned receipt.
 */

type StillSize = {
    /** Pixel width of the still as it sits on disk */
    width: number;

    /** Pixel height of the still as it sits on disk */
    height: number;

    /** Clockwise degrees the file's metadata asks for, which only Android reports */
    rotation?: number;
};

/**
 * Clockwise degrees to turn the still by, or `undefined` to keep the file as captured.
 *
 * Measure the frame the way the image loader hands it over, since the loader applies the file's rotation
 * metadata while decoding. Verified on device: a 1920x1440 still whose metadata asks for 90 decodes as
 * 1440x1920, so rotating it again put it back on its side.
 *
 * A returned `0` is not a no-op. Re-encoding bakes the rotation into the pixels and drops the tag, which
 * the confirmation preview and the receipt on the server both ignore.
 */
function getUprightRotation({width, height, rotation = 0}: StillSize): number | undefined {
    const isSideways = rotation === 90 || rotation === 270;
    const decodedWidth = isSideways ? height : width;
    const decodedHeight = isSideways ? width : height;

    // This upgrade only runs on the portrait `takeSnapshot` path, since landscape captures go through
    // `takePhoto`. So a frame that decodes landscape has no rotation recorded and needs the sensor's turn.
    const angle = decodedWidth > decodedHeight ? 90 : 0;

    if (!angle && !rotation) {
        // Upright already, with nothing in metadata to bake in, so re-encoding would only lose quality.
        return undefined;
    }

    return angle;
}

/**
 * Bakes the rotation of a full-resolution camera still into its pixels. Rejects instead of falling back to
 * the still as captured, since a receipt lying on its side is worse than the snapshot the caller has.
 *
 * @returns path of an upright temporary copy, or `undefined` when the still needs no turn
 */
function rotateStillToUpright(stillPath: string): Promise<string | undefined> {
    const sourceUri = getPhotoSource(stillPath);

    return ImageSize.getSize(sourceUri).then((imageSize) => {
        const angle = getUprightRotation(imageSize);
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
            .then((result) => result.uri);
    });
}

export default rotateStillToUpright;
export {getUprightRotation};
