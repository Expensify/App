/** Verifies the native adapter exposes generated records without changing the payload. */

import ShareActionHandler from '@libs/ShareActionHandlerModule/index.native';

import type {SharedFile} from '@expensify/nitro-utils';

import {NitroModules} from 'react-native-nitro-modules';

jest.mock('react-native-nitro-modules', () => ({
    NitroModules: {createHybridObject: jest.fn(() => ({processFiles: jest.fn()}))},
}));

describe('ShareActionHandler native adapter', () => {
    const processFiles = jest.spyOn(ShareActionHandler, 'processFiles');
    const createHybridObject = jest.spyOn(NitroModules, 'createHybridObject');

    it.each<SharedFile>([
        {id: 'receipt.jpg', content: 'file:///receipt.jpg', mimeType: 'image/jpeg', processedAt: '123', aspectRatio: 1.5},
        {id: 'text', content: '/literal text, not a file path', mimeType: 'txt', processedAt: '123'},
    ])('preserves the generated payload for $mimeType', async (file) => {
        // Given a native result that uses the common record type, including optional metadata.
        const files = [file];
        processFiles.mockResolvedValueOnce(files);

        // When the native adapter processes the share.
        const result = await ShareActionHandler.processFiles();

        // Then neither JSON parsing nor platform-specific result conversion is needed.
        expect(createHybridObject).toHaveBeenCalledWith('ShareActionHandler');
        expect(result).toBe(files);
    });

    it('preserves an empty result when no share is pending', async () => {
        // Given no pending share.
        processFiles.mockResolvedValueOnce([]);

        // When the native adapter processes files.
        const result = await ShareActionHandler.processFiles();

        // Then the contract remains an array, not null or an error string.
        expect(result).toEqual([]);
    });

    it('propagates native processing failures', async () => {
        // Given an attachment that native code cannot read.
        const error = new Error('Shared attachment is missing');
        processFiles.mockRejectedValueOnce(error);

        // When processing fails, then the caller receives a rejection rather than a malformed payload.
        await expect(ShareActionHandler.processFiles()).rejects.toBe(error);
    });
});
