import getMimeTypeFromHeaderBytes from '@libs/getMimeTypeFromFileHeader/getMimeTypeFromHeaderBytes';
import getMimeTypeFromFileHeader from '@libs/getMimeTypeFromFileHeader/index.native';

import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';

// cspell:ignore ftyp isom WEBPVP WAVEfmt

jest.mock('react-native-fs', () => ({
    read: jest.fn(),
}));

const mockRead = jest.mocked(RNFS.read);

/** Builds a header whose bytes 4-11 are an ISO base media `ftyp` box with the given brand. */
function ftypHeader(brand: string): Uint8Array {
    return Uint8Array.from([0x00, 0x00, 0x00, 0x20, ...Buffer.from(`ftyp${brand}`)]);
}

describe('getMimeTypeFromHeaderBytes', () => {
    it('identifies ISO base media files by their ftyp brand', () => {
        // Given the headers of an MP4, a QuickTime movie, a 3GP video, and an M4A audio file
        // When they are identified
        // Then each maps to its own MIME type, and an unlisted brand is treated as MP4
        expect(getMimeTypeFromHeaderBytes(ftypHeader('isom'))).toBe('video/mp4');
        expect(getMimeTypeFromHeaderBytes(ftypHeader('mp42'))).toBe('video/mp4');
        expect(getMimeTypeFromHeaderBytes(ftypHeader('qt  '))).toBe('video/quicktime');
        expect(getMimeTypeFromHeaderBytes(ftypHeader('3gp5'))).toBe('video/3gpp');
        expect(getMimeTypeFromHeaderBytes(ftypHeader('M4A '))).toBe('audio/mp4');
    });

    it('does not identify HEIC or AVIF images as videos', () => {
        // Given image formats that share the ftyp box with MP4
        // When they are identified
        // Then no type is returned, so a HEIC file keeps its name and isn't mislabeled as a video
        expect(getMimeTypeFromHeaderBytes(ftypHeader('heic'))).toBeUndefined();
        expect(getMimeTypeFromHeaderBytes(ftypHeader('mif1'))).toBeUndefined();
        expect(getMimeTypeFromHeaderBytes(ftypHeader('avif'))).toBeUndefined();
    });

    it('identifies signatures at the start of the file', () => {
        // Given the headers of WebM, JPEG, PNG, GIF, PDF, and WebP files
        // When they are identified
        // Then each maps to its MIME type
        expect(getMimeTypeFromHeaderBytes(Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0x01]))).toBe('video/webm');
        expect(getMimeTypeFromHeaderBytes(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
        expect(getMimeTypeFromHeaderBytes(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
        expect(getMimeTypeFromHeaderBytes(Buffer.from('GIF89a'))).toBe('image/gif');
        expect(getMimeTypeFromHeaderBytes(Buffer.from('%PDF-1.7'))).toBe('application/pdf');
        expect(getMimeTypeFromHeaderBytes(Buffer.from('RIFF\u0000\u0000\u0000\u0000WEBPVP8 '))).toBe('image/webp');
    });

    it('returns undefined for unknown or too-short headers', () => {
        // Given a plain-text header, a RIFF file that is not WebP, and an empty header
        // When they are identified
        // Then no type is guessed
        expect(getMimeTypeFromHeaderBytes(Buffer.from('hello world'))).toBeUndefined();
        expect(getMimeTypeFromHeaderBytes(Buffer.from('RIFF\u0000\u0000\u0000\u0000WAVEfmt '))).toBeUndefined();
        expect(getMimeTypeFromHeaderBytes(new Uint8Array())).toBeUndefined();
    });
});

describe('getMimeTypeFromFileHeader (native)', () => {
    beforeEach(() => {
        mockRead.mockReset();
    });

    it('reads only the first bytes of the file at its uri', async () => {
        // Given an extensionless MP4 picked from a file:// uri
        mockRead.mockResolvedValue(Buffer.from(ftypHeader('isom')).toString('base64'));

        // When its type is detected
        const mimeType = await getMimeTypeFromFileHeader({name: 'recording', uri: 'file:///data/user/0/recording'});

        // Then only a small byte range is read from the decoded path, and the type is identified
        expect(mockRead).toHaveBeenCalledWith('/data/user/0/recording', 32, 0, 'base64');
        expect(mimeType).toBe('video/mp4');
    });

    it('returns undefined when the file cannot be read', async () => {
        // Given a uri the file system can't read
        mockRead.mockRejectedValue(new Error('ENOENT'));

        // When its type is detected
        const mimeType = await getMimeTypeFromFileHeader({name: 'recording', uri: 'content://missing/1'});

        // Then detection fails quietly so validation can continue with the original type
        expect(mimeType).toBeUndefined();
    });

    it('returns undefined when the file has no uri', async () => {
        // Given a file object without a uri
        // When its type is detected
        const mimeType = await getMimeTypeFromFileHeader({name: 'recording'});

        // Then nothing is read
        expect(mockRead).not.toHaveBeenCalled();
        expect(mimeType).toBeUndefined();
    });
});
