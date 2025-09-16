import {validateAttachmentFile} from '@libs/AttachmentValidation';
import CONST from '../../src/CONST';

jest.useFakeTimers();

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

describe('AttachmentValidation', () => {
    describe('validateAttachment', () => {
        it('should not return SINGLE_FILE.FILE_TOO_SMALL when validating small attachment', () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = validateAttachmentFile(file, false, false);
            expect(error).not.toBe(CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL);
        });

        it('should return SINGLE_FILE.FILE_TOO_SMALL when validating small receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = validateAttachmentFile(file, false, true);
            expect(error).toBe(CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image file', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = validateAttachmentFile(file);
            expect(error).toBe(CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE);
        });

        it('should return MULTIPLE_FILES.FILE_TOO_LARGE when checking multiple files', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = validateAttachmentFile(file, true);
            expect(error).toBe(CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.WRONG_FILE_TYPE for invalid receipt extension', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = validateAttachmentFile(file, false, true);
            expect(error).toBe(CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE);
        });

        it('should return empty string for valid image receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = validateAttachmentFile(file, false, true);
            expect(error).toBe('');
        });
    });
});
