import {blockAndClearUserMedia} from '@libs/UserMediaCache';

describe('UserMediaCache', () => {
    afterEach(() => {
        Reflect.deleteProperty(globalThis, 'caches');
    });

    it('deletes saved media even when the block marker cannot be created', async () => {
        // Given Cache Storage that can delete caches but fails to create the block marker
        const deleteCache = jest.fn(async () => true);
        Object.defineProperty(globalThis, 'caches', {
            configurable: true,
            value: {open: jest.fn(async () => Promise.reject(new Error('Quota exceeded'))), delete: deleteCache},
        });

        // When saved media is blocked and cleared, as on sign out or a switch to Classic
        const result = blockAndClearUserMedia();

        // Then the previous session's media is still deleted, and the failure reaches the caller to be logged
        await expect(result).rejects.toThrow('Quota exceeded');
        expect(deleteCache).toHaveBeenCalledWith('user-media');
    });
});
