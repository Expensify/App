import {capturePhotoToPath, captureSnapshotToPath} from '@libs/cameraCapture';

import type {Image} from 'react-native-nitro-image';
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

describe('capture with a transform', () => {
    function createImage(width: number, height: number) {
        const image = {width, height, saveToFileAsync: jest.fn(() => Promise.resolve()), dispose: jest.fn()};
        return image;
    }

    it('keeps the source image alive until the transform has stopped reading it', async () => {
        // Given a snapshot whose transform gives up waiting before its native work is done, as a crop that hits its time limit does
        const source = createImage(1440, 1920);
        let releaseSource: () => void = () => {};
        const sourceReleased = new Promise<void>((resolve) => {
            releaseSource = resolve;
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements takeSnapshot
        const camera = {takeSnapshot: () => Promise.resolve(source)} as unknown as CameraRef;

        // When the capture is saved while the transform is still reading the source
        const result = await captureSnapshotToPath(camera, '/receipts/receipt.jpg', () => Promise.resolve({image: undefined, sourceReleased}));

        // Then the source is not freed yet, because freeing a bitmap native code is reading crashes on Android
        expect(result.isTransformed).toBe(false);
        expect(source.dispose).not.toHaveBeenCalled();

        // When the transform finally lets go of it
        releaseSource();
        await sourceReleased;
        await Promise.resolve();

        // Then the source is freed
        expect(source.dispose).toHaveBeenCalled();
    });

    it('saves the camera file as taken when the transform changed nothing', async () => {
        // Given a photo whose transform finds nothing to crop
        const {photo, saveToFileAsync} = createPhoto();
        const decoded = createImage(3024, 4032);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements the members the capture uses
        const photoWithImage = Object.assign(photo, {toImageAsync: () => Promise.resolve(decoded)}) as unknown as Photo;

        // When the photo is captured with the transform
        const result = await capturePhotoToPath(
            createOutput(() => Promise.resolve(photoWithImage)),
            {},
            '/receipts/receipt.jpg',
            {},
            () => Promise.resolve({image: undefined, sourceReleased: Promise.resolve()}),
        );

        // Then the camera's own file is written, keeping its full quality and metadata, instead of a re-encoded copy
        expect(saveToFileAsync).toHaveBeenCalledWith('/receipts/receipt.jpg');
        expect(decoded.saveToFileAsync).not.toHaveBeenCalled();
        expect(result).toMatchObject({width: 3024, height: 4032, orientation: 'right', isTransformed: false});
    });

    it('saves the transformed image and frees both images when the transform changed it', async () => {
        // Given a snapshot whose transform returns a cropped image
        const source = createImage(1440, 1920);
        const cropped = createImage(700, 1200);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements takeSnapshot
        const camera = {takeSnapshot: () => Promise.resolve(source)} as unknown as CameraRef;

        // When the capture is saved
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements the members the save uses
        const croppedImage = cropped as unknown as Image;
        const result = await captureSnapshotToPath(camera, '/receipts/receipt.jpg', () => Promise.resolve({image: croppedImage, sourceReleased: Promise.resolve()}));
        await Promise.resolve();

        // Then the cropped image is the saved receipt, and neither image is kept in memory afterwards
        expect(cropped.saveToFileAsync).toHaveBeenCalled();
        expect(source.saveToFileAsync).not.toHaveBeenCalled();
        expect(result).toMatchObject({width: 700, height: 1200, isTransformed: true});
        expect(cropped.dispose).toHaveBeenCalled();
        expect(source.dispose).toHaveBeenCalled();
    });

    it('saves the camera file as taken when the photo cannot be decoded for the transform', async () => {
        // Given a photo that fails to decode, as when the phone is short of memory
        const {photo, saveToFileAsync} = createPhoto();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements the members the capture uses
        const photoWithImage = Object.assign(photo, {toImageAsync: () => Promise.reject(new Error('out of memory'))}) as unknown as Photo;
        const transformImage = jest.fn();

        // When the photo is captured with a transform
        const result = await capturePhotoToPath(
            createOutput(() => Promise.resolve(photoWithImage)),
            {},
            '/receipts/receipt.jpg',
            {},
            transformImage,
        );

        // Then the shot is kept as the camera took it instead of failing the capture
        expect(transformImage).not.toHaveBeenCalled();
        expect(saveToFileAsync).toHaveBeenCalledWith('/receipts/receipt.jpg');
        expect(result).toMatchObject({width: 3024, height: 4032, isTransformed: false});
    });
});
