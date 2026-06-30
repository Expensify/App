import getNativeFileSystemPath from '@libs/fileDownload/getNativeFileSystemPath';

describe('getNativeFileSystemPath', () => {
    it('strips the file:// scheme from a URI', () => {
        expect(getNativeFileSystemPath('file:///storage/emulated/0/DCIM/photo.jpg')).toBe('/storage/emulated/0/DCIM/photo.jpg');
    });

    it('returns a POSIX path unchanged when there is no file:// scheme', () => {
        expect(getNativeFileSystemPath('/storage/emulated/0/DCIM/photo.jpg')).toBe('/storage/emulated/0/DCIM/photo.jpg');
    });

    it('URL-decodes percent-encoded spaces in the path', () => {
        expect(getNativeFileSystemPath('file:///storage/emulated/0/my%20receipt.pdf')).toBe('/storage/emulated/0/my receipt.pdf');
    });

    it('preserves reserved characters left encoded by decodeURI (e.g. %23)', () => {
        // decodeURI does not decode reserved characters such as # (%23), matching checkFileExists behavior
        expect(getNativeFileSystemPath('file:///storage/emulated/0/receipt%231.pdf')).toBe('/storage/emulated/0/receipt%231.pdf');
    });

    it('decodes and strips the scheme together', () => {
        expect(getNativeFileSystemPath('file:///var/mobile/Containers/Caf%C3%A9/image.heic')).toBe('/var/mobile/Containers/Café/image.heic');
    });

    it('falls back to the original URI when decoding fails', () => {
        // A lone % is not a valid percent-encoding, so decodeURI throws and the original value is used (minus the scheme)
        expect(getNativeFileSystemPath('file:///storage/100%invalid/photo.jpg')).toBe('/storage/100%invalid/photo.jpg');
    });

    it('returns an empty string unchanged', () => {
        expect(getNativeFileSystemPath('')).toBe('');
    });
});
