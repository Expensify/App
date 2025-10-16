import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import * as FileUtils from '../../src/libs/fileDownload/FileUtils';

jest.useFakeTimers();

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

describe('FileUtils', () => {
    describe('splitExtensionFromFileName', () => {
        it('should return correct file name and extension', () => {
            const file = FileUtils.splitExtensionFromFileName('image.jpg');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return correct file name and extension even with multiple dots on the file name', () => {
            const file = FileUtils.splitExtensionFromFileName('image.pdf.jpg');
            expect(file.fileName).toEqual('image.pdf');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return empty extension if the file name does not have it', () => {
            const file = FileUtils.splitExtensionFromFileName('image');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('');
        });
    });

    describe('appendTimeToFileName', () => {
        it('should append current time to the end of the file name', () => {
            const actualFileName = FileUtils.appendTimeToFileName('image.jpg');
            const expectedFileName = `image-${DateUtils.getDBTime()}.jpg`;
            expect(actualFileName).toEqual(expectedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });

        it('should append current time to the end of the file name without extension', () => {
            const actualFileName = FileUtils.appendTimeToFileName('image');
            const expectedFileName = `image-${DateUtils.getDBTime()}`;
            expect(actualFileName).toEqual(expectedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });
    });

    describe('validateAttachment', () => {
        it('should not return FILE_TOO_SMALL when validating small attachment', () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = FileUtils.validateAttachment(file, false, false);
            expect(error).not.toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return FILE_TOO_SMALL when validating small receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = FileUtils.validateAttachment(file, false, true);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return FILE_TOO_LARGE for large non-image file', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = FileUtils.validateAttachment(file);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return FILE_TOO_LARGE_MULTIPLE when checking multiple files', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = FileUtils.validateAttachment(file, true);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE);
        });

        it('should return WRONG_FILE_TYPE for invalid receipt extension', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = FileUtils.validateAttachment(file, false, true);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should prioritize WRONG_FILE_TYPE over FILE_TOO_LARGE for receipts', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = FileUtils.validateAttachment(file, false, true);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should return WRONG_FILE_TYPE_MULTIPLE when checking multiple invalid receipt files', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = FileUtils.validateAttachment(file, true, true);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE);
        });

        it('should return empty string for valid image receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = FileUtils.validateAttachment(file, false, true);
            expect(error).toBe('');
        });
    });

    describe('canvasFallback', () => {
        const mockCreateImageBitmap = jest.fn();
        const mockCanvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(),
            toBlob: jest.fn(),
        };
        const mockCtx = {
            drawImage: jest.fn(),
        };
        const mockCreateElement = jest.fn();
        const mockURL = {
            createObjectURL: jest.fn(() => 'blob:mock-url'),
        };

        beforeEach(() => {
            jest.clearAllMocks();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (global as any).createImageBitmap = mockCreateImageBitmap;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (global as any).document = {
                createElement: mockCreateElement,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (global as any).URL = mockURL;

            mockCreateElement.mockReturnValue(mockCanvas);
            mockCanvas.getContext.mockReturnValue(mockCtx);
            mockCreateImageBitmap.mockResolvedValue({
                width: 1000,
                height: 800,
                close: jest.fn(),
            });
        });

        afterEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            delete (global as any).createImageBitmap;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            delete (global as any).document;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            delete (global as any).URL;
        });

        it('should reject when createImageBitmap is undefined', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            delete (global as any).createImageBitmap;

            const blob = new Blob(['test'], {type: 'image/heic'});

            await expect(FileUtils.canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas fallback not supported in this browser');
        });

        it('should successfully convert HEIC to JPEG', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            const mockBlob = new Blob(['converted'], {type: 'image/jpeg'});
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(mockBlob));

            const result = await FileUtils.canvasFallback(blob, 'expense.heic');

            expect(result).toBeInstanceOf(File);
            expect(result.type).toBe(CONST.IMAGE_FILE_FORMAT.JPEG);
            expect(result.name).toBe('expense.jpg');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            expect((result as any).uri).toBe('blob:mock-url');
        });

        it('should scale down large images', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            const mockImageBitmap = {width: 8192, height: 4000, close: jest.fn()};
            mockCreateImageBitmap.mockResolvedValue(mockImageBitmap);

            const mockBlob = new Blob(['converted'], {type: 'image/jpeg'});
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(mockBlob));

            await FileUtils.canvasFallback(blob, 'test.heic');

            expect(mockCanvas.width).toBe(4096);
            expect(mockCanvas.height).toBe(2000);
        });

        it('should reject when canvas context is null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockCanvas.getContext.mockReturnValue(null);

            await expect(FileUtils.canvasFallback(blob, 'test.heic')).rejects.toThrow('Could not get canvas context');
        });

        it('should reject when toBlob returns null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(null));

            await expect(FileUtils.canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas conversion failed - returned null blob');
        });
    });
});
