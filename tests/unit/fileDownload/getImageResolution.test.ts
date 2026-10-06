import type * as GetImageResolutionModule from '@libs/fileDownload/getImageResolution';

const getImageResolution = jest.requireActual<typeof GetImageResolutionModule>('../../../src/libs/fileDownload/getImageResolution.ts').default;

const images: TestImage[] = [];

class TestImage {
    naturalWidth = 640;

    naturalHeight = 480;

    onload: (() => void) | null = null;

    onerror: ((reason: Error) => void) | null = null;

    src = '';

    constructor() {
        images.push(this);
    }
}

describe('getImageResolution', () => {
    const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
    const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    const createObjectURL = jest.fn(() => 'blob:test-image');
    const revokeObjectURL = jest.fn();

    beforeEach(() => {
        images.length = 0;
        createObjectURL.mockClear();
        revokeObjectURL.mockClear();
        Object.defineProperty(globalThis, 'Image', {
            configurable: true,
            value: TestImage,
        });
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: createObjectURL});
        Object.defineProperty(URL, 'revokeObjectURL', {configurable: true, value: revokeObjectURL});
    });

    afterEach(() => {
        if (originalImage) {
            Object.defineProperty(globalThis, 'Image', originalImage);
        }
        if (originalCreateObjectURL) {
            Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
        } else {
            Reflect.deleteProperty(URL, 'createObjectURL');
        }
        if (originalRevokeObjectURL) {
            Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
        } else {
            Reflect.deleteProperty(URL, 'revokeObjectURL');
        }
    });

    it('rejects a non-File input before creating an image', async () => {
        // Given a native-style asset without a browser File
        // When the web helper receives it
        // Then it rejects before allocating an object URL or image
        await expect(getImageResolution({uri: 'image.jpg'})).rejects.toThrow('Object is not an instance of File');
        expect(images).toHaveLength(0);
        expect(createObjectURL).not.toHaveBeenCalled();
    });

    it('reads the loaded image and resolves before revoking its object URL', async () => {
        // Given a browser File and an image whose natural dimensions differ from defaults
        // When its load handler runs with the image as receiver
        // Then the resolution uses that image before the object URL is revoked
        const file = new File(['pixels'], 'image.png', {type: 'image/png'});
        const resolution = getImageResolution(file);
        const events: string[] = [];
        const observedResolution = resolution.then((value) => {
            events.push('resolved');
            return value;
        });
        revokeObjectURL.mockImplementationOnce(() =>
            Promise.resolve().then(() => {
                events.push('revoked');
            }),
        );
        const image = images.at(0);
        if (!image?.onload) {
            throw new Error('Expected the image load handler');
        }
        expect(createObjectURL).toHaveBeenCalledWith(file);
        expect(image.src).toBe('blob:test-image');
        image.naturalWidth = 720;
        image.naturalHeight = 405;
        image.onload();
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-image');
        await expect(observedResolution).resolves.toEqual({width: 720, height: 405});
        expect(events).toEqual(['resolved', 'revoked']);
    });

    it('rejects when the image load fails', async () => {
        // Given a File whose image cannot load
        // When the error handler receives the failure
        // Then the pending resolution rejects with that same failure
        const resolution = getImageResolution(new File(['bad'], 'image.png'));
        const image = images.at(0);
        if (!image?.onerror) {
            throw new Error('Expected the image error handler');
        }
        const error = new Error('image failed');
        image.onerror(error);
        await expect(resolution).rejects.toBe(error);
    });
});
