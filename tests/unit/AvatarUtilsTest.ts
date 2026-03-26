import {getApiRoot} from '@libs/ApiUtils';
import CONST from '@src/CONST';
import {getValidatedImageSource, isValidExtension, isValidResolution, isValidSize, validateAvatarImage} from '@src/libs/AvatarUtils';
import * as FileUtils from '@src/libs/fileDownload/FileUtils';
import * as getImageResolution from '@src/libs/fileDownload/getImageResolution';
import type {FileObject} from '@src/types/utils/Attachment';

jest.mock('@src/libs/fileDownload/FileUtils');
jest.mock('@src/libs/fileDownload/getImageResolution');

describe('AvatarUtils', () => {
    const mockFileUtils = FileUtils as jest.Mocked<typeof FileUtils>;
    const mockGetImageResolution = getImageResolution as jest.Mocked<typeof getImageResolution>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isValidExtension', () => {
        beforeEach(() => {
            mockFileUtils.splitExtensionFromFileName.mockImplementation((fileName) => {
                const parts = fileName.split('.');
                const extension = parts.at(parts.length - 1);
                const name = parts.slice(0, -1).join('.');
                return {fileName: name, fileExtension: extension ?? ''};
            });
        });

        it.each(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'SVG', 'JpG', 'PnG', 'GiF', 'bMp'])(
            'should return true for allowed extension (case insensitive): %s',
            (ext) => {
                const image: FileObject = {name: `test.${ext}`};
                expect(isValidExtension(image)).toBe(true);
            },
        );

        it.each(['pdf', 'doc', 'txt', 'exe', 'zip'])('should return false for disallowed extension: %s', (ext) => {
            const image: FileObject = {name: `test.${ext}`};
            expect(isValidExtension(image)).toBe(false);
        });

        it('should return false for file without an extension', () => {
            const image: FileObject = {name: 'test'};
            expect(isValidExtension(image)).toBe(false);
        });

        it('should handle undefined name', () => {
            const image: FileObject = {};
            expect(isValidExtension(image)).toBe(false);
        });

        it('should handle files with multiple dots in name', () => {
            const image: FileObject = {name: 'test.file.name.jpg'};
            expect(isValidExtension(image)).toBe(true);
        });
    });

    describe('isValidSize', () => {
        it.each([0, 1000, 1024 * 1024, CONST.AVATAR_MAX_ATTACHMENT_SIZE - 1])('should return true for files within size limit: %i bytes', (size) => {
            const image: FileObject = {size};
            expect(isValidSize(image)).toBe(true);
        });

        it.each([CONST.AVATAR_MAX_ATTACHMENT_SIZE, CONST.AVATAR_MAX_ATTACHMENT_SIZE + 1, CONST.AVATAR_MAX_ATTACHMENT_SIZE * 2])(
            'should return false for files exceeding size limit: %i bytes',
            (size) => {
                const image: FileObject = {size};
                expect(isValidSize(image)).toBe(false);
            },
        );

        it('should handle undefined size as 0', () => {
            const image: FileObject = {};
            expect(isValidSize(image)).toBe(true);
        });

        it('should handle null size as 0', () => {
            const image: FileObject = {size: null};
            expect(isValidSize(image)).toBe(true);
        });
    });

    describe('isValidResolution', () => {
        it.each([
            {width: 800, height: 800, description: 'valid resolution within bounds'},
            {width: CONST.AVATAR_MIN_WIDTH_PX, height: CONST.AVATAR_MIN_HEIGHT_PX, description: 'minimum valid resolution'},
            {width: CONST.AVATAR_MAX_WIDTH_PX, height: CONST.AVATAR_MAX_HEIGHT_PX, description: 'maximum valid resolution'},
            {
                width: 1000,
                height: 500,
                description: 'rectangular images within bounds',
            },
        ])('should return true for $description', ({width, height}) => {
            mockGetImageResolution.default.mockResolvedValue({width, height});

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(true);
        });

        it.each([
            {width: CONST.AVATAR_MIN_WIDTH_PX, height: CONST.AVATAR_MIN_HEIGHT_PX - 1, description: 'height below minimum'},
            {width: CONST.AVATAR_MIN_WIDTH_PX - 1, height: CONST.AVATAR_MIN_HEIGHT_PX, description: 'width below minimum'},
            {width: CONST.AVATAR_MAX_WIDTH_PX, height: CONST.AVATAR_MAX_HEIGHT_PX + 1, description: 'height above maximum'},
            {width: CONST.AVATAR_MAX_WIDTH_PX + 1, height: CONST.AVATAR_MAX_HEIGHT_PX, description: 'width above maximum'},
            {width: 1, height: 1, description: 'very small images'},
            {width: 10000, height: 10000, description: 'very large images'},
        ])('should return false for $description', ({width, height}) => {
            mockGetImageResolution.default.mockResolvedValue({width, height});

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should return false when getImageResolution throws error', () => {
            mockGetImageResolution.default.mockRejectedValue(new Error('Failed to get resolution'));

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });
    });

    describe('validateAvatarImage', () => {
        beforeEach(() => {
            mockFileUtils.splitExtensionFromFileName.mockImplementation((fileName) => {
                const parts = fileName.split('.');
                const extension = parts.at(parts.length - 1);
                const name = parts.slice(0, -1).join('.');
                return {fileName: name, fileExtension: extension ?? ''};
            });
            mockGetImageResolution.default.mockResolvedValue({
                width: 800,
                height: 800,
            });
            mockFileUtils.validateImageForCorruption.mockResolvedValue(undefined);
        });

        it('should return valid result for valid image', async () => {
            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({isValid: true});
        });

        it('should return error for invalid extension', async () => {
            const image: FileObject = {
                name: 'avatar.pdf',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({
                isValid: false,
                errorKey: 'avatarWithImagePicker.notAllowedExtension',
                errorParams: {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS},
            });
        });

        it('should return error for file size exceeding limit', async () => {
            const image: FileObject = {
                name: 'avatar.jpg',
                size: CONST.AVATAR_MAX_ATTACHMENT_SIZE + 1,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({
                isValid: false,
                errorKey: 'avatarWithImagePicker.sizeExceeded',
                errorParams: {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)},
            });
        });

        it('should return error for corrupted image', async () => {
            mockFileUtils.validateImageForCorruption.mockRejectedValue(new Error('Corrupted image'));

            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({
                isValid: false,
                errorKey: 'attachmentPicker.errorWhileSelectingCorruptedAttachment',
                errorParams: {},
            });
        });

        it('should return error for invalid resolution', async () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: 50,
                height: 50,
            });

            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({
                isValid: false,
                errorKey: 'avatarWithImagePicker.resolutionConstraints',
                errorParams: {
                    minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                    minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                    maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                    maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                },
            });
        });

        it('should validate extension before size', async () => {
            const image: FileObject = {
                name: 'avatar.pdf',
                size: CONST.AVATAR_MAX_ATTACHMENT_SIZE + 1,
            };

            const result = await validateAvatarImage(image);
            expect(result.errorKey).toBe('avatarWithImagePicker.notAllowedExtension');
        });

        it('should validate size before corruption check', async () => {
            mockFileUtils.validateImageForCorruption.mockRejectedValue(new Error('Corrupted image'));

            const image: FileObject = {
                name: 'avatar.jpg',
                size: CONST.AVATAR_MAX_ATTACHMENT_SIZE + 1,
            };

            const result = await validateAvatarImage(image);
            expect(result.errorKey).toBe('avatarWithImagePicker.sizeExceeded');
            expect(mockFileUtils.validateImageForCorruption).not.toHaveBeenCalled();
        });

        it('should validate corruption before resolution', async () => {
            mockFileUtils.validateImageForCorruption.mockRejectedValue(new Error('Corrupted image'));
            mockGetImageResolution.default.mockResolvedValue({
                width: 50,
                height: 50,
            });

            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.errorKey).toBe('attachmentPicker.errorWhileSelectingCorruptedAttachment');
            expect(mockGetImageResolution.default).not.toHaveBeenCalled();
        });

        it('should validate all checks in order for a valid image', async () => {
            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            await validateAvatarImage(image);

            expect(mockFileUtils.splitExtensionFromFileName).toHaveBeenCalledWith('avatar.jpg');
            expect(mockFileUtils.validateImageForCorruption).toHaveBeenCalledWith(image);
            expect(mockGetImageResolution.default).toHaveBeenCalledWith(image);
        });

        it.each(['png', 'gif', 'bmp', 'svg', 'jpeg', 'JPG', 'JpG'])('should handle %s images', async (extension) => {
            const image: FileObject = {
                name: `avatar.${extension}`,
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle images at minimum valid dimensions', async () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MIN_WIDTH_PX,
                height: CONST.AVATAR_MIN_HEIGHT_PX,
            });

            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle images at maximum valid dimensions', async () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MAX_WIDTH_PX,
                height: CONST.AVATAR_MAX_HEIGHT_PX,
            });

            const image: FileObject = {
                name: 'avatar.jpg',
                size: CONST.AVATAR_MAX_ATTACHMENT_SIZE - 1,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle resolution check failure gracefully', async () => {
            mockGetImageResolution.default.mockRejectedValue(new Error('Failed to read image'));

            const image: FileObject = {
                name: 'avatar.jpg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result).toEqual({
                isValid: false,
                errorKey: 'avatarWithImagePicker.resolutionConstraints',
                errorParams: {
                    minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                    minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                    maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                    maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                },
            });
        });

        it('should handle image with zero size', async () => {
            const image: FileObject = {
                name: 'avatar.jpg',
                size: 0,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });
    });

    describe('getValidatedImageSource', () => {
        it('should validate number sources', () => {
            expect(getValidatedImageSource(0)).toBe(undefined);
            expect(getValidatedImageSource(1)).toBe(1);
        });

        it('should decode string source', () => {
            const encodedImageFileName = 'avatar.jpg%3Fv%3D123';
            const decodedImageFileName = decodeURIComponent(encodedImageFileName);
            expect(getValidatedImageSource(encodedImageFileName)).toBe(decodedImageFileName);
        });

        it('should validate string source', () => {
            const imageFileName = 'avatar.jpg';
            const absoluteImageFilePath = `/${imageFileName}`;

            const encodedImageFileName = encodeURIComponent(imageFileName);
            const absoluteEncodedImageFilePath = `/${encodedImageFileName}`;

            const apiRoot = getApiRoot({shouldUseSecure: false});
            const prodImageFileUrl = `${apiRoot}${imageFileName}`;
            const encodedProdImageFileUrl = `${apiRoot}${encodedImageFileName}`;

            expect(getValidatedImageSource(absoluteImageFilePath)).toBe(prodImageFileUrl);
            expect(getValidatedImageSource(absoluteEncodedImageFilePath)).toBe(encodedProdImageFileUrl);

            expect(getValidatedImageSource(prodImageFileUrl)).toBe(prodImageFileUrl);
            expect(getValidatedImageSource(encodedProdImageFileUrl)).toBe(prodImageFileUrl);
        });
    });
});
