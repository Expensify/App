import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {
    ANDROID_SAFE_FILE_NAME_LENGTH,
    appendExtensionFromMimeType,
    appendTimeToFileName,
    canvasFallback,
    cleanFileObject,
    cleanFileObjectName,
    createFile,
    getConvertedJpegFileName,
    getDownloadFileName,
    getExportFileName,
    getExtensionFromMimeType,
    getFileNameWithFallback,
    getFilesFromClipboardEvent,
    getFileValidationErrorText,
    getImageDimensionsAfterResize,
    isHighResolutionImage,
    isLabelledDng,
    isLabelledTiff,
    isValidReceiptExtension,
    resizeImageIfNeeded,
    splitExtensionFromFileName,
    validateReceipt,
} from '@libs/fileDownload/FileUtils';
import getImageManipulator from '@libs/fileDownload/getImageManipulator';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';

import createMock from '../utils/createMock';

jest.useFakeTimers();
jest.mock('react-native-image-size');
jest.mock('@libs/fileDownload/getImageManipulator', () => jest.fn());
jest.mock('@libs/getPlatform', () => jest.fn());

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

    describe('receipt extension membership', () => {
        it.each([
            ['receipt.PDF', true],
            ['receipt.JpG', true],
            // Intentionally invalid extension tests strict membership.
            // cspell:disable-next-line
            ['receipt.pdfx', false],
            ['receipt', false],
            ['', false],
        ])('preserves exact case-insensitive membership for %s', (name, expected) => {
            // Given extension fragments must not be accepted as complete receipt extensions.
            const file = {name} satisfies FileObject;

            // When the exported production membership helper checks the filename.
            const result = isValidReceiptExtension(file);

            // Then only strict complete extensions match the allowed receipt tuple.
            expect(result).toBe(expected);
        });

        it('retains receipt error callbacks for disallowed extensions and file sizes', async () => {
            // Given non-image receipts avoid corruption decoding but still require extension and size checks.
            const setError = jest.fn<ReturnType<Parameters<typeof validateReceipt>[1]>, Parameters<Parameters<typeof validateReceipt>[1]>>();

            // When actual receipt validation receives an invalid type, oversize or undersize PDF.
            // Intentionally invalid extension retains the wrong-file-type scenario.
            // cspell:disable-next-line
            const invalidExtension = await validateReceipt({name: 'receipt.pdfx', size: CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE}, setError);
            expect(setError).toHaveBeenLastCalledWith(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
            const tooLarge = await validateReceipt({name: 'receipt.pdf', size: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1}, setError);
            expect(setError).toHaveBeenLastCalledWith(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceededWithLimit');
            const tooSmall = await validateReceipt({name: 'receipt.pdf', size: CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1}, setError);
            expect(setError).toHaveBeenLastCalledWith(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
            const valid = await validateReceipt({name: 'receipt.PDF', size: CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE}, setError);

            // Then invalid results stay false while a valid mixed-case extension does not add an error.
            expect([invalidExtension, tooLarge, tooSmall, valid]).toEqual([false, false, false, true]);
            expect(setError).toHaveBeenCalledTimes(3);
        });
    });

    describe('clipboard extraction and name cleaning', () => {
        const mockCreateObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>().mockReturnValue('blob:clipboard-file');
        let originalCreateObjectURL: PropertyDescriptor | undefined;

        beforeEach(() => {
            originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
            Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: mockCreateObjectURL});
            mockCreateObjectURL.mockClear();
        });

        afterEach(() => {
            if (originalCreateObjectURL) {
                Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
            } else {
                Reflect.deleteProperty(URL, 'createObjectURL');
            }
        });

        it('returns and augments the actual File through clipboard extraction', () => {
            // Given the browser clipboard contains real Files, rather than native descriptors.
            const file = new File(['clipboard bytes'], 'receipt.txt', {type: 'text/plain'});
            const event = createMock<DragEvent>({dataTransfer: {files: createMock<FileList>({length: 1, [Symbol.iterator]: () => [file][Symbol.iterator]()})}});

            // When the real clipboard helper augments that File with a URI.
            const clipboardFiles: File[] = getFilesFromClipboardEvent(event);

            // Then File identity, bytes and MIME stay intact and each URI is created from the File itself.
            expect(clipboardFiles).toHaveLength(1);
            expect(clipboardFiles.at(0)).toBe(file);
            expect(file.uri).toBe('blob:clipboard-file');
            expect(file.size).toBe('clipboard bytes'.length);
            expect(file.type).toBe('text/plain');
            expect(mockCreateObjectURL.mock.calls.map(([blob]) => blob)).toEqual([file]);
        });

        it('keeps null extraction and native descriptors at their existing boundaries', () => {
            // Given failed DataTransferItem extraction is distinct from a valid native descriptor.
            const failedItem = {getAsFile: () => null} satisfies FileObject;
            const descriptor = {name: 'receipt.jpg', type: 'image/jpeg', uri: 'file:///receipt.jpg'} satisfies FileObject;

            // When the actual extraction/name-cleaning functions process those categories.
            const failed = cleanFileObject(failedItem);
            const cleanedFailure = cleanFileObjectName(failed);
            const cleanedDescriptor = cleanFileObjectName(cleanFileObject(descriptor));

            // Then null remains null and descriptors retain identity without creating browser URLs.
            expect(failed).toBeNull();
            expect(cleanedFailure).toBeNull();
            expect(cleanedDescriptor).toBe(descriptor);
            expect(mockCreateObjectURL).not.toHaveBeenCalled();
        });

        it('renames only unsafe File names and retains extraction and URI identity for valid names', async () => {
            // Given only an illegal filename needs a replacement File during name cleaning.
            const file = new File(['file bytes'], 'bad:name.txt', {type: 'text/plain'});
            const item = {getAsFile: () => file} satisfies FileObject;

            // When actual extraction returns the File and cleaning supplies the safe replacement.
            const extracted = cleanFileObject(item);
            const cleaned = cleanFileObjectName(extracted);
            expect(cleaned).toBeInstanceOf(File);
            if (!(cleaned instanceof File)) {
                throw new Error('File name cleaning must return a File');
            }
            const bytes = await new Promise<FileReader['result']>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsText(cleaned);
            });

            // Then bytes/MIME survive renaming and repeated cleaning does not replace or recreate the URI.
            expect(extracted).toBe(file);
            expect(cleaned).not.toBe(file);
            expect(cleaned.name).toBe('bad_name.txt');
            expect(cleaned.type).toBe(file.type);
            expect(bytes).toBe('file bytes');
            expect(cleaned.uri).toBe('blob:clipboard-file');
            expect(cleanFileObjectName(cleaned)).toBe(cleaned);
            expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
        });
    });

    describe('getFileNameWithFallback', () => {
        it('should return the given file name when there is one', () => {
            expect(getFileNameWithFallback('statement.qfx', 'file:///tmp/other.csv', 'spreadsheet')).toEqual('statement.qfx');
        });

        it('should read the file name from the URI when the picker returns no name', () => {
            expect(getFileNameWithFallback(null, 'file:///private/var/mobile/Containers/Data/Application/ABC/tmp/statement.qfx', 'spreadsheet')).toEqual('statement.qfx');
        });

        it('should decode the file name read from the URI and replace illegal characters', () => {
            expect(getFileNameWithFallback(null, 'file:///tmp/bank%20statement%3A2026.qfx', 'spreadsheet')).toEqual('bank statement_2026.qfx');
        });

        it('should return the default file name when the URI has no extension either', () => {
            expect(getFileNameWithFallback(null, 'content://com.android.providers.media.documents/document/12345', 'spreadsheet')).toEqual('spreadsheet');
        });

        it('should return the default file name when both the name and the URI are empty', () => {
            expect(getFileNameWithFallback('', '', 'spreadsheet')).toEqual('spreadsheet');
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

    describe('getExportFileName', () => {
        it('builds the expensify_<name>_<id> filename, sanitizes and lowercases the export name', () => {
            expect(getExportFileName('Current view', '123abc')).toEqual('expensify_current_view_123abc.csv');
        });

        it('replaces every illegal character in the export name with an underscore', () => {
            expect(getExportFileName('All Data - expense level', 'abc')).toEqual('expensify_all_data_-_expense_level_abc.csv');
        });

        it('honors a custom extension', () => {
            expect(getExportFileName('Current view', 'abc', 'xlsx')).toEqual('expensify_current_view_abc.xlsx');
        });
    });

    describe('canvasFallback', () => {
        const mockCloseImageBitmap = jest.fn<ReturnType<ImageBitmap['close']>, Parameters<ImageBitmap['close']>>();
        const mockCtx = createMock<CanvasRenderingContext2D>({
            drawImage: jest.fn(),
        });
        let mockCanvas2DContext: CanvasRenderingContext2D | null;
        function mockCanvasGetContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
        function mockCanvasGetContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null;
        function mockCanvasGetContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
        function mockCanvasGetContext(contextId: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;
        function mockCanvasGetContext(contextId: Parameters<HTMLCanvasElement['getContext']>[0]): GPUCanvasContext | null;
        function mockCanvasGetContext(contextId: string, options?: unknown): RenderingContext | null;
        function mockCanvasGetContext(contextId: string): RenderingContext | GPUCanvasContext | null {
            return contextId === '2d' ? mockCanvas2DContext : null;
        }
        const productionGetContext: HTMLCanvasElement['getContext'] = mockCanvasGetContext;
        const mockCanvas = createMock<HTMLCanvasElement>({
            width: 0,
            height: 0,
            getContext: productionGetContext,
            toBlob: () => undefined,
        });
        let mockImageBitmap: ImageBitmap;
        let mockToBlob: jest.SpiedFunction<HTMLCanvasElement['toBlob']>;
        let mockCreateElement: jest.SpiedFunction<Document['createElement']>;
        let restoreCreateObjectURL: () => void;
        const mockCreateImageBitmap: typeof globalThis.createImageBitmap = () => Promise.resolve(mockImageBitmap);

        beforeEach(() => {
            jest.clearAllMocks();

            mockCanvas.width = 0;
            mockCanvas.height = 0;
            mockCanvas2DContext = mockCtx;
            mockImageBitmap = createMock<ImageBitmap>({
                width: 1000,
                height: 800,
                close: mockCloseImageBitmap,
            });

            if (typeof globalThis.URL.createObjectURL === 'function') {
                const mockCreateObjectURL = jest.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
                restoreCreateObjectURL = () => mockCreateObjectURL.mockRestore();
            } else {
                globalThis.URL.createObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>().mockReturnValue('blob:mock-url');
                restoreCreateObjectURL = () => {
                    Reflect.deleteProperty(globalThis.URL, 'createObjectURL');
                };
            }

            mockToBlob = jest.spyOn(mockCanvas, 'toBlob');
            mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
            globalThis.createImageBitmap = mockCreateImageBitmap;
        });

        afterEach(() => {
            mockToBlob.mockRestore();
            mockCreateElement.mockRestore();
            restoreCreateObjectURL();
            Reflect.deleteProperty(globalThis, 'createImageBitmap');
        });

        it('should reject when createImageBitmap is undefined', async () => {
            Reflect.deleteProperty(globalThis, 'createImageBitmap');

            const blob = new Blob(['test'], {type: 'image/heic'});

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas fallback not supported in this browser');
        });

        it('should successfully convert HEIC to JPEG', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            const mockBlob = new Blob(['converted'], {type: 'image/jpeg'});
            mockToBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(mockBlob));

            const result = await canvasFallback(blob, 'expense.heic');

            expect(result).toBeInstanceOf(File);
            expect(result.type).toBe(CONST.IMAGE_FILE_FORMAT.JPEG);
            expect(result.name).toBe('expense.jpg');
            expect(result).toHaveProperty('uri', 'blob:mock-url');
        });

        it('should scale down large images', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockImageBitmap = createMock<ImageBitmap>({width: 8192, height: 4000, close: mockCloseImageBitmap});

            const mockBlob = new Blob(['converted'], {type: 'image/jpeg'});
            mockToBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(mockBlob));

            await canvasFallback(blob, 'test.heic');

            expect(mockCanvas.width).toBe(4096);
            expect(mockCanvas.height).toBe(2000);
        });

        it('should reject when canvas context is null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockCanvas2DContext = null;

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Could not get canvas context');
        });

        it('should reject when toBlob returns null', async () => {
            const blob = new Blob(['test'], {type: 'image/heic'});
            mockToBlob.mockImplementation((callback: (blob: Blob | null) => void) => callback(null));

            await expect(canvasFallback(blob, 'test.heic')).rejects.toThrow('Canvas conversion failed - returned null blob');
        });
    });

    describe('getImageDimensionsAfterResize', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        describe('with file:// URLs (native)', () => {
            it('should return scaled dimensions for normal-sized images', async () => {
                jest.mocked(ImageSize.getSize).mockResolvedValue({width: 4000, height: 3000});

                const file = {uri: 'file://test.jpg', name: 'test.jpg', type: 'image/jpeg'};
                const result = await getImageDimensionsAfterResize(file);

                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
            });

            it('should throw IMAGE_DIMENSIONS_TOO_LARGE error when image exceeds maximum pixel count', async () => {
                // 10000 x 6000 = 60 million pixels, which exceeds MAX_IMAGE_PIXEL_COUNT (50 million)
                jest.mocked(ImageSize.getSize).mockResolvedValue({width: 10000, height: 6000});

                const file = {uri: 'file://large-image.jpg', name: 'large-image.jpg', type: 'image/jpeg'};

                await expect(getImageDimensionsAfterResize(file)).rejects.toThrow(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);
            });

            it('should not throw for images at exactly the maximum pixel count', async () => {
                // Exactly 50 million pixels (e.g., 10000 x 5000)
                jest.mocked(ImageSize.getSize).mockResolvedValue({width: 10000, height: 5000});

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
                global.fetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>().mockResolvedValue(
                    createMock<Response>({
                        blob: () => Promise.resolve(blob),
                    }),
                );
            };

            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('should read dimensions from JPEG file header (SOF0 marker)', async () => {
                // Given non-square JPEG dimensions distinguish width and height offsets.
                const jpegBlob = createMockJpegBlob(1920, 1080);
                mockFetchWithBlob(jpegBlob);

                // When the actual reader and parser decode the binary header.
                const file = {uri: 'blob:http://localhost/test-jpeg', name: 'test.jpg', type: 'image/jpeg'};
                const result = await getImageDimensionsAfterResize(file);

                // Then scaling preserves the exact dimensions from the JPEG offsets.
                expect(result).toEqual({width: CONST.MAX_IMAGE_DIMENSION, height: 1080 * (CONST.MAX_IMAGE_DIMENSION / 1920)});
                // Should scale down from 1920x1080 to fit MAX_IMAGE_DIMENSION
                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                // Verify fetch was called with the blob URL
                expect(global.fetch).toHaveBeenCalledWith('blob:http://localhost/test-jpeg');
            });

            it('should read dimensions from PNG file header (IHDR chunk)', async () => {
                // Given non-square PNG dimensions distinguish the two IHDR offsets.
                const pngBlob = createMockPngBlob(2560, 1440);
                mockFetchWithBlob(pngBlob);

                // When the actual reader and parser decode the PNG header.
                const file = {uri: 'blob:http://localhost/test-png', name: 'test.png', type: 'image/png'};
                const result = await getImageDimensionsAfterResize(file);

                // Then both IHDR dimensions are retained before scaling.
                expect(result).toEqual({width: CONST.MAX_IMAGE_DIMENSION, height: 1440 * (CONST.MAX_IMAGE_DIMENSION / 2560)});
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
                jest.mocked(ImageSize.getSize).mockResolvedValue({width: 800, height: 600});

                const file = {uri: 'blob:http://localhost/unknown-format', name: 'test.webp', type: 'image/webp'};
                const result = await getImageDimensionsAfterResize(file);

                // Should fallback to ImageSize.getSize
                expect(ImageSize.getSize).toHaveBeenCalled();
                expect(result.width).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
                expect(result.height).toBeLessThanOrEqual(CONST.MAX_IMAGE_DIMENSION);
            });

            it.each([null, 'not an ArrayBuffer'])('falls back when FileReader.result is %p', async (readerResult) => {
                // Given readAsArrayBuffer normally produces binary data, while absence or another member cannot be parsed.
                mockFetchWithBlob(new Blob(['unrecognized header']));
                jest.spyOn(FileReader.prototype, 'result', 'get').mockReturnValue(readerResult);
                jest.mocked(ImageSize.getSize).mockResolvedValue({width: 800, height: 600});

                // When the real exported resize interface reaches its header-reader boundary.
                const result = await getImageDimensionsAfterResize({name: 'receipt.png', uri: 'blob:reader-result'});

                // Then the established ImageSize fallback retains its URI and scaled dimensions.
                expect(ImageSize.getSize).toHaveBeenCalledWith('blob:reader-result');
                expect(result).toEqual({width: CONST.MAX_IMAGE_DIMENSION, height: 600 * (CONST.MAX_IMAGE_DIMENSION / 800)});
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

    describe('createFile', () => {
        afterEach(() => {
            jest.mocked(getPlatform).mockReset();
        });

        it('should keep the uri when cloning a File on web', () => {
            // Given a web File that carries a blob uri for previewing
            jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
            const file = new File(['content'], 'image.jpeg', {type: 'image/jpeg'});
            file.uri = 'blob:http://localhost/image';

            const clonedFile = createFile(file);

            // Then the clone keeps the uri, because attachment previews read it to display the image
            expect(clonedFile).toBeInstanceOf(File);
            expect(clonedFile).not.toBe(file);
            expect(clonedFile.uri).toBe('blob:http://localhost/image');
            expect(clonedFile.name).toBe('image.jpeg');
            expect(clonedFile.type).toBe('image/jpeg');
        });

        it('should keep the uri when cloning a file on native', () => {
            jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
            const file = new File(['content'], 'image.jpeg', {type: 'image/jpeg'});
            file.uri = 'file://image.jpeg';

            const clonedFile = createFile(file);

            expect(clonedFile).toEqual({uri: 'file://image.jpeg', name: 'image.jpeg', type: 'image/jpeg'});
        });
    });

    describe('resizeImageIfNeeded', () => {
        afterEach(() => {
            jest.mocked(getPlatform).mockReset();
            jest.mocked(getImageManipulator).mockReset();
        });

        it('should return a resized File with a uri on web when the image is larger than the max size', async () => {
            // Given an image on web that is larger than the max attachment size, and an image manipulator that returns a File with a blob uri
            jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
            jest.mocked(ImageSize.getSize).mockResolvedValue({width: 6000, height: 4000});
            const resizedFile = new File(['resized'], 'large.jpeg', {type: 'image/jpeg'});
            resizedFile.uri = 'blob:http://localhost/resized';
            jest.mocked(getImageManipulator).mockResolvedValue(resizedFile);
            const file = {uri: 'file://large.jpg', name: 'large.jpg', type: 'image/jpeg', size: CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1};

            const result = await resizeImageIfNeeded(file);

            // Then the result keeps the resized blob uri, so the attachment preview can load it instead of spinning forever
            expect(result).toBeInstanceOf(File);
            expect(result.uri).toBe('blob:http://localhost/resized');
        });
    });

    describe('isHighResolutionImage', () => {
        it('should return false when resolution is null', () => {
            expect(isHighResolutionImage(null)).toBe(false);
        });

        it('should not treat narrow tall images under the safe pixel count as high resolution', () => {
            expect(isHighResolutionImage({width: 864, height: 24174})).toBe(false);
        });

        it('should not treat images at exactly the safe pixel count as high resolution', () => {
            expect(isHighResolutionImage({width: 10000, height: 5000})).toBe(false);
        });

        it('should treat images above the safe pixel count as high resolution', () => {
            expect(isHighResolutionImage({width: 10000, height: 5001})).toBe(true);
        });
    });

    describe('getFileValidationErrorText', () => {
        const mockTranslate: LocaleContextProps['translate'] = (path, ...parameters) => {
            parameters.some(() => false);
            return path;
        };

        it('should return correct error text for IMAGE_DIMENSIONS_TOO_LARGE', () => {
            const result = getFileValidationErrorText(mockTranslate, {error: CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE});

            expect(result.title).toBe('attachmentPicker.attachmentError');
            expect(result.reason).toBe('attachmentPicker.imageDimensionsTooLarge');
        });

        it('should return the folder-specific error text for a single folder', () => {
            const result = getFileValidationErrorText(mockTranslate, {error: CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED});

            expect(result.title).toBe('attachmentPicker.attachmentError');
            expect(result.reason).toBe('attachmentPicker.folderNotAllowedMessage');
        });

        it('should return the folder-specific error text when multiple items are selected', () => {
            const result = getFileValidationErrorText(mockTranslate, {
                error: CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED,
                isValidatingMultipleFiles: true,
            });

            expect(result.title).toBe('attachmentPicker.someFilesCantBeUploaded');
            expect(result.reason).toBe('attachmentPicker.folderNotAllowedMessage');
        });

        it('should return empty strings for null validation error', () => {
            const result = getFileValidationErrorText(mockTranslate, null);

            expect(result.title).toBe('');
            expect(result.reason).toBe('');
        });
    });

    describe('isLabelledTiff', () => {
        it.each([
            ['an Android gallery DNG', {name: 'PXL_20260101.dng', type: 'image/x-adobe-dng'}],
            ['a document-picked DNG with an upper-case extension', {name: 'IMG_0001.DNG', type: 'image/x-adobe-dng'}],
            ['a DNG the platform gave no MIME type', {name: 'PXL_20260101.dng', type: null}],
            ['a TIFF by MIME type only', {name: 'scan', type: 'image/tiff'}],
            ['a .tif by extension only', {name: 'scan.tif', type: null}],
            ['a .tiff by extension only', {name: 'scan.tiff', type: undefined}],
        ])('recognizes %s', (description, file) => {
            // Given a file labelled as TIFF/DNG by at least one of its name or MIME type
            // When checked
            // Then it is treated as a TIFF/DNG so the picker transcodes it
            expect(isLabelledTiff(file)).toBe(true);
        });

        it.each([
            ['an iOS gallery pick relabelled as JPEG', {name: '1A2B.jpg', type: 'image/jpg'}],
            ['a HEIC', {name: 'photo.heic', type: 'image/heic'}],
            ['a PDF', {name: 'receipt.pdf', type: 'application/pdf'}],
            ['a file with no name or type', {name: null, type: null}],
            ['a file whose name merely contains the extension', {name: 'dng-notes.txt', type: 'text/plain'}],
        ])('does not match %s', (description, file) => {
            // Given a file that isn't labelled as TIFF/DNG (an iOS gallery pick has to be sniffed by magic bytes instead)
            // When checked
            // Then it is left alone
            expect(isLabelledTiff(file)).toBe(false);
        });
    });

    describe('isLabelledDng', () => {
        it.each([
            ['a DNG by extension', {name: 'IMG_0001.DNG', type: null}, true],
            ['a DNG by MIME type', {name: 'photo', type: 'image/x-adobe-dng'}, true],
            ['a plain TIFF', {name: 'scan.tiff', type: 'image/tiff'}, false],
            ['a JPEG', {name: 'photo.jpg', type: 'image/jpeg'}, false],
            ['nothing', {name: null, type: null}, false],
        ])('returns %s for %s', (description, file, expected) => {
            // Given a file label
            // When checked for DNG specifically
            // Then only DNGs match, since TIFFs are an accepted receipt format and must not be swept up with them
            expect(isLabelledDng(file)).toBe(expected);
        });
    });

    describe('getConvertedJpegFileName', () => {
        it.each([
            ['swaps a DNG extension for .jpg', 'IMG_0001.DNG', 'IMG_0001.jpg'],
            ['swaps a HEIC extension for .jpg', 'photo.heic', 'photo.jpg'],
            ['keeps a relabelled .jpg name as-is', 'D1F3.jpg', 'D1F3.jpg'],
            ['appends .jpg to a name with no extension', 'raw', 'raw.jpg'],
            ['keeps dots inside the base name', 'trip.day 2.dng', 'trip.day 2.jpg'],
        ])('%s', (description, originalFileName, expected) => {
            // Given the name the picker returned for an image about to be transcoded
            // When the JPEG's name is derived from it
            // Then the user's name is kept and only the extension changes, so the upload doesn't get the converter's random name
            expect(getConvertedJpegFileName(originalFileName, 'ABCD.jpg')).toBe(expected);
        });

        it.each([undefined, null, ''])('falls back to the converted file name when the picker gave %p', (originalFileName) => {
            // Given a picker that returned no file name
            // When the JPEG's name is derived
            // Then the name of the file the converter saved is used, since there is no picked name to keep
            expect(getConvertedJpegFileName(originalFileName, 'ABCD.jpg')).toBe('ABCD.jpg');
        });
    });

    describe('getDownloadFileName', () => {
        const source = 'https://staging.expensify.com/chat-attachments/123/w_9cb3daa39e7b4276ab18285ee51d65b461b38aa5.csv';

        it('leaves a name that already carries its extension alone', () => {
            // Given a display name that already ends in the stored file extension
            const displayName = 'PerDiem-2024-11-21_10_02_48.939.csv';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, source);

            // Then the name is used as is, with no second extension appended
            expect(downloadName).toBe('PerDiem-2024-11-21_10_02_48.939.csv');
        });

        it('takes the extension from the source when a rename dropped it', () => {
            // Given a label the author renamed to something without an extension
            const displayName = '1234';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, source);

            // Then the stored file extension is appended so the download still opens as a csv
            expect(downloadName).toBe('1234.csv');
        });

        it('appends the extension when the only dot in the name is not an extension', () => {
            // Given a label whose only dot is part of the text rather than an extension
            const displayName = 'Q3.2026 numbers';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, source);

            // Then the stored file extension is still appended
            expect(downloadName).toBe('Q3.2026 numbers.csv');
        });

        it('keeps the source extension even when the name ends in a different one', () => {
            // Given a label that ends in a different extension from the stored file
            const displayName = 'report.txt';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, source);

            // Then the stored file extension wins, since it is the real file type
            expect(downloadName).toBe('report.txt.csv');
        });

        it('matches the extension case-insensitively', () => {
            // Given a label that carries the stored file extension in upper case
            const displayName = 'report.CSV';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, source);

            // Then the extension is recognized and not appended again
            expect(downloadName).toBe('report.CSV');
        });

        it('leaves the name alone when the source has no extension either', () => {
            // Given a label without an extension, stored under a URL that has none to borrow
            const displayName = '1234';

            // When the download name is built from it
            const downloadName = getDownloadFileName(displayName, 'https://staging.expensify.com/chat-attachments/123/w_9cb3daa');

            // Then the name is left as is rather than gaining an empty extension
            expect(downloadName).toBe('1234');
        });
    });

    describe('getExtensionFromMimeType', () => {
        it('should return the primary extension registered for a known MIME type', () => {
            // Given a MIME type mime-db knows
            // When the extension is looked up
            // Then the first registered extension is returned
            expect(getExtensionFromMimeType('video/mp4')).toBe('mp4');
            expect(getExtensionFromMimeType('image/jpeg')).toBe('jpeg');
            expect(getExtensionFromMimeType('application/pdf')).toBe('pdf');
        });

        it('should return mov for a QuickTime video', () => {
            // Given the QuickTime MIME type, which mime-db lists as `qt` first
            // When the extension is looked up
            // Then `mov` is returned, because `Str.isVideo` doesn't recognize `qt` and the file would render as a generic file
            expect(getExtensionFromMimeType('video/quicktime')).toBe('mov');
        });

        it('should return undefined for an unknown or missing MIME type', () => {
            // Given a MIME type that is unregistered, empty or undefined
            // When the extension is looked up
            // Then nothing is returned, so callers can decide their own fallback rather than guess wrong
            expect(getExtensionFromMimeType('application/not-a-real-type')).toBeUndefined();
            expect(getExtensionFromMimeType('')).toBeUndefined();
            expect(getExtensionFromMimeType(undefined)).toBeUndefined();
        });
    });

    describe('appendExtensionFromMimeType', () => {
        it('should add the extension when the name has none', () => {
            // Given a name with no extension, as an Android content:// URI or a null picker name produces
            // When the MIME type is known
            // Then the extension is recovered so the downloaded file is not a generic document
            expect(appendExtensionFromMimeType('1000000042', 'video/mp4')).toBe('1000000042.mp4');
            expect(appendExtensionFromMimeType(CONST.DEFAULT_ATTACHMENT_FILENAME, 'video/mp4')).toBe(`${CONST.DEFAULT_ATTACHMENT_FILENAME}.mp4`);
        });

        it('should leave a name that already has an extension alone', () => {
            // Given a name that already carries an extension
            // When the MIME type disagrees with it
            // Then the original name wins, because the picker's name is more trustworthy than the MIME type
            expect(appendExtensionFromMimeType('recording.mov', 'video/mp4')).toBe('recording.mov');
        });

        it('should leave the name alone when the MIME type cannot be resolved', () => {
            // Given a name with no extension
            // When the MIME type is unknown, empty or undefined
            // Then no extension is invented, because a wrong extension is worse than none
            expect(appendExtensionFromMimeType('1000000042', 'application/not-a-real-type')).toBe('1000000042');
            expect(appendExtensionFromMimeType('1000000042', '')).toBe('1000000042');
            expect(appendExtensionFromMimeType('1000000042', undefined)).toBe('1000000042');
        });

        it('should leave the name alone for application/octet-stream instead of adding .bin', () => {
            // Given a name with no extension whose MIME type is the generic one the Android document picker reports
            // When the extension is recovered
            // Then no meaningless .bin extension is added
            expect(appendExtensionFromMimeType('1000000042', 'application/octet-stream')).toBe('1000000042');
        });

        it('should return an empty name unchanged', () => {
            // Given no name at all
            // When an extension is requested
            // Then nothing is produced, since a bare ".mp4" is not a usable file name
            expect(appendExtensionFromMimeType('', 'video/mp4')).toBe('');
        });
    });
});
