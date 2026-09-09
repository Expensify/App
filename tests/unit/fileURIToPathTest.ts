import fileURIToPath from '@libs/fileURIToPath';

describe('fileURIToPath', () => {
    it('returns an empty string unchanged', () => {
        expect(fileURIToPath('')).toBe('');
    });

    it('strips the file:// prefix', () => {
        expect(fileURIToPath('file:///var/mobile/Containers/receipt.pdf')).toBe('/var/mobile/Containers/receipt.pdf');
    });

    it('decodes %20 to a space', () => {
        expect(fileURIToPath('file:///var/mobile/Containers/my%20receipt.pdf')).toBe('/var/mobile/Containers/my receipt.pdf');
    });

    it('decodes reserved characters like %23 to #', () => {
        expect(fileURIToPath('file:///var/mobile/Containers/Receipt%20%2342.pdf')).toBe('/var/mobile/Containers/Receipt #42.pdf');
    });

    it('round-trips a literal % encoded by the share extension as %25', () => {
        expect(fileURIToPath('file:///var/mobile/Containers/Report%2050%25.pdf')).toBe('/var/mobile/Containers/Report 50%.pdf');
    });

    it('falls back to the stripped raw path when the URI is not valid percent-encoding', () => {
        expect(fileURIToPath('file:///var/mobile/Containers/Report 50%.pdf')).toBe('/var/mobile/Containers/Report 50%.pdf');
    });

    it('does not decode a content:// URI', () => {
        expect(fileURIToPath('content://media/external/images/1%20a')).toBe('content://media/external/images/1%20a');
    });

    it('does not decode an https:// URL', () => {
        expect(fileURIToPath('https://www.expensify.com/receipts/w_abc%20def.jpg')).toBe('https://www.expensify.com/receipts/w_abc%20def.jpg');
    });

    it('does not decode a path without the file:// scheme', () => {
        expect(fileURIToPath('/var/mobile/Containers/Receipt%20%2342.pdf')).toBe('/var/mobile/Containers/Receipt%20%2342.pdf');
    });
});
