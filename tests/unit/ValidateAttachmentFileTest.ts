import validateAttachmentFile from '@libs/validateAttachmentFile';
import type {FileObject} from '@src/types/utils/Attachment';
import CONST from '../../src/CONST';
import * as FileUtils from '../../src/libs/fileDownload/FileUtils';

// Mock only normalizeFileObject and validateImageForCorruption; keep real hasHeicOrHeifExtension and isValidReceiptExtension
jest.mock('@src/libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtils>('@src/libs/fileDownload/FileUtils');
    return {
        ...actual,
        normalizeFileObject: jest.fn(),
        validateImageForCorruption: jest.fn(),
    };
});

const mockFileUtils = FileUtils as jest.Mocked<typeof FileUtils>;

const createMockFile = (name: string, size: number): FileObject => ({
    name,
    size,
});

describe('validateAttachmentFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: pass-through so async validation succeeds
        mockFileUtils.normalizeFileObject.mockImplementation(async (file) => file);
        mockFileUtils.validateImageForCorruption.mockResolvedValue(undefined);
    });

    describe('FILE_INVALID', () => {
        it('returns FILE_INVALID when file has no name', async () => {
            const file = createMockFile('', 100);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('returns FILE_INVALID when file has undefined size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: undefined};
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('returns FILE_INVALID when file has null size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: null as unknown as number};
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });
    });

    describe('WRONG_FILE_TYPE', () => {
        it('returns WRONG_FILE_TYPE for invalid receipt extension when validating receipts', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('returns WRONG_FILE_TYPE (not FILE_TOO_LARGE) when receipt has wrong type and is over size', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('does not return WRONG_FILE_TYPE when not validating receipts', async () => {
            const file = createMockFile('file.exe', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, false);

            expect(error).toBe(null);
        });
    });

    describe('HEIC_OR_HEIF_IMAGE', () => {
        it('returns HEIC_OR_HEIF_IMAGE for .heic file', async () => {
            const file = createMockFile('image.heic', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('returns HEIC_OR_HEIF_IMAGE for .heif file', async () => {
            const file = createMockFile('image.heif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });
    });

    describe('FILE_TOO_LARGE', () => {
        it('returns FILE_TOO_LARGE for non-image over MAX_SIZE (general attachment)', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('returns FILE_TOO_LARGE for non-image receipt over RECEIPT_MAX_SIZE', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('does not return FILE_TOO_LARGE for image over RECEIPT_MAX_SIZE (images skip this check)', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('does not return FILE_TOO_LARGE when non-image is exactly at MAX_SIZE', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });
    });

    describe('FILE_TOO_SMALL', () => {
        it('returns FILE_TOO_SMALL for receipt below MIN_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('does not return FILE_TOO_SMALL when not validating receipts', async () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('returns null when receipt is exactly at MIN_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });
    });

    describe('FOLDER_NOT_ALLOWED', () => {
        it('returns FOLDER_NOT_ALLOWED when DataTransferItem is a directory', async () => {
            const mockItem = {
                kind: 'file' as const,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: true,
                })),
            } as unknown as DataTransferItem;

            const file = createMockFile('folder', 0);
            const error = await validateAttachmentFile(file, mockItem);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
        });

        it('does not return FOLDER_NOT_ALLOWED when item is not a directory', async () => {
            const mockItem = {
                kind: 'file' as const,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: false,
                })),
            } as unknown as DataTransferItem;

            const file = createMockFile('file.pdf', 100);
            const error = await validateAttachmentFile(file, mockItem);

            expect(error).toBe(null);
        });
    });

    describe('FILE_CORRUPTED', () => {
        it('returns FILE_CORRUPTED when validateImageForCorruption throws', async () => {
            mockFileUtils.validateImageForCorruption.mockRejectedValue(new Error('Corrupted'));

            const file = createMockFile('image.png', 1000);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
        });
    });

    describe('success (returns null)', () => {
        it('returns null for valid image receipt at valid size', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid receipt at exact RECEIPT_MAX_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid PDF receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid PNG receipt', async () => {
            const file = createMockFile('receipt.png', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid GIF receipt', async () => {
            const file = createMockFile('receipt.gif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid JPEG receipt', async () => {
            const file = createMockFile('receipt.jpeg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid non-image receipt (doc)', async () => {
            const file = createMockFile('receipt.doc', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid non-image receipt (text)', async () => {
            const file = createMockFile('receipt.text', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('returns null for valid non-receipt attachment (CSV)', async () => {
            const file = createMockFile('data.csv', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('returns null for valid non-receipt image', async () => {
            const file = createMockFile('image.png', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('returns null when file has getAsFile and uses converted file', async () => {
            const blob = new Blob(['content'], {type: 'text/plain'});
            const convertedFile = new File([blob], 'file.txt', {type: 'text/plain'});
            const file = {
                name: 'file.txt',
                size: 7,
                getAsFile: () => convertedFile,
            } as unknown as FileObject;

            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
            expect(mockFileUtils.normalizeFileObject).toHaveBeenCalledWith(convertedFile);
        });
    });
});
