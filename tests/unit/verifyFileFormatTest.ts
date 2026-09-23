import {verifyFileFormat} from '@libs/fileDownload/FileUtils';

import CONST from '@src/CONST';

import {Platform} from 'react-native';

const mockReadFile = jest.fn<Promise<string>, [string, string]>();
const mockSlice = jest.fn<Promise<string>, [string, string, number, number]>();
const mockUnlink = jest.fn<Promise<void>, [string]>();

jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {
        fs: {
            dirs: {CacheDir: '/cache'},
            readFile: (...args: [string, string]) => mockReadFile(...args),
            slice: (...args: [string, string, number, number]) => mockSlice(...args),
            unlink: (...args: [string]) => mockUnlink(...args),
        },
    },
}));

/** First 16 bytes of a file as a base64 string, the way the header read returns them. */
const headerBase64 = (bytes: number[]) => Buffer.from(bytes).toString('base64');

// 4-byte box size followed by 'ftypheic', the way a HEIC file starts.
const HEIC_HEADER = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63, 0x00, 0x00, 0x00, 0x00];
// 'II*\0' little-endian TIFF header, which is what an iPhone ProRAW DNG starts with.
const DNG_HEADER = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
// JFIF JPEG header.
const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01];

describe('verifyFileFormat', () => {
    let platformReplaceProperty: jest.ReplaceProperty<string>;

    beforeEach(() => {
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
        mockSlice.mockReset().mockImplementation((src, dest) => Promise.resolve(dest));
        mockUnlink.mockReset().mockResolvedValue(undefined);
        mockReadFile.mockReset().mockResolvedValue(headerBase64(JPEG_HEADER));
    });

    afterEach(() => {
        platformReplaceProperty.restore();
    });

    describe('reading the header on iOS', () => {
        it('slices the decoded POSIX path for an encoded file:// URI', async () => {
            // Given a percent-encoded file:// URI
            // When the format is verified
            await verifyFileFormat({fileUri: 'file:///var/mobile/Containers/Receipt%20%2342.mov', formatSignatures: CONST.HEIC_SIGNATURES});

            // Then the filesystem call gets the decoded path, since react-native-blob-util does not understand URIs
            expect(mockSlice).toHaveBeenCalledWith('/var/mobile/Containers/Receipt #42.mov', expect.stringContaining('/cache/file-header-'), 0, 16);
        });

        it('slices a raw path with only the scheme stripped when the URI is not percent-encoded', async () => {
            // Given a plain file:// URI
            // When the format is verified
            await verifyFileFormat({fileUri: 'file:///var/mobile/Containers/video.mov', formatSignatures: CONST.HEIC_SIGNATURES});

            // Then only the scheme is stripped
            expect(mockSlice).toHaveBeenCalledWith('/var/mobile/Containers/video.mov', expect.any(String), 0, 16);
        });

        it('reads only the sliced header rather than the whole file', async () => {
            // Given a large picked photo
            // When the format is verified
            await verifyFileFormat({fileUri: 'file:///var/mobile/Containers/IMG_0001.DNG', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET});

            // Then the 16-byte temp file is what gets read as base64, not the source, so a 25-75 MB ProRAW never lands in memory as a string
            const headerPath = mockSlice.mock.calls.at(0)?.at(1);
            expect(mockReadFile).toHaveBeenCalledTimes(1);
            expect(mockReadFile).toHaveBeenCalledWith(headerPath, 'base64');
            expect(mockReadFile).not.toHaveBeenCalledWith('/var/mobile/Containers/IMG_0001.DNG', 'base64');
        });

        it('removes the temp header file after reading it', async () => {
            // Given a successful header read
            // When the format is verified
            await verifyFileFormat({fileUri: 'file:///photo.heic', formatSignatures: CONST.HEIC_SIGNATURES});

            // Then the temp file is cleaned up so header reads don't accumulate in the cache directory
            const headerPath = mockSlice.mock.calls.at(0)?.at(1);
            expect(mockUnlink).toHaveBeenCalledWith(headerPath);
        });

        it('removes the temp header file even when reading it fails, and surfaces the error', async () => {
            // Given the header read rejects
            mockReadFile.mockRejectedValue(new Error('EACCES'));

            // When the format is verified
            // Then the error propagates so the caller can alert the user, and the temp file is still removed
            await expect(verifyFileFormat({fileUri: 'file:///photo.heic', formatSignatures: CONST.HEIC_SIGNATURES})).rejects.toThrow('EACCES');
            expect(mockUnlink).toHaveBeenCalledTimes(1);
        });

        it('ignores a failure to remove the temp header file', async () => {
            // Given the header is read fine but unlinking the temp file fails
            mockReadFile.mockResolvedValue(headerBase64(HEIC_HEADER));
            mockUnlink.mockRejectedValue(new Error('ENOENT'));

            // When the format is verified
            // Then cleanup failure doesn't affect the result
            await expect(verifyFileFormat({fileUri: 'file:///photo.heic', formatSignatures: CONST.HEIC_SIGNATURES})).resolves.toBe(true);
        });
    });

    describe('matching signatures', () => {
        it('recognizes HEIC from the ftyp box at offset 4 by default', async () => {
            // Given a HEIC header
            mockReadFile.mockResolvedValue(headerBase64(HEIC_HEADER));

            // When checked against the HEIC signatures without an explicit offset
            // Then it matches, preserving the behaviour existing callers rely on
            await expect(verifyFileFormat({fileUri: 'file:///photo.heic', formatSignatures: CONST.HEIC_SIGNATURES})).resolves.toBe(true);
        });

        it('recognizes a DNG from the TIFF header at offset 0', async () => {
            // Given a ProRAW DNG header, which react-native-image-picker would have labelled `.jpg`
            mockReadFile.mockResolvedValue(headerBase64(DNG_HEADER));

            // When checked against the TIFF signatures at their real offset
            // Then it matches
            await expect(verifyFileFormat({fileUri: 'file:///photo.jpg', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET})).resolves.toBe(true);
        });

        it('does not mistake a DNG for HEIC or a HEIC for TIFF', async () => {
            // Given a DNG header checked at the HEIC offset, and a HEIC header checked at the TIFF offset
            mockReadFile.mockResolvedValueOnce(headerBase64(DNG_HEADER)).mockResolvedValueOnce(headerBase64(HEIC_HEADER));

            // When each is verified against the other format
            // Then neither matches, so each format takes its own transcoding path
            await expect(verifyFileFormat({fileUri: 'file:///a.jpg', formatSignatures: CONST.HEIC_SIGNATURES})).resolves.toBe(false);
            await expect(verifyFileFormat({fileUri: 'file:///b.jpg', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET})).resolves.toBe(false);
        });

        it('rejects a real JPEG for both formats', async () => {
            // Given a JFIF header
            // When verified against either signature set
            // Then it matches nothing and is passed through untouched by callers
            await expect(verifyFileFormat({fileUri: 'file:///a.jpg', formatSignatures: CONST.HEIC_SIGNATURES})).resolves.toBe(false);
            await expect(verifyFileFormat({fileUri: 'file:///a.jpg', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET})).resolves.toBe(false);
        });

        it('resolves false for a file shorter than the signature', async () => {
            // Given a 2-byte file
            mockReadFile.mockResolvedValue(headerBase64([0x49, 0x49]));

            // When verified
            // Then it doesn't match, rather than throwing
            await expect(verifyFileFormat({fileUri: 'file:///tiny', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET})).resolves.toBe(false);
        });

        it('resolves false when the header cannot be decoded', async () => {
            // Given garbage that is not valid base64
            mockReadFile.mockResolvedValue('!!not base64!!');

            // When verified
            // Then it doesn't match
            await expect(verifyFileFormat({fileUri: 'file:///broken', formatSignatures: CONST.HEIC_SIGNATURES})).resolves.toBe(false);
        });

        it.each([
            ['an empty uri', {fileUri: '', formatSignatures: CONST.HEIC_SIGNATURES}],
            ['no signatures', {fileUri: 'file:///photo.heic', formatSignatures: []}],
        ])('resolves false without touching the filesystem for %s', async (name, args) => {
            // Given nothing to check
            // When verified
            // Then no read is attempted
            await expect(verifyFileFormat(args)).resolves.toBe(false);
            expect(mockSlice).not.toHaveBeenCalled();
        });
    });
});
