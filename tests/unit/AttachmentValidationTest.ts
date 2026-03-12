import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import type {FileObject} from '@src/types/utils/Attachment';
import CONST from '../../src/CONST';

jest.useFakeTimers();

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

describe('AttachmentValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('validateAttachmentFile', () => {
        it('should not return SINGLE_FILE.FILE_TOO_SMALL when validating small attachment', async () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
        });

        it('should return SINGLE_FILE.FILE_TOO_SMALL when validating small receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image file', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const result = await validateAttachmentFile(file);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.WRONG_FILE_TYPE for invalid receipt extension', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should prioritize SINGLE_FILE.WRONG_FILE_TYPE over SINGLE_FILE.FILE_TOO_LARGE for receipts', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should return empty string for valid image receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should return SINGLE_FILE.NO_FILE_PROVIDED when file is null', async () => {
            const result = await validateAttachmentFile(null as unknown as FileObject);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.NO_FILE_PROVIDED);
            expect(result.file).toBeNull();
        });

        it('should return SINGLE_FILE.NO_FILE_PROVIDED when file is undefined', async () => {
            const result = await validateAttachmentFile(undefined as unknown as FileObject);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.NO_FILE_PROVIDED);
            expect(result.file).toBeUndefined();
        });

        it('should return SINGLE_FILE.HEIC_OR_HEIF_IMAGE for HEIC file', async () => {
            const file = createMockFile('image.heic', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('should return SINGLE_FILE.HEIC_OR_HEIF_IMAGE for HEIF file', async () => {
            const file = createMockFile('image.heif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large image receipt', async () => {
            // Note: Image receipts are checked against MAX_SIZE (24MB) in isFileCorrupted, not RECEIPT_MAX_SIZE (10MB)
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should accept file at exact MIN_SIZE for receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept file at exact RECEIPT_MAX_SIZE for receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept file at exact MAX_SIZE for non-receipt', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE);
            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid PDF receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid non-image receipt (doc)', async () => {
            const file = createMockFile('receipt.doc', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid non-image receipt (text)', async () => {
            const file = createMockFile('receipt.text', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid PNG receipt', async () => {
            const file = createMockFile('receipt.png', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid GIF receipt', async () => {
            const file = createMockFile('receipt.gif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid JPEG receipt', async () => {
            const file = createMockFile('receipt.jpeg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid non-receipt attachment (csv)', async () => {
            const file = createMockFile('data.csv', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
        });

        it('should accept valid non-receipt attachment (image)', async () => {
            const file = createMockFile('image.png', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const result = await validateAttachmentFile(file);

            expect(result.isValid).toBe(true);
        });

        it('should handle file with no name', async () => {
            const file = createMockFile('', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            // File without name should still validate (name is optional)
            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('should handle file with no size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: undefined};
            const result = await validateAttachmentFile(file, undefined, true);

            // File without size should still validate (size is optional)
            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('should return SINGLE_FILE.FOLDER_NOT_ALLOWED when DataTransferItem is a directory', async () => {
            const mockItem = {
                kind: 'file' as const,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: true,
                })),
            } as unknown as DataTransferItem;

            const file = createMockFile('folder', 0);
            const result = await validateAttachmentFile(file, mockItem);

            if (result.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
        });
    });

    describe('validateMultipleAttachmentFiles', () => {
        it('should return SINGLE_FILE.FILE_TOO_LARGE when checking multiple files', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const result = await validateMultipleAttachmentFiles([file], undefined, false);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.error).toEqual(undefined);

            const firstFileResult = result.fileResults.at(0);

            if (!firstFileResult || firstFileResult.isValid) {
                throw new Error('firstFileResult should be defined and valid');
            }

            expect(firstFileResult.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return WRONG_FILE_TYPE_MULTIPLE when checking multiple invalid receipt files', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const result = await validateMultipleAttachmentFiles([file], undefined, true);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            const firstFileResult = result.fileResults.at(0);

            if (!firstFileResult || firstFileResult.isValid) {
                throw new Error('firstFileResult should be defined and valid');
            }

            expect(firstFileResult.error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should return MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED when more than MAX_FILE_LIMIT files', async () => {
            const files = Array.from({length: CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT + 1}, () => createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1));
            const result = await validateMultipleAttachmentFiles(files);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);
        });

        it('should accept exactly MAX_FILE_LIMIT files', async () => {
            const files = Array.from({length: CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT}, () => createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1));
            const result = await validateMultipleAttachmentFiles(files);

            expect(result.isValid).toBe(true);
            if (result.isValid) {
                expect(result.validatedFiles).toHaveLength(CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
            }
        });

        it('should return MULTIPLE_FILES.FOLDER_NOT_ALLOWED when empty array provided', async () => {
            const result = await validateMultipleAttachmentFiles([]);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
        });

        it('should return MULTIPLE_FILES.FOLDER_NOT_ALLOWED when directory is included', async () => {
            const directoryFile: FileObject = {
                name: 'folder',
                size: 0,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: true,
                })),
            } as unknown as FileObject;

            const result = await validateMultipleAttachmentFiles([directoryFile]);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
        });

        it('should return valid result when all files are valid', async () => {
            const files = [
                createMockFile('file1.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1),
                createMockFile('file2.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1),
                createMockFile('file3.png', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1),
            ];
            const result = await validateMultipleAttachmentFiles(files);

            expect(result.isValid).toBe(true);
            if (result.isValid) {
                expect(result.validatedFiles).toHaveLength(3);
            }
        });

        it('should return invalid result with mixed valid and invalid files', async () => {
            const files = [
                createMockFile('file1.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1),
                createMockFile('file2.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1),
                createMockFile('file3.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1),
            ];
            const result = await validateMultipleAttachmentFiles(files);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.fileResults).toHaveLength(3);
            expect(result.fileResults.at(0)?.isValid).toBe(true);
            expect(result.fileResults.at(1)?.isValid).toBe(false);
            expect(result.fileResults.at(2)?.isValid).toBe(true);
        });

        it('should handle multiple files with different error types', async () => {
            const files = [
                createMockFile('file1.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1), // WRONG_FILE_TYPE
                createMockFile('file2.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1), // FILE_TOO_LARGE
                createMockFile('file3.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1), // FILE_TOO_SMALL
            ];
            const result = await validateMultipleAttachmentFiles(files, undefined, true);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.fileResults).toHaveLength(3);
            const errors = result.fileResults.map((r) => (r.isValid ? null : r.error));
            expect(errors).toContain(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
            expect(errors).toContain(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
            expect(errors).toContain(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should handle multiple receipt files with HEIC/HEIF', async () => {
            const files = [
                createMockFile('image1.heic', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1),
                createMockFile('image2.heif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1),
            ];
            const result = await validateMultipleAttachmentFiles(files, undefined, true);

            if (result.isValid) {
                throw new Error('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.fileResults).toHaveLength(2);
            const errors = result.fileResults.map((r) => (r.isValid ? null : r.error));
            expect(errors).toContain(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('should handle multiple valid receipt files', async () => {
            const files = [
                createMockFile('receipt1.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1),
                createMockFile('receipt2.png', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1),
                createMockFile('receipt3.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1),
            ];
            const result = await validateMultipleAttachmentFiles(files, undefined, true);

            expect(result.isValid).toBe(true);
            if (result.isValid) {
                expect(result.validatedFiles).toHaveLength(3);
            }
        });

        it('should handle single file in array', async () => {
            const files = [createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1)];
            const result = await validateMultipleAttachmentFiles(files);

            expect(result.isValid).toBe(true);
            if (result.isValid) {
                expect(result.validatedFiles).toHaveLength(1);
            }
        });

        it('should handle files with DataTransferItems', async () => {
            const files = [createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1)];
            const items = [
                {
                    kind: 'file' as const,
                    webkitGetAsEntry: jest.fn(() => ({
                        isDirectory: false,
                    })),
                } as unknown as DataTransferItem,
            ];
            const result = await validateMultipleAttachmentFiles(files, items);

            expect(result.isValid).toBe(true);
        });
    });
});
