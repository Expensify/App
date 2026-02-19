import {validateAttachmentFile, validateMultipleAttachmentFiles} from '@libs/AttachmentValidation';
import CONST from '../../src/CONST';

jest.useFakeTimers();

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

describe('AttachmentValidation', () => {
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
                fail('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL);
        });

        it('should return SINGLE_FILE.FILE_TOO_LARGE for large non-image file', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const result = await validateAttachmentFile(file);

            if (result.isValid) {
                fail('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE);
        });

        it('should return SINGLE_FILE.WRONG_FILE_TYPE for invalid receipt extension', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                fail('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE);
        });

        it('should prioritize SINGLE_FILE.WRONG_FILE_TYPE over SINGLE_FILE.FILE_TOO_LARGE for receipts', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const result = await validateAttachmentFile(file, undefined, true);

            if (result.isValid) {
                fail('validateAttachmentFile should return an invalid result');
            }

            expect(result.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE);
        });

        it('should return empty string for valid image receipt', async () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const result = await validateAttachmentFile(file, undefined, true);

            expect(result.isValid).toBe(true);
        });
    });

    describe('validateMultipleAttachmentFiles', () => {
        it('should return MULTIPLE_FILES.FILE_TOO_LARGE when checking multiple files', async () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const result = await validateMultipleAttachmentFiles([file], undefined, false);

            if (result.isValid) {
                fail('validateMultipleAttachmentFiles should return an invalid result');
            }

            expect(result.error).toEqual(undefined);

            const firstFileResult = result.fileResults.at(0);

            if (!firstFileResult || firstFileResult.isValid) {
                fail('firstFileResult should be defined and valid');
            }

            expect(firstFileResult.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE);
        });

        it('should return WRONG_FILE_TYPE_MULTIPLE when checking multiple invalid receipt files', async () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const result = await validateMultipleAttachmentFiles([file], undefined, true);

            if (result.isValid) {
                fail('validateMultipleAttachmentFiles should return an invalid result');
            }

            const firstFileResult = result.fileResults.at(0);

            if (!firstFileResult || firstFileResult.isValid) {
                fail('firstFileResult should be defined and valid');
            }

            expect(firstFileResult.error).toEqual(CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE);
        });
    });
});
