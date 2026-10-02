import fileURIToPath from '@libs/fileURIToPath';

import type {CameraOrientation, CameraPhotoOutput, CameraRef, CapturePhotoSettings, Photo} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import type CapturedPhoto from './types';

const SNAPSHOT_JPEG_QUALITY = 85;

function isSideways(orientation: CameraOrientation) {
    return orientation === 'left' || orientation === 'right';
}

// `Photo` reports the sensor buffer's size; the saved JPEG carries the rotation in EXIF.
function getDisplaySize(photo: Photo) {
    return isSideways(photo.orientation) ? {width: photo.height, height: photo.width} : {width: photo.width, height: photo.height};
}

// `Photo.saveToFileAsync` neither strips `file://` nor creates the folder.
function preparePath(filePath: string) {
    const path = fileURIToPath(filePath);
    return RNFS.mkdir(path.slice(0, path.lastIndexOf('/'))).then(() => path);
}

/**
 * Takes a full photo and writes it to `filePath`, or to a temporary file.
 *
 * Chained with `.then`, not `await`: on Android (Hermes) an `await` on a Nitro promise resumed with `undefined` before
 * the native capture finished, while `.then` on the same promise received the result.
 */
function capturePhotoToPath(photoOutput: CameraPhotoOutput, settings: CapturePhotoSettings, filePath?: string): Promise<CapturedPhoto> {
    return photoOutput.capturePhoto(settings, {}).then((photo) => {
        const save = filePath ? preparePath(filePath).then((path) => photo.saveToFileAsync(path).then(() => path)) : photo.saveToTemporaryFileAsync();

        return save
            .then((path) => ({path, ...getDisplaySize(photo)}))
            .finally(() => {
                photo.dispose();
            });
    });
}

/** Android only: VisionCamera v5's `takeSnapshot` throws on iOS. */
function captureSnapshotToPath(camera: CameraRef, filePath: string): Promise<CapturedPhoto> {
    const path = fileURIToPath(filePath);
    return camera.takeSnapshot().then((image) =>
        image
            .saveToFileAsync(path, 'jpg', SNAPSHOT_JPEG_QUALITY)
            .then(() => ({path, width: image.width, height: image.height}))
            .finally(() => {
                image.dispose();
            }),
    );
}

export {capturePhotoToPath, captureSnapshotToPath};
