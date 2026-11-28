import fileURIToPath from '@libs/fileURIToPath';

import type {Image} from 'react-native-nitro-image';
import type {CameraOrientation, CameraPhotoOutput, CameraRef, CapturePhotoCallbacks, CapturePhotoSettings, Photo} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import type CapturedPhoto from './types';
import type {TransformImage} from './types';

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

type SavedImage = {
    width: number;
    height: number;
    orientation?: CameraOrientation;
};

/**
 * Saves the transformed image, or the capture as taken through `saveUnchanged` when the transform changed nothing. The
 * captured image is freed only once the save and the transform are both done with it: a transform that hit its time
 * limit may still be reading it natively, and freeing a bitmap native code is reading crashes on Android.
 */
function transformAndSave(
    image: Image,
    transformImage: TransformImage,
    path: string,
    saveUnchanged: () => Promise<SavedImage>,
): Promise<SavedImage & {transformDurationMs: number; isTransformed: boolean}> {
    const startedAt = performance.now();
    return callAsPromise(() => transformImage(image)).then(
        ({image: transformed, sourceReleased}) => {
            const transformDurationMs = Math.round(performance.now() - startedAt);
            const save = transformed
                ? callAsPromise(() => transformed.saveToFileAsync(path, 'jpg', SNAPSHOT_JPEG_QUALITY))
                      .then(() => ({width: transformed.width, height: transformed.height}))
                      .finally(() => {
                          transformed.dispose();
                      })
                : saveUnchanged();
            Promise.allSettled([sourceReleased, save]).then(() => {
                image.dispose();
            });
            return save.then((saved) => ({...saved, transformDurationMs, isTransformed: !!transformed}));
        },
        (error: unknown) => {
            image.dispose();
            throw error;
        },
    );
}

function capturePhotoToPath(
    photoOutput: CameraPhotoOutput,
    settings: CapturePhotoSettings,
    filePath?: string,
    callbacks: CapturePhotoCallbacks = {},
    transformImage?: TransformImage,
    onPhotoTaken?: () => void,
): Promise<CapturedPhoto> {
    const captureStartedAt = performance.now();
    return callAsPromise(() => photoOutput.capturePhoto(settings, callbacks)).then((photo): Promise<CapturedPhoto> => {
        onPhotoTaken?.();
        const capturedAt = performance.now();
        if (filePath && transformImage) {
            return preparePath(filePath)
                .then((path) => {
                    const saveUnchanged = () => callAsPromise(() => photo.saveToFileAsync(path)).then(() => ({...getDisplaySize(photo), orientation: photo.orientation}));
                    // A photo that can't be decoded, as when memory runs short, is still saved as taken rather than lost.
                    const transformed = callAsPromise(() => photo.toImageAsync()).then(
                        (image) => transformAndSave(image, transformImage, path, saveUnchanged),
                        () => saveUnchanged().then((saved) => ({...saved, transformDurationMs: 0, isTransformed: false})),
                    );
                    return transformed.then((result) => ({
                        path,
                        width: result.width,
                        height: result.height,
                        orientation: result.orientation,
                        captureDurationMs: Math.round(capturedAt - captureStartedAt),
                        transformDurationMs: result.transformDurationMs,
                        saveDurationMs: Math.round(performance.now() - capturedAt) - result.transformDurationMs,
                        isTransformed: result.isTransformed,
                    }));
                })
                .finally(() => {
                    photo.dispose();
                });
        }

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
function captureSnapshotToPath(camera: CameraRef, filePath: string, transformImage?: TransformImage): Promise<CapturedPhoto> {
    const path = fileURIToPath(filePath);
    const captureStartedAt = performance.now();
    return callAsPromise(() => camera.takeSnapshot()).then((image): Promise<CapturedPhoto> => {
        const saveStartedAt = performance.now();
        if (transformImage) {
            const saveUnchanged = () => callAsPromise(() => image.saveToFileAsync(path, 'jpg', SNAPSHOT_JPEG_QUALITY)).then(() => ({width: image.width, height: image.height}));
            return transformAndSave(image, transformImage, path, saveUnchanged).then((result) => ({
                path,
                width: result.width,
                height: result.height,
                captureDurationMs: Math.round(saveStartedAt - captureStartedAt),
                transformDurationMs: result.transformDurationMs,
                saveDurationMs: Math.round(performance.now() - saveStartedAt) - result.transformDurationMs,
                isTransformed: result.isTransformed,
            }));
        }
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
