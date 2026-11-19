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

let nowSpy: jest.SpyInstance<number, []> | undefined;

// Restores only the clock, since jest.restoreAllMocks would also wipe the react-native-fs mock above.
afterEach(() => {
    nowSpy?.mockRestore();
    nowSpy = undefined;
});

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

    it('reports the snapshot time and the file write time separately', async () => {
        // Given a clock where the snapshot returns 20ms after the call and the JPEG write takes 30ms more
        nowSpy = jest.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(20).mockReturnValueOnce(50);
        const dispose = jest.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements takeSnapshot, which is all captureSnapshotToPath calls
        const camera = {
            takeSnapshot: () => Promise.resolve({width: 1440, height: 1920, saveToFileAsync: jest.fn(() => Promise.resolve()), dispose}),
        } as unknown as CameraRef;

        // When a snapshot is captured
        const result = await captureSnapshotToPath(camera, '/receipts/receipt.jpg');

        // Then both phases are reported and the native image is released
        expect(result.captureDurationMs).toBe(20);
        expect(result.saveDurationMs).toBe(30);
        expect(dispose).toHaveBeenCalledTimes(1);
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
        expect(result).toMatchObject({path: '/receipts/receipt.jpg', width: 3024, height: 4032, orientation: 'right'});
        expect(typeof result.captureDurationMs).toBe('number');
        expect(typeof result.saveDurationMs).toBe('number');
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    it('reports the camera time and the file write time separately', async () => {
        // Given a clock where the camera returns the photo 60.4ms after the call, creating the folder takes 5ms,
        // and the write takes 15.2ms more, so the scan span can tell a slow camera from a slow disk
        nowSpy = jest.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(160.4).mockReturnValueOnce(165.4).mockReturnValueOnce(180.6);
        const {photo} = createPhoto();
        const output = createOutput(() => Promise.resolve(photo));

        // When a photo is captured into the receipts folder
        const result = await capturePhotoToPath(output, {flashMode: 'off'}, 'file:///receipts/receipt.jpg');

        // Then each phase is reported on its own in whole milliseconds, and the folder creation counts toward neither
        expect(result.captureDurationMs).toBe(60);
        expect(result.saveDurationMs).toBe(15);
    });
});
