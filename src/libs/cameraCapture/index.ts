import fileURIToPath from '@libs/fileURIToPath';

import type {CameraOrientation, CameraPhotoOutput, CameraRef, CapturePhotoCallbacks, CapturePhotoSettings, Photo} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import type CapturedPhoto from './types';

const SNAPSHOT_JPEG_QUALITY = 85;

function isSideways(orientation: CameraOrientation) {
    return orientation === 'left' || orientation === 'right';
}

// `Photo` reports the sensor buffer's size. The saved JPEG carries the rotation in its metadata.
function getDisplaySize(photo: Photo) {
    return isSideways(photo.orientation) ? {width: photo.height, height: photo.width} : {width: photo.width, height: photo.height};
}

// `Photo.saveToFileAsync` neither strips `file://` nor creates the folder.
function preparePath(filePath: string) {
    const path = fileURIToPath(filePath);
    return RNFS.mkdir(path.slice(0, path.lastIndexOf('/'))).then(() => path);
}

/** Starts the call inside a promise, so a synchronous throw (as from `takeSnapshot`) becomes a rejection. */
function callAsPromise<T>(start: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        start().then(resolve, reject);
    });
}

function capturePhotoToPath(photoOutput: CameraPhotoOutput, settings: CapturePhotoSettings, filePath?: string, callbacks: CapturePhotoCallbacks = {}): Promise<CapturedPhoto> {
    const captureStartedAt = performance.now();
    return callAsPromise(() => photoOutput.capturePhoto(settings, callbacks)).then((photo) => {
        const capturedAt = performance.now();
        let saveStartedAt = capturedAt;
        // The save timer starts after the folder exists, so it measures only the file write, as on the snapshot path.
        const save = filePath
            ? preparePath(filePath).then((path) => {
                  saveStartedAt = performance.now();
                  return callAsPromise(() => photo.saveToFileAsync(path)).then(() => path);
              })
            : callAsPromise(() => photo.saveToTemporaryFileAsync());

        return save
            .then((path) => ({
                path,
                ...getDisplaySize(photo),
                orientation: photo.orientation,
                captureDurationMs: Math.round(capturedAt - captureStartedAt),
                saveDurationMs: Math.round(performance.now() - saveStartedAt),
            }))
            .finally(() => {
                photo.dispose();
            });
    });
}

/** Android only: VisionCamera v5's `takeSnapshot` throws on iOS, and throws synchronously before the preview attaches. */
function captureSnapshotToPath(camera: CameraRef, filePath: string): Promise<CapturedPhoto> {
    const path = fileURIToPath(filePath);
    const captureStartedAt = performance.now();
    return callAsPromise(() => camera.takeSnapshot()).then((image) => {
        const saveStartedAt = performance.now();
        return callAsPromise(() => image.saveToFileAsync(path, 'jpg', SNAPSHOT_JPEG_QUALITY))
            .then(() => ({
                path,
                width: image.width,
                height: image.height,
                captureDurationMs: Math.round(saveStartedAt - captureStartedAt),
                saveDurationMs: Math.round(performance.now() - saveStartedAt),
            }))
            .finally(() => {
                image.dispose();
            });
    });
}

export {capturePhotoToPath, captureSnapshotToPath};
