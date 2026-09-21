import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import Log from '@libs/Log';

import type {Orientation} from 'react-native-vision-camera';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import ImageSize from 'react-native-image-size';

type PhotoSize = {
    width: number;

    height: number;

    rotation?: number;
};

function getUprightRotation({width, height, rotation = 0}: PhotoSize, orientation?: Orientation): number | undefined {
    // The image loader applies the file's rotation metadata while decoding, so measure the frame the way it
    // hands it over: a 1920x1440 photo whose metadata asks for 90 decodes as 1440x1920.
    const isSideways = rotation === 90 || rotation === 270;
    const decodedWidth = isSideways ? height : width;
    const decodedHeight = isSideways ? width : height;

    // VisionCamera's `PhotoFile.orientation` is the display orientation relative to the sensor, as a
    // counter-clockwise angle (see its `RotationHelper`): a portrait capture off a landscape sensor reports
    // `landscape-left`, so 270 counter-clockwise, so 90 clockwise. The opposite hold turns the other way.
    const quarterTurn = orientation === 'landscape-right' ? 270 : 90;
    const angle = decodedWidth > decodedHeight ? quarterTurn : 0;

    if (!angle) {
        return undefined;
    }

    return angle;
}

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
