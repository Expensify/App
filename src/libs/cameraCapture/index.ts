import fileURIToPath from '@libs/fileURIToPath';

import type {CameraOrientation, CameraPhotoOutput, CameraRef, CapturePhotoSettings, Photo} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import type CapturedPhoto from './types';

const SNAPSHOT_JPEG_QUALITY = 85;

function isSideways(orientation: CameraOrientation) {
    return orientation === 'left' || orientation === 'right';
}

// `Photo` reports the sensor buffer's size; the saved JPEG carries the rotation in its metadata.
function getDisplaySize(photo: Photo) {
    return isSideways(photo.orientation) ? {width: photo.height, height: photo.width} : {width: photo.width, height: photo.height};
}

// `Photo.saveToFileAsync` neither strips `file://` nor creates the folder.
function preparePath(filePath: string) {
    const path = fileURIToPath(filePath);
    return RNFS.mkdir(path.slice(0, path.lastIndexOf('/'))).then(() => path);
}

/**
 * Starts a Nitro call inside a promise, so a synchronous throw (as from `takeSnapshot`) becomes a rejection.
 *
 * Followed with `.then`, not `await`: with a frame output running on a worklet runtime, an `await` on a Nitro promise
 * resumed with `undefined` before the native call finished on Android, while `.then` received the result.
 */
function fromNitro<T>(start: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        start().then(resolve, reject);
    });
}

/** Takes a full photo and writes it to `filePath`, or to a temporary file. */
function capturePhotoToPath(photoOutput: CameraPhotoOutput, settings: CapturePhotoSettings, filePath?: string): Promise<CapturedPhoto> {
    return fromNitro(() => photoOutput.capturePhoto(settings, {})).then((photo) => {
        const save = filePath ? preparePath(filePath).then((path) => fromNitro(() => photo.saveToFileAsync(path)).then(() => path)) : fromNitro(() => photo.saveToTemporaryFileAsync());

        return save
            .then((path) => ({path, ...getDisplaySize(photo)}))
            .finally(() => {
                photo.dispose();
            });
    });
}

/** Android only: VisionCamera v5's `takeSnapshot` throws on iOS, and throws synchronously before the preview attaches. */
function captureSnapshotToPath(camera: CameraRef, filePath: string): Promise<CapturedPhoto> {
    const path = fileURIToPath(filePath);
    return fromNitro(() => camera.takeSnapshot()).then((image) =>
        fromNitro(() => image.saveToFileAsync(path, 'jpg', SNAPSHOT_JPEG_QUALITY))
            .then(() => ({path, width: image.width, height: image.height}))
            .finally(() => {
                image.dispose();
            }),
    );
}

export {capturePhotoToPath, captureSnapshotToPath};
