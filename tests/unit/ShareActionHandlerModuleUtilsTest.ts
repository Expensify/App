import {getShareTempFile, normalizeShareFileMimeType} from '@libs/ShareActionHandlerModule/utils';

describe('ShareActionHandlerModule utils', () => {
    const sharedFile = {id: 'receipt.jpg', content: 'file:///receipt.jpg', mimeType: 'image/jpeg'};

    it.each([
        ['an array response', [sharedFile]],
        ['an object response', sharedFile],
        ['a JSON string response', JSON.stringify(sharedFile)],
    ])('returns the shared file from %s', (_description, response) => {
        expect(getShareTempFile(response)).toEqual(sharedFile);
    });

    it.each([null, undefined, [], {}, '', '  ', '{invalid JSON}', JSON.stringify({id: 'receipt.jpg'})])('returns undefined for an invalid native response', (response) => {
        expect(getShareTempFile(response)).toBeUndefined();
    });

    it('normalizes a MIME type that contains parameters', () => {
        expect(normalizeShareFileMimeType('IMAGE/JPEG; charset=utf-8')).toBe('image/jpeg');
    });

    it('returns an empty MIME type when no MIME type is provided', () => {
        expect(normalizeShareFileMimeType(undefined)).toBe('');
    });
});
