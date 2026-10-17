import {capturePhotoToPath, captureSnapshotToPath} from '@libs/cameraCapture';

import type {CameraPhotoOutput, CameraRef, Photo} from 'react-native-vision-camera';

jest.mock('react-native-fs', () => ({mkdir: jest.fn(() => Promise.resolve())}));

function createPhoto() {
    const saveToFileAsync = jest.fn(() => Promise.resolve());
    const dispose = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const photo = {
        width: 4032,
        height: 3024,
        orientation: 'right',
        saveToFileAsync,
        saveToTemporaryFileAsync: jest.fn(() => Promise.resolve('/tmp/photo.jpg')),
        dispose,
    } as unknown as Photo;
    return {photo, saveToFileAsync, dispose};
}

function createOutput(capturePhoto: () => Promise<Photo>): CameraPhotoOutput {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {capturePhoto} as unknown as CameraPhotoOutput;
}

describe('captureSnapshotToPath', () => {
    it('rejects instead of throwing when the preview is not attached yet', async () => {
        // Given a camera whose takeSnapshot throws synchronously, as VisionCamera v5 does before the preview attaches
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const camera = {
            takeSnapshot: () => {
                throw new Error('Camera Preview is not yet ready!');
            },
        } as unknown as CameraRef;

        // When a snapshot is captured
        const capture = captureSnapshotToPath(camera, '/receipts/receipt.jpg');

        // Then the error arrives as a rejection, so the caller's catch can reset the shutter and show the alert
        await expect(capture).rejects.toThrow('Camera Preview is not yet ready!');
    });
});

describe('capturePhotoToPath', () => {
    it('rejects instead of throwing when the capture fails synchronously', async () => {
        // Given a photo output that throws before it returns a promise
        const output = createOutput(() => {
            throw new Error('Photo Output is not yet attached');
        });

        // When a photo is captured
        const capture = capturePhotoToPath(output, {flashMode: 'off'});

        // Then the caller sees a rejection rather than an exception that skips its catch
        await expect(capture).rejects.toThrow('Photo Output is not yet attached');
    });

    it('saves to the given path, reports the displayed size and frees the photo', async () => {
        // Given a portrait capture, which the camera reports as a sideways sensor buffer
        const {photo, saveToFileAsync, dispose} = createPhoto();
        const output = createOutput(() => Promise.resolve(photo));

        // When it is captured into the receipts folder
        const result = await capturePhotoToPath(output, {flashMode: 'off'}, 'file:///receipts/receipt.jpg');

        // Then it is written to the plain path, sized as displayed, and its native buffer is released
        expect(saveToFileAsync).toHaveBeenCalledWith('/receipts/receipt.jpg');
        expect(result).toEqual({path: '/receipts/receipt.jpg', width: 3024, height: 4032});
        expect(dispose).toHaveBeenCalledTimes(1);
    });
});
