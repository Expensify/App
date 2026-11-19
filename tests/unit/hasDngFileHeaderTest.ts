import type * as WebModule from '@libs/fileDownload/hasDngFileHeader/index.ts';

// Jest resolves the bare specifier to the native file, so the web variant is loaded by its explicit path.
const {default: hasDngFileHeader} = jest.requireActual<typeof WebModule>('@libs/fileDownload/hasDngFileHeader/index.ts');

const LITTLE_ENDIAN_TIFF_HEADER = [0x49, 0x49, 0x2a, 0x00];
const BIG_ENDIAN_TIFF_HEADER = [0x4d, 0x4d, 0x00, 0x2a];
const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0];

/** jsdom's Blob has no `arrayBuffer()`, so `slice` is stubbed to hand back the requested range of `headerBytes`. */
function createFile(headerBytes: number[], name: string, type = '') {
    const file = new File([], name, {type});
    const slice = jest.spyOn(file, 'slice').mockImplementation((start, end) => {
        const range = Uint8Array.from(headerBytes).slice(start, end);
        return Object.assign(new Blob(), {arrayBuffer: () => Promise.resolve(range.buffer)});
    });
    return {file, slice};
}

describe('hasDngFileHeader (web)', () => {
    it.each([
        ['little-endian, renamed to .jpg', LITTLE_ENDIAN_TIFF_HEADER, 'IMG_0001.jpg', 'image/jpeg'],
        ['big-endian, without an extension', BIG_ENDIAN_TIFF_HEADER, 'IMG_0001', ''],
    ])('detects a DNG %s', async (description, headerBytes, name, type) => {
        // Given a DNG whose name and type don't say it is one
        const {file} = createFile(headerBytes, name, type);

        // When its header is checked
        const result = await hasDngFileHeader(file);

        // Then the TIFF signature gives it away
        expect(result).toBe(true);
    });

    it('reads only the 4 header bytes', async () => {
        // Given a picked file, which can be a 75 MB ProRAW
        const {file, slice} = createFile(LITTLE_ENDIAN_TIFF_HEADER, 'IMG_0001.jpg', 'image/jpeg');

        // When its header is checked
        await hasDngFileHeader(file);

        // Then only the signature range is read, never the whole file
        expect(slice).toHaveBeenCalledTimes(1);
        expect(slice).toHaveBeenCalledWith(0, 4);
    });

    it('ignores a file labelled as a TIFF without reading it', async () => {
        // Given a plain TIFF, which shares the DNG header but is an accepted format
        const {file, slice} = createFile(BIG_ENDIAN_TIFF_HEADER, 'scan.tiff', 'image/tiff');

        // When its header is checked
        const result = await hasDngFileHeader(file);

        // Then it is not treated as a DNG
        expect(result).toBe(false);
        expect(slice).not.toHaveBeenCalled();
    });

    it('ignores a real JPEG', async () => {
        // Given a JPEG
        const {file} = createFile(JPEG_HEADER, 'photo.jpg', 'image/jpeg');

        // When its header is checked
        const result = await hasDngFileHeader(file);

        // Then it is not treated as a DNG
        expect(result).toBe(false);
    });

    it('ignores a file object that is not a Blob', async () => {
        // Given a native-style file object, which carries a uri instead of bytes
        const file = {name: 'IMG_0001.jpg', uri: 'file:///IMG_0001.jpg'};

        // When its header is checked
        const result = await hasDngFileHeader(file);

        // Then there is nothing to read and it is not treated as a DNG
        expect(result).toBe(false);
    });
});
