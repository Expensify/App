import ReceiptStorage from '@libs/ReceiptStorage';
import adoptDerivedFile from '@libs/ReceiptStorage/adoptDerivedFile';
import {isInDurableFolder} from '@libs/ReceiptStorage/durableFolder';
import {logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';

import type {FileObject} from '@src/types/utils/Attachment';

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: jest.fn(),
        discard: jest.fn(),
        toLocalUri: (durableName: string) => `file:///receipts/${durableName}`,
    },
}));

jest.mock('@libs/ReceiptStorage/durableFolder', () => ({
    isInDurableFolder: jest.fn(),
}));

jest.mock('@libs/telemetry/ReceiptObservability', () => ({
    getPickerCaptureSource: () => 'gallery',
    logReceiptAdoptFailed: jest.fn(),
}));

const mockAdopt = jest.mocked(ReceiptStorage.adopt);
const mockDiscard = jest.mocked(ReceiptStorage.discard);
const mockIsInDurableFolder = jest.mocked(isInDurableFolder);

const pickedFile: FileObject = {uri: 'file:///receipts/photo_1.heic', name: 'photo.heic', type: 'image/heic'};
const convertedFile: FileObject = {uri: 'file:///cache/ImageManipulator/abc.jpg', name: 'photo.jpg', type: 'image/jpeg'};

describe('adoptDerivedFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsInDurableFolder.mockReturnValue(true);
        mockAdopt.mockResolvedValue('photo_2.jpg');
        mockDiscard.mockResolvedValue();
    });

    it('moves the converted file into the receipts folder and deletes the original', async () => {
        // Given a picked HEIC in the receipts folder and its JPEG in the image cache

        // When the JPEG is adopted
        const result = await adoptDerivedFile(pickedFile, convertedFile, 'convert');

        // Then uri and source both point into the receipts folder, because an offline replay reads source
        expect(result).toEqual({...convertedFile, uri: 'file:///receipts/photo_2.jpg', source: 'file:///receipts/photo_2.jpg'});
        // The HEIC is deleted, or it would stay in the folder with nothing pointing at it
        expect(mockDiscard).toHaveBeenCalledWith(pickedFile.uri);
    });

    it('does nothing when the step returned its input', async () => {
        // Given a resize that had nothing to do and returned the same file

        // When that result is adopted
        const result = await adoptDerivedFile(pickedFile, pickedFile, 'resize');

        // Then nothing is moved or deleted, since deleting the input would delete the only copy
        expect(result).toBe(pickedFile);
        expect(mockAdopt).not.toHaveBeenCalled();
        expect(mockDiscard).not.toHaveBeenCalled();
    });

    it('does nothing when the input was not in the receipts folder', async () => {
        // Given a file the picker never moved into the receipts folder, as on web
        mockIsInDurableFolder.mockReturnValue(false);

        // When its converted copy is adopted
        const result = await adoptDerivedFile(pickedFile, convertedFile, 'convert');

        // Then the copy stays where it is
        expect(result).toBe(convertedFile);
        expect(mockAdopt).not.toHaveBeenCalled();
    });

    it('keeps the cache file and the original when the move fails', async () => {
        // Given a receipts folder that refuses the move
        const error = new Error('disk full');
        mockAdopt.mockRejectedValue(error);

        // When the resized file is adopted
        const result = await adoptDerivedFile(pickedFile, convertedFile, 'resize');

        // Then validation still gets a file to upload and the failure is logged with its step
        expect(result).toBe(convertedFile);
        expect(logReceiptAdoptFailed).toHaveBeenCalledWith({error, captureSource: 'gallery', step: 'resize'});
        expect(mockDiscard).not.toHaveBeenCalled();
    });
});
