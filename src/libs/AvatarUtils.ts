import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject} from '@src/types/utils/Attachment';
import {splitExtensionFromFileName, validateImageForCorruption} from './fileDownload/FileUtils';
import getImageResolution from './fileDownload/getImageResolution';
import tryResolveUrlFromApiRoot from './tryResolveUrlFromApiRoot';
import type {AvatarSource} from './UserUtils';

/**
 * Validation result containing error information if validation fails
 */
type ValidationResult = {
    isValid: boolean;
    errorKey?: TranslationPaths;
    errorParams?: Record<string, unknown>;
};

/**
 * Validates if an image file has an allowed extension.
 *
 * @param image - The image file object to validate
 * @returns true if the file extension is in the allowed list
 */
function isValidExtension(image: FileObject): boolean {
    const {fileExtension} = splitExtensionFromFileName(image?.name ?? '');
    return CONST.AVATAR_ALLOWED_EXTENSIONS.some((extension) => extension === fileExtension.toLowerCase());
}

/**
 * Validates if an image file size is within allowed limits.
 *
 * @param image - The image file object to validate
 * @returns true if the file size is less than the maximum allowed
 */
function isValidSize(image: FileObject): boolean {
    return (image?.size ?? 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;
}

/**
 * Validates if an image resolution meets the avatar constraints.
 *
 * @param image - The image file object to validate
 * @returns Promise resolving to true if resolution is within bounds
 */
async function isValidResolution(image: FileObject): Promise<boolean> {
    try {
        const {height, width} = await getImageResolution(image);
        return height >= CONST.AVATAR_MIN_HEIGHT_PX && width >= CONST.AVATAR_MIN_WIDTH_PX && height <= CONST.AVATAR_MAX_HEIGHT_PX && width <= CONST.AVATAR_MAX_WIDTH_PX;
    } catch {
        return false;
    }
}

/**
 * Comprehensively validates an avatar image file.
 * Checks extension, size, corruption, and resolution.
 *
 * @param image - The image file object to validate
 * @returns Promise resolving to ValidationResult with error details if validation fails
 *
 * @example
 * ```typescript
 * const result = await validateAvatarImage(file);
 * if (!result.isValid) {
 *   showError(result.errorKey, result.errorParams);
 * }
 * ```
 */
async function validateAvatarImage(image: FileObject): Promise<ValidationResult> {
    if (!isValidExtension(image)) {
        return {
            isValid: false,
            errorKey: 'avatarWithImagePicker.notAllowedExtension',
            errorParams: {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS},
        };
    }

    if (!isValidSize(image)) {
        return {
            isValid: false,
            errorKey: 'avatarWithImagePicker.sizeExceeded',
            errorParams: {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)},
        };
    }

    try {
        await validateImageForCorruption(image);
    } catch {
        return {
            isValid: false,
            errorKey: 'attachmentPicker.errorWhileSelectingCorruptedAttachment',
            errorParams: {},
        };
    }

    const validResolution = await isValidResolution(image);
    if (!validResolution) {
        return {
            isValid: false,
            errorKey: 'avatarWithImagePicker.resolutionConstraints',
            errorParams: {
                minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
            },
        };
    }

    return {isValid: true};
}

function getValidatedImageSource(source: AvatarSource | undefined) {
    const numberSource = Number(source);

    if (!Number.isNaN(numberSource) && numberSource !== 0) {
        return numberSource;
    }

    if (typeof source === 'string') {
        return tryResolveUrlFromApiRoot(decodeURIComponent(source));
    }

    return undefined;
}

export {isValidExtension, isValidSize, isValidResolution, validateAvatarImage, getValidatedImageSource};
