import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import {isValidExtension, isValidResolution, isValidSize, validateAvatarImage} from '@src/libs/AvatarUtils';
import * as FileUtils from '@src/libs/fileDownload/FileUtils';
import * as getImageResolution from '@src/libs/fileDownload/getImageResolution';

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

        it('should return false for file without extension', () => {
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
        it('should return true for files within size limit', () => {
            const validSizes = [0, 1000, 1024 * 1024, CONST.AVATAR_MAX_ATTACHMENT_SIZE - 1];

            validSizes.forEach((size) => {
                const image: FileObject = {size};
                expect(isValidSize(image)).toBe(true);
            });
        });

        it('should return false for files exceeding size limit', () => {
            const invalidSizes = [CONST.AVATAR_MAX_ATTACHMENT_SIZE, CONST.AVATAR_MAX_ATTACHMENT_SIZE + 1, CONST.AVATAR_MAX_ATTACHMENT_SIZE * 2];

            invalidSizes.forEach((size) => {
                const image: FileObject = {size};
                expect(isValidSize(image)).toBe(false);
            });
        });

        it('should handle undefined size as 0', () => {
            const image: FileObject = {};
            expect(isValidSize(image)).toBe(true);
        });

        it('should handle null size as 0', () => {
            const image: FileObject = {size: null};
            expect(isValidSize(image)).toBe(true);
        });

        it('should return true for exactly the maximum allowed size minus 1 byte', () => {
            const image: FileObject = {size: CONST.AVATAR_MAX_ATTACHMENT_SIZE - 1};
            expect(isValidSize(image)).toBe(true);
        });

        it('should return false for exactly the maximum allowed size', () => {
            const image: FileObject = {size: CONST.AVATAR_MAX_ATTACHMENT_SIZE};
            expect(isValidSize(image)).toBe(false);
        });
    });

    describe('isValidResolution', () => {
        it('should return true for valid resolution within bounds', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: 800,
                height: 800,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(true);
        });

        it('should return true for minimum valid resolution', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MIN_WIDTH_PX,
                height: CONST.AVATAR_MIN_HEIGHT_PX,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(true);
        });

        it('should return true for maximum valid resolution', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MAX_WIDTH_PX,
                height: CONST.AVATAR_MAX_HEIGHT_PX,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(true);
        });

        it('should return false for height below minimum', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MIN_WIDTH_PX,
                height: CONST.AVATAR_MIN_HEIGHT_PX - 1,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should return false for width below minimum', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MIN_WIDTH_PX - 1,
                height: CONST.AVATAR_MIN_HEIGHT_PX,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should return false for height above maximum', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MAX_WIDTH_PX,
                height: CONST.AVATAR_MAX_HEIGHT_PX + 1,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should return false for width above maximum', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: CONST.AVATAR_MAX_WIDTH_PX + 1,
                height: CONST.AVATAR_MAX_HEIGHT_PX,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should return false when getImageResolution throws error', () => {
            mockGetImageResolution.default.mockRejectedValue(new Error('Failed to get resolution'));

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should handle very small images', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: 1,
                height: 1,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should handle very large images', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: 10000,
                height: 10000,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(false);
        });

        it('should handle rectangular images within bounds', () => {
            mockGetImageResolution.default.mockResolvedValue({
                width: 1000,
                height: 500,
            });

            const image: FileObject = {name: 'test.jpg'};
            return expect(isValidResolution(image)).resolves.toBe(true);
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

        it('should handle PNG images', async () => {
            const image: FileObject = {
                name: 'avatar.png',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle GIF images', async () => {
            const image: FileObject = {
                name: 'avatar.gif',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle BMP images', async () => {
            const image: FileObject = {
                name: 'avatar.bmp',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle SVG images', async () => {
            const image: FileObject = {
                name: 'avatar.svg',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle JPEG images', async () => {
            const image: FileObject = {
                name: 'avatar.jpeg',
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

        it('should handle image with uppercase extension', async () => {
            const image: FileObject = {
                name: 'avatar.JPG',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
        });

        it('should handle image with mixed case extension', async () => {
            const image: FileObject = {
                name: 'avatar.JpG',
                size: 1024 * 1024,
            };

            const result = await validateAvatarImage(image);
            expect(result.isValid).toBe(true);
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
});
