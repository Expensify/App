import {
    areVideoDimensionsValid,
    cacheVideoDimensions,
    clearVideoDimensionsCache,
    getAuthenticatedVideoSourceURL,
    getCachedVideoDimensions,
} from '@components/VideoPlayerPreview/videoDimensionUtils';

describe('VideoPlayerPreview videoDimensionUtils', () => {
    beforeEach(() => {
        clearVideoDimensionsCache();
    });

    it('should treat zero and NaN dimensions as invalid', () => {
        expect(areVideoDimensionsValid({width: 0, height: 0})).toBe(false);
        expect(areVideoDimensionsValid({width: NaN, height: NaN})).toBe(false);
        expect(areVideoDimensionsValid({width: 1206, height: 2622})).toBe(true);
    });

    it('should only cache valid measured dimensions', () => {
        const videoURL = 'https://www.expensify.com/chat-attachments/1/video.mov';

        cacheVideoDimensions(videoURL, {width: 0, height: 0});
        expect(getCachedVideoDimensions(videoURL)).toBeNull();

        cacheVideoDimensions(videoURL, {width: 1206, height: 2622});
        expect(getCachedVideoDimensions(videoURL)).toEqual({width: 1206, height: 2622});
    });

    it('should build an authenticated source URL for server attachments', () => {
        const sourceURL = getAuthenticatedVideoSourceURL('https://www.expensify.com/chat-attachments/1/video.mov', 'token');

        expect(sourceURL).toContain('encryptedAuthToken=token');
        expect(sourceURL).toContain('#t=0.001');
    });

    it('should not add an auth token to local URLs', () => {
        const sourceURL = getAuthenticatedVideoSourceURL('blob:https://dev.new.expensify.com/video', 'token');

        expect(sourceURL).not.toContain('encryptedAuthToken');
        expect(sourceURL).toContain('#t=0.001');
    });
});
