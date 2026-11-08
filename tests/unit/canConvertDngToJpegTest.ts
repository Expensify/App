import type * as NativeModule from '@libs/fileDownload/canConvertDngToJpeg/index.native.ts';
import type * as WebModule from '@libs/fileDownload/canConvertDngToJpeg/index.ts';

/**
 * `validateAttachmentFile` routes a DNG into conversion or rejects it as an invalid type based solely on this flag,
 * so each platform variant is pinned here. Jest resolves the bare specifier to the native file, hence the explicit paths.
 */
describe('canConvertDngToJpeg', () => {
    it('is true on native, where the OS image loader can decode a DNG', () => {
        // Given the native variant of the module
        const {default: canConvertDngToJpeg} = jest.requireActual<typeof NativeModule>('@libs/fileDownload/canConvertDngToJpeg/index.native.ts');

        // Then a picked DNG is transcoded to JPEG rather than rejected
        expect(canConvertDngToJpeg).toBe(true);
    });

    it('is false on web and desktop, where browsers cannot decode a DNG', () => {
        // Given the web variant of the module
        const {default: canConvertDngToJpeg} = jest.requireActual<typeof WebModule>('@libs/fileDownload/canConvertDngToJpeg/index.ts');

        // Then a DNG is rejected as an invalid file type since there is no way to convert it
        expect(canConvertDngToJpeg).toBe(false);
    });
});
