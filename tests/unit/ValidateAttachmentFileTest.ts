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
        it('returns invalid result with FILE_INVALID when file has no name', async () => {
            const file = createMockFile('', 100);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('returns invalid result with FILE_INVALID when file has undefined size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: undefined};
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });

        it('returns invalid result with FILE_INVALID when file has null size', async () => {
            const file: FileObject = {name: 'receipt.jpg', size: null as unknown as number};
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_INVALID);
        });
    });

    describe('WRONG_FILE_TYPE', () => {
        it('returns invalid result with WRONG_FILE_TYPE for invalid receipt extension when validating receipts', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('returns invalid result with WRONG_FILE_TYPE (not FILE_TOO_LARGE) when receipt has wrong type and is over size', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('returns valid result when not validating receipts, even for invalid receipt extension', async () => {
            const file = createMockFile('file.exe', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, false);

            expect(error.isValid).toBe(true);
        });
    });

    describe('HEIC_OR_HEIF_IMAGE', () => {
        it('returns invalid result with HEIC_OR_HEIF_IMAGE for .heic file', async () => {
            const file = createMockFile('image.heic', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });

        it('returns invalid result with HEIC_OR_HEIF_IMAGE for .heif file', async () => {
            const file = createMockFile('image.heif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
        });
    });

    describe('FILE_TOO_LARGE', () => {
        it('returns invalid result with FILE_TOO_LARGE for non-image over MAX_SIZE (general attachment)', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('returns invalid result with FILE_TOO_LARGE for non-image receipt over RECEIPT_MAX_SIZE', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('returns invalid result for image over RECEIPT_MAX_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('returns valid result when non-image is exactly at MAX_SIZE', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE);
            const error = await validateAttachmentFile(file);

            expect(error.isValid).toBe(true);
        });
    });

    describe('FILE_TOO_SMALL', () => {
        it('returns invalid result with FILE_TOO_SMALL for receipt below MIN_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('returns valid result when not validating receipts, even for small file size', async () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result when receipt is exactly at MIN_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });
    });

    describe('FOLDER_NOT_ALLOWED', () => {
        it('returns invalid result with FOLDER_NOT_ALLOWED when DataTransferItem is a directory', async () => {
            const mockItem = {
                kind: 'file' as const,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: true,
                })),
            } as unknown as DataTransferItem;

            const file = createMockFile('folder', 0);
            const error = await validateAttachmentFile(file, mockItem);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
        });

        it('returns valid result when DataTransferItem is not a directory', async () => {
            const mockItem = {
                kind: 'file' as const,
                webkitGetAsEntry: jest.fn(() => ({
                    isDirectory: false,
                })),
            } as unknown as DataTransferItem;

            const file = createMockFile('file.pdf', 100);
            const error = await validateAttachmentFile(file, mockItem);

            expect(error.isValid).toBe(true);
        });
    });

    describe('FILE_CORRUPTED', () => {
        it('returns invalid result with FILE_CORRUPTED when validateImageForCorruption throws', async () => {
            mockFileUtils.validateImageForCorruption.mockRejectedValue(new Error('Corrupted'));

            const file = createMockFile('image.png', 1000);
            const error = await validateAttachmentFile(file);

            if (error.isValid) {
                throw new Error('validateAttachmentFile should return an invalid result');
            }

            expect(error.error).toEqual(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
        });
    });

    describe('success', () => {
        it('returns valid result for valid image receipt at valid size', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid receipt at exact RECEIPT_MAX_SIZE', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid PDF receipt', async () => {
            const file = createMockFile('receipt.pdf', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid PNG receipt', async () => {
            const file = createMockFile('receipt.png', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid GIF receipt', async () => {
            const file = createMockFile('receipt.gif', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid JPEG receipt', async () => {
            const file = createMockFile('receipt.jpeg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid non-image receipt (doc)', async () => {
            const file = createMockFile('receipt.doc', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid non-image receipt (text)', async () => {
            const file = createMockFile('receipt.text', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = await validateAttachmentFile(file, undefined, true);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid non-receipt attachment (CSV)', async () => {
            const file = createMockFile('data.csv', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result for valid non-receipt image', async () => {
            const file = createMockFile('image.png', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE - 1);
            const error = await validateAttachmentFile(file);

            expect(error.isValid).toBe(true);
        });

        it('returns valid result when file has getAsFile and uses converted file', async () => {
            // In Node/Jest the react-native-url-polyfill throws for createObjectURL (no BlobModule).
            // Mock it so the File path that assigns file.uri can run.
            const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
            try {
                const blob = new Blob(['content'], {type: 'text/plain'});
                const convertedFile = new File([blob], 'file.txt', {type: 'text/plain'});
                const file = {
                    name: 'file.txt',
                    size: 7,
                    getAsFile: () => convertedFile,
                } as unknown as FileObject;

                const error = await validateAttachmentFile(file);

                expect(error.isValid).toBe(true);
                expect(mockFileUtils.normalizeFileObject).toHaveBeenCalledWith(convertedFile);
            } finally {
                createObjectURLSpy.mockRestore();
            }
        });
    });
});
