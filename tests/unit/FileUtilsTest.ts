import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import DateUtils from '@libs/DateUtils';
import {
    ANDROID_SAFE_FILE_NAME_LENGTH,
    appendTimeToFileName,
    canvasFallback,
    getFileValidationErrorText,
    getImageDimensionsAfterResize,
    splitExtensionFromFileName,
    validateAttachment,
} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';

jest.useFakeTimers();
jest.mock('react-native-image-size');

const createMockFile = (name: string, size: number) => ({
    name,
    size,
});

const createFileNameFromLength = ({length, extension}: {length: number; extension?: string | undefined}): string => `${'a'.repeat(length)}${extension ? `.${extension}` : ''}`;

describe('FileUtils', () => {
    describe('splitExtensionFromFileName', () => {
        it('should return correct file name and extension', () => {
            const file = splitExtensionFromFileName('image.jpg');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return correct file name and extension even with multiple dots on the file name', () => {
            const file = splitExtensionFromFileName('image.pdf.jpg');
            expect(file.fileName).toEqual('image.pdf');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return empty extension if the file name does not have it', () => {
            const file = splitExtensionFromFileName('image');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('');
        });
    });

    describe('appendTimeToFileName', () => {
        it('should append current time to the end of the file name', () => {
            const actualFileName = appendTimeToFileName('image.jpg');
            const expectedFileName = `image-${DateUtils.getDBTime()}.jpg`;
            expect(actualFileName).toEqual(expectedFileName.replaceAll(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });

        it('should append current time to the end of the file name without extension', () => {
            const actualFileName = appendTimeToFileName('image');
            const expectedFileName = `image-${DateUtils.getDBTime()}`;
            expect(actualFileName).toEqual(expectedFileName.replaceAll(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });

        describe('on Android', () => {
            let platformReplaceProperty: jest.ReplaceProperty<string>;

            beforeEach(() => {
                platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'android');
            });

            afterEach(() => {
                platformReplaceProperty.restore();
            });

            it('should truncate the file name to safe length when length exceeds the safe length', () => {
                const fileNameExceedingSafeLength = createFileNameFromLength({length: ANDROID_SAFE_FILE_NAME_LENGTH + 1, extension: 'doc'});

                const actualFileName = appendTimeToFileName(fileNameExceedingSafeLength);
                const expectedTruncatedFileName = `${createFileNameFromLength({length: ANDROID_SAFE_FILE_NAME_LENGTH - 24})}-${DateUtils.getDBTime()}.doc`;

                expect(actualFileName).toEqual(expectedTruncatedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
            });
        });

        describe('on Non-Android', () => {
            const nonAndroidPlatforms = ['ios', 'macos', 'windows', 'web'] as const;

            describe.each(nonAndroidPlatforms)('%s', (platform) => {
                let platformReplaceProperty: jest.ReplaceProperty<string>;

                beforeEach(() => {
                    platformReplaceProperty = jest.replaceProperty(Platform, 'OS', platform);
                });

                afterEach(() => {
                    platformReplaceProperty.restore();
                });

                it('should not truncate the file name even when length exceeds the Android safe length', () => {
                    const fileNameExceedingAndroidSafeLength = createFileNameFromLength({length: ANDROID_SAFE_FILE_NAME_LENGTH + 1, extension: 'doc'});

                    const actualFileName = appendTimeToFileName(fileNameExceedingAndroidSafeLength);
                    const expectedFileName = `${createFileNameFromLength({length: ANDROID_SAFE_FILE_NAME_LENGTH + 1})}-${DateUtils.getDBTime()}.doc`;

                    expect(actualFileName).toEqual(expectedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
                });
            });
        });
    });

    describe('validateAttachment', () => {
        it('should not return FILE_TOO_SMALL when validating small attachment', () => {
            const file = createMockFile('file.csv', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = validateAttachment(file, {isValidatingMultipleFiles: false, isValidatingReceipts: false});
            expect(error).not.toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return FILE_TOO_SMALL when validating small receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1);
            const error = validateAttachment(file, {isValidatingMultipleFiles: false, isValidatingReceipts: true});
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
        });

        it('should return FILE_TOO_LARGE for large non-image file', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = validateAttachment(file);
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
        });

        it('should return FILE_TOO_LARGE_MULTIPLE when checking multiple files', () => {
            const file = createMockFile('file.pdf', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
            const error = validateAttachment(file, {isValidatingMultipleFiles: true, isValidatingReceipts: false});
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_MULTIPLE);
        });

        it('should return WRONG_FILE_TYPE for invalid receipt extension', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = validateAttachment(file, {isValidatingMultipleFiles: false, isValidatingReceipts: true});
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should prioritize WRONG_FILE_TYPE over FILE_TOO_LARGE for receipts', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = validateAttachment(file, {isValidatingMultipleFiles: false, isValidatingReceipts: true});
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        it('should return WRONG_FILE_TYPE_MULTIPLE when checking multiple invalid receipt files', () => {
            const file = createMockFile('receipt.exe', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10);
            const error = validateAttachment(file, {isValidatingMultipleFiles: true, isValidatingReceipts: true});
            expect(error).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE_MULTIPLE);
        });

        it('should return empty string for valid image receipt', () => {
            const file = createMockFile('receipt.jpg', CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1);
            const error = validateAttachment(file, {isValidatingMultipleFiles: false, isValidatingReceipts: true});
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

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas fallback not supported in this browser');
        });

        it('should successfully convert HEIC to JPEG', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            const mockBlob = new Blob(['converted'], {type: 'image/jpeg'});
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(mockBlob));

            const result = await canvasFallback(blob, 'expense.heic');

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

            await canvasFallback(blob, 'test.heic');

            expect(mockCanvas.width).toBe(4096);
            expect(mockCanvas.height).toBe(2000);
        });

        it('should reject when canvas context is null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockCanvas.getContext.mockReturnValue(null);

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Could not get canvas context');
        });

        it('should reject when toBlob returns null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockCanvas.toBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(null));

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas conversion failed - returned null blob');
        });
    });

    describe('getImageDimensionsAfterResize', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        describe('with file:// URLs (native)', () => {
            it('should return scaled dimensions for normal-sized images', async () => {
                (ImageSize.getSize as jest.Mock).mockResolvedValue({width: 4000, height: 3000});

                const file = {uri: 'file://test.jpg', name: 'test.jpg', type: 'image/jpeg'};
                const result = await getImageDimensionsAfterResize(file);

                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
            });

            it('should throw IMAGE_DIMENSIONS_TOO_LARGE error when image exceeds maximum pixel count', async () => {
                // 10000 x 6000 = 60 million pixels, which exceeds MAX_IMAGE_PIXEL_COUNT (50 million)
                (ImageSize.getSize as jest.Mock).mockResolvedValue({width: 10000, height: 6000});

                const file = {uri: 'file://large-image.jpg', name: 'large-image.jpg', type: 'image/jpeg'};

                await expect(getImageDimensionsAfterResize(file)).rejects.toThrow(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);
            });

            it('should not throw for images at exactly the maximum pixel count', async () => {
                // Exactly 50 million pixels (e.g., 10000 x 5000)
                (ImageSize.getSize as jest.Mock).mockResolvedValue({width: 10000, height: 5000});

                const file = {uri: 'file://max-size.jpg', name: 'max-size.jpg', type: 'image/jpeg'};

                await expect(getImageDimensionsAfterResize(file)).resolves.toBeDefined();
            });
        });

        /* eslint-disable no-bitwise */
        describe('with blob: URLs (web) - file header parsing', () => {
            /**
             * Creates a mock JPEG blob with valid SOF0 marker containing specified dimensions.
             * JPEG structure: FF D8 (SOI) + FF E0 ... (APP0) + FF C0 (SOF0) with dimensions
             */
            const createMockJpegBlob = (width: number, height: number): Blob => {
                const bytes = new Uint8Array([
                    // SOI (Start of Image)
                    0xff,
                    0xd8,
                    // APP0 marker (minimal)
                    0xff,
                    0xe0,
                    0x00,
                    0x10,
                    0x4a,
                    0x46,
                    0x49,
                    0x46,
                    0x00,
                    0x01,
                    0x01,
                    0x00,
                    0x00,
                    0x01,
                    0x00,
                    0x01,
                    0x00,
                    0x00,
                    // SOF0 marker (baseline DCT)
                    0xff,
                    0xc0,
                    0x00,
                    0x0b, // segment length (11 bytes)
                    0x08, // precision (8 bits)
                    (height >> 8) & 0xff,
                    height & 0xff, // height (big-endian)
                    (width >> 8) & 0xff,
                    width & 0xff, // width (big-endian)
                    0x01, // number of components
                    0x01,
                    0x11,
                    0x00, // component data
                ]);
                return new Blob([bytes], {type: 'image/jpeg'});
            };

            /**
             * Creates a mock PNG blob with valid IHDR chunk containing specified dimensions.
             * PNG structure: 8-byte signature + IHDR chunk with dimensions
             */
            const createMockPngBlob = (width: number, height: number): Blob => {
                const bytes = new Uint8Array([
                    // PNG signature
                    0x89,
                    0x50,
                    0x4e,
                    0x47,
                    0x0d,
                    0x0a,
                    0x1a,
                    0x0a,
                    // IHDR chunk length (13 bytes)
                    0x00,
                    0x00,
                    0x00,
                    0x0d,
                    // IHDR chunk type
                    0x49,
                    0x48,
                    0x44,
                    0x52,
                    // Width (4 bytes, big-endian)
                    (width >> 24) & 0xff,
                    (width >> 16) & 0xff,
                    (width >> 8) & 0xff,
                    width & 0xff,
                    // Height (4 bytes, big-endian)
                    (height >> 24) & 0xff,
                    (height >> 16) & 0xff,
                    (height >> 8) & 0xff,
                    height & 0xff,
                    // Bit depth, color type, compression, filter, interlace
                    0x08,
                    0x06,
                    0x00,
                    0x00,
                    0x00,
                    // CRC (dummy)
                    0x00,
                    0x00,
                    0x00,
                    0x00,
                ]);
                return new Blob([bytes], {type: 'image/png'});
            };

            const mockFetchWithBlob = (blob: Blob) => {
                global.fetch = jest.fn().mockResolvedValue({
                    blob: () => Promise.resolve(blob),
                });
            };

            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('should read dimensions from JPEG file header (SOF0 marker)', async () => {
                const jpegBlob = createMockJpegBlob(1920, 1080);
                mockFetchWithBlob(jpegBlob);

                const file = {uri: 'blob:http://localhost/test-jpeg', name: 'test.jpg', type: 'image/jpeg'};
                const result = await getImageDimensionsAfterResize(file);

                // Should scale down from 1920x1080 to fit MAX_IMAGE_DIMENSION
                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                // Verify fetch was called with the blob URL
                expect(global.fetch).toHaveBeenCalledWith('blob:http://localhost/test-jpeg');
            });

            it('should read dimensions from PNG file header (IHDR chunk)', async () => {
                const pngBlob = createMockPngBlob(2560, 1440);
                mockFetchWithBlob(pngBlob);

                const file = {uri: 'blob:http://localhost/test-png', name: 'test.png', type: 'image/png'};
                const result = await getImageDimensionsAfterResize(file);

                // Should scale down from 2560x1440 to fit MAX_IMAGE_DIMENSION
                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(global.fetch).toHaveBeenCalledWith('blob:http://localhost/test-png');
            });

            it('should throw IMAGE_DIMENSIONS_TOO_LARGE for large JPEG via blob URL', async () => {
                // 17869 x 12802 = 228,758,938 pixels (exceeds 50MP limit)
                const largeJpegBlob = createMockJpegBlob(17869, 12802);
                mockFetchWithBlob(largeJpegBlob);

                const file = {uri: 'blob:http://localhost/large-image', name: 'large.jpg', type: 'image/jpeg'};

                await expect(getImageDimensionsAfterResize(file)).rejects.toThrow(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);
            });

            it('should throw IMAGE_DIMENSIONS_TOO_LARGE for large PNG via blob URL', async () => {
                // 10000 x 6000 = 60 million pixels (exceeds 50MP limit)
                const largePngBlob = createMockPngBlob(10000, 6000);
                mockFetchWithBlob(largePngBlob);

                const file = {uri: 'blob:http://localhost/large-png', name: 'large.png', type: 'image/png'};

                await expect(getImageDimensionsAfterResize(file)).rejects.toThrow(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);
            });

            it('should fallback to ImageSize.getSize when header parsing fails', async () => {
                // Create an invalid/unrecognized blob (not JPEG or PNG)
                const invalidBlob = new Blob([new Uint8Array([0x00, 0x00, 0x00, 0x00])], {type: 'image/webp'});
                mockFetchWithBlob(invalidBlob);
                (ImageSize.getSize as jest.Mock).mockResolvedValue({width: 800, height: 600});

                const file = {uri: 'blob:http://localhost/unknown-format', name: 'test.webp', type: 'image/webp'};
                const result = await getImageDimensionsAfterResize(file);

                // Should fallback to ImageSize.getSize
                expect(ImageSize.getSize).toHaveBeenCalled();
                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
            });

            it('should handle JPEG with SOF2 marker (progressive)', async () => {
                // Create JPEG with SOF2 (0xC2) marker instead of SOF0
                const bytes = new Uint8Array([
                    0xff,
                    0xd8, // SOI
                    0xff,
                    0xe0,
                    0x00,
                    0x10,
                    0x4a,
                    0x46,
                    0x49,
                    0x46,
                    0x00,
                    0x01,
                    0x01,
                    0x00,
                    0x00,
                    0x01,
                    0x00,
                    0x01,
                    0x00,
                    0x00, // APP0
                    0xff,
                    0xc2, // SOF2 (progressive DCT)
                    0x00,
                    0x0b,
                    0x08,
                    0x04,
                    0x38, // height = 1080 (0x0438)
                    0x07,
                    0x80, // width = 1920 (0x0780)
                    0x01,
                    0x01,
                    0x11,
                    0x00,
                ]);
                const progressiveJpegBlob = new Blob([bytes], {type: 'image/jpeg'});
                mockFetchWithBlob(progressiveJpegBlob);

                const file = {uri: 'blob:http://localhost/progressive-jpeg', name: 'progressive.jpg', type: 'image/jpeg'};
                const result = await getImageDimensionsAfterResize(file);

                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
            });

            it('should not throw for images at exactly the maximum pixel count via blob URL', async () => {
                // Exactly 50 million pixels (e.g., 10000 x 5000)
                const maxSizeJpegBlob = createMockJpegBlob(10000, 5000);
                mockFetchWithBlob(maxSizeJpegBlob);

                const file = {uri: 'blob:http://localhost/max-size', name: 'max-size.jpg', type: 'image/jpeg'};

                await expect(getImageDimensionsAfterResize(file)).resolves.toBeDefined();
            });
        });
        /* eslint-enable no-bitwise */
    });

    describe('getFileValidationErrorText', () => {
        const mockTranslate = ((path: string) => path) as LocaleContextProps['translate'];

        it('should return correct error text for IMAGE_DIMENSIONS_TOO_LARGE', () => {
            const result = getFileValidationErrorText(mockTranslate, CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);

            expect(result.title).toBe('attachmentPicker.attachmentError');
            expect(result.reason).toBe('attachmentPicker.imageDimensionsTooLarge');
        });

        it('should return empty strings for null validation error', () => {
            const result = getFileValidationErrorText(mockTranslate, null);

            expect(result.title).toBe('');
            expect(result.reason).toBe('');
        });
    });
});
