import {areVideoDimensionsValid, cacheVideoDimensions, getAuthenticatedVideoSourceURL, getCachedVideoDimensions, isLocalVideoURL} from '@components/VideoPlayerPreview/videoDimensionUtils';

describe('videoDimensionUtils', () => {
    describe('areVideoDimensionsValid', () => {
        it('accepts finite positive dimensions', () => {
            expect(areVideoDimensionsValid({width: 720, height: 1280})).toBe(true);
        });

        it.each([
            ['null', null],
            ['undefined', undefined],
            ['zero width/height', {width: 0, height: 0}],
            ['zero height', {width: 720, height: 0}],
            ['NaN', {width: Number.NaN, height: Number.NaN}],
            ['Infinity', {width: Number.POSITIVE_INFINITY, height: 100}],
            ['negative', {width: -720, height: -1280}],
        ])('rejects %s', (_label, dimensions) => {
            expect(areVideoDimensionsValid(dimensions)).toBe(false);
        });
    });

    describe('isLocalVideoURL', () => {
        it.each([
            ['blob:https://dev.new.expensify.com/abc', true],
            ['file:///var/mobile/video.mp4', true],
            ['https://www.expensify.com.dev/receipts/video.mp4', false],
        ])('classifies %s', (url, expected) => {
            expect(isLocalVideoURL(url)).toBe(expected);
        });
    });

    describe('dimension cache', () => {
        const url = 'https://www.expensify.com.dev/receipts/portrait.mp4';

        it('round-trips valid dimensions keyed by URL', () => {
            cacheVideoDimensions(url, {width: 720, height: 1280});
            expect(getCachedVideoDimensions(url)).toEqual({width: 720, height: 1280});
        });

        it('returns null for an unknown URL', () => {
            expect(getCachedVideoDimensions('https://www.expensify.com.dev/receipts/unknown.mp4')).toBeNull();
        });

        it('does not cache invalid dimensions', () => {
            const invalidURL = 'https://www.expensify.com.dev/receipts/invalid.mp4';
            cacheVideoDimensions(invalidURL, {width: 0, height: 0});
            expect(getCachedVideoDimensions(invalidURL)).toBeNull();
        });
    });

    describe('getAuthenticatedVideoSourceURL', () => {
        it('adds the auth token for a server URL so onloadedmetadata can fire for protected attachments', () => {
            const result = getAuthenticatedVideoSourceURL('https://www.expensify.com.dev/receipts/video.mp4', 'secret-token');
            expect(result).toContain('encryptedAuthToken=secret-token');
            expect(result).toContain('#t=0.001');
        });

        it('does not add an auth token to a local (blob) URL', () => {
            const result = getAuthenticatedVideoSourceURL('blob:https://dev.new.expensify.com/abc', 'secret-token');
            expect(result).not.toContain('encryptedAuthToken');
            expect(result).toContain('#t=0.001');
        });
    });
});
