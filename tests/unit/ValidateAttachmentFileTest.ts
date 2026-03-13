import validateAttachmentFile from '@libs/validateAttachmentFile';
import type {FileObject} from '@src/types/utils/Attachment';
import CONST from '../../src/CONST';

jest.useFakeTimers();

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

describe('validateAttachmentFile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('validateAttachmentFile', () => {
        it('should not return SINGLE_FILE.FILE_TOO_SMALL when validating small attachment', async () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('should return SINGLE_FILE.FILE_TOO_SMALL when validating small receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image file', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.WRONG_FILE_TYPE for invalid receipt extension', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should prioritize SINGLE_FILE.WRONG_FILE_TYPE over SINGLE_FILE.FILE_TOO_LARGE for receipts', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should return empty string for valid image receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should return SINGLE_FILE.HEIC_OR_HEIF_IMAGE for HEIC file', async () => {
            const file = createMockFile('image.heic', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('should return SINGLE_FILE.HEIC_OR_HEIF_IMAGE for HEIF file', async () => {
            const file = createMockFile('image.heif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large image receipt', async () => {
            // Note: Image receipts are checked against MAX_SIZE (24MB) in isFileCorrupted, not RECEIPT_MAX_SIZE (10MB)
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should accept file at exact MIN_SIZE for receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept file at exact RECEIPT_MAX_SIZE for receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept file at exact MAX_SIZE for non-receipt', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('should accept valid PDF receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid non-image receipt (doc)', async () => {
            const file = createMockFile('receipt.doc', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid non-image receipt (text)', async () => {
            const file = createMockFile('receipt.text', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid PNG receipt', async () => {
            const file = createMockFile('receipt.png', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid GIF receipt', async () => {
            const file = createMockFile('receipt.gif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid JPEG receipt', async () => {
            const file = createMockFile('receipt.jpeg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error).toBe(null);
        });

        it('should accept valid non-receipt attachment (csv)', async () => {
            const file = createMockFile('data.csv', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('should accept valid non-receipt attachment (image)', async () => {
            const file = createMockFile('image.png', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error).toBe(null);
        });

        it('should handle file with no name', async () => {
            const file = createMockFile('', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            // File without name should still validate (name is optional)
            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('should handle file with no size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: undefined};
            const error = await validateAttachmentFile(file, undefined, true);

            // File without size should still validate (size is optional)
            expect(error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('should return SINGLE_FILE.FOLDER_NOT_ALLOWED when DataTransferItem is a directory', async () => {
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
    });
});
