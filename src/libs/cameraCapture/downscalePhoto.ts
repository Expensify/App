/**
 * Shrinks a captured photo to the camera's target resolution. VisionCamera v5 treats `targetResolution` as a hint, so
 * some Android devices return a full-sensor photo that is too big for flows with tight size limits, like avatars.
 */
import {JPEG_QUALITY} from '@libs/fileDownload/FileUtils';
import getPhotoSource from '@libs/fileDownload/getPhotoSource';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';

import type CapturedPhoto from './types';

import releaseQuietly from './releaseQuietly';

const MAX_LONG_EDGE = Math.max(CONST.RECEIPT_CAMERA.PHOTO_WIDTH, CONST.RECEIPT_CAMERA.PHOTO_HEIGHT);

type PhotoSize = {
    width: number;
    height: number;
};

function getDownscaledSize({width, height}: PhotoSize): PhotoSize | undefined {
    const longEdge = Math.max(width, height);
    if (longEdge <= MAX_LONG_EDGE) {
        return undefined;
    }
    const scale = MAX_LONG_EDGE / longEdge;
    return {width: Math.round(width * scale), height: Math.round(height * scale)};
}

function downscalePhoto(photo: CapturedPhoto): Promise<CapturedPhoto | undefined> {
    const size = getDownscaledSize(photo);
    if (!size) {
        return Promise.resolve(undefined);
    }

    // The manipulator applies the file's rotation metadata while decoding, so resize in the display frame `photo` reports.
    const context = ImageManipulator.manipulate(getPhotoSource(photo.path)).resize(size);
    return context
        .renderAsync()
        .then((image) => image.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG}).finally(() => releaseQuietly(image)))
        .then((result) => {
            Log.info('[downscalePhoto] shrank the captured photo', false, {
                source: `${photo.width}x${photo.height}`,
                result: `${result.width}x${result.height}`,
            });
            return {path: result.uri, width: result.width, height: result.height, orientation: photo.orientation};
        })
        .finally(() => releaseQuietly(context));
}

export default downscalePhoto;
export {getDownscaledSize};
