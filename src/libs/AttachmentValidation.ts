import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {cleanFileName, hasHeicOrHeifExtension, isValidReceiptExtension, normalizeFileObject, validateImageForCorruption} from './fileDownload/FileUtils';

type ValidatedFile = {
    fileType: 'file' | 'uri';
    source?: string;
    file: FileObject;
};

type SingleAttachmentValidResult = {
    isValid: true;
    validatedFile: ValidatedFile;
};

type SingleAttachmentValidationError = ValueOf<typeof CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE>;
type SingleAttachmentInvalidResult = {
    isValid: false;
    error: SingleAttachmentValidationError;
    file: FileObject;
};

type SingleAttachmentValidationResult = SingleAttachmentValidResult | SingleAttachmentInvalidResult;

function isSingleAttachmentValidationResult(result: unknown): result is SingleAttachmentValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFile' in result || 'error' in result);
}

async function validateAttachmentFile(file: FileObject, item?: DataTransferItem, isValidatingReceipts = false): Promise<SingleAttachmentValidationResult> {
    if (!file) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.NO_FILE_PROVIDED, file});
    }

    if (!file.name || file.size == null) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_INVALID, file});
    }

    if (isValidatingReceipts && !isValidReceiptExtension(file)) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE, file});
    }

    if (hasHeicOrHeifExtension(file)) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.HEIC_OR_HEIF_IMAGE, file});
    }

    const isImage = Str.isImage(file.name);
    const maxFileSize = isValidatingReceipts ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;
    if (!isImage && !hasHeicOrHeifExtension(file) && file.size > maxFileSize) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE, file});
    }

    if (isValidatingReceipts && file.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL, file});
    }

    let fileObject = file;
    const fileConverted = file.getAsFile?.();
    if (fileConverted) {
        fileObject = fileConverted;
    }

    if (!fileObject) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_INVALID, file});
    }

    if (item && item.kind === 'file' && 'webkitGetAsEntry' in item) {
        const entry = item.webkitGetAsEntry();

        if (entry?.isDirectory) {
            return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FOLDER_NOT_ALLOWED, file});
        }
    }

    const corruptionResult = await isFileCorrupted(fileObject, isValidatingReceipts);
    if (!corruptionResult.isValid) {
        return {isValid: false, error: corruptionResult.error, file: fileObject};
    }

    const corruptionFreeFile = corruptionResult.file;
    if (corruptionFreeFile instanceof File) {
        /**
         * Cleaning file name, done here so that it covers all cases:
         * upload, drag and drop, copy-paste
         */
        let updatedFile = corruptionFreeFile;
        const cleanName = cleanFileName(updatedFile.name);
        if (updatedFile.name !== cleanName) {
            updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
        }
        const inputSource = URL.createObjectURL(updatedFile);
        updatedFile.uri = inputSource;

        const validatedFile: ValidatedFile = {
            fileType: 'file',
            source: inputSource,
            file: updatedFile,
        };

        return {isValid: true, validatedFile};
    }

    const validatedFile: ValidatedFile = {
        fileType: 'uri',
        source: corruptionFreeFile.uri ?? '',
        file: corruptionFreeFile,
    };

    return {isValid: true, validatedFile};
}

type MultipleAttachmentsValidResult = {
    isValid: true;
    validatedFiles: ValidatedFile[];
};

type MultipleAttachmentsValidationError = ValueOf<typeof CONST.FILE_VALIDATION_ERRORS.MULTIPLE_FILES>;
type MultipleAttachmentsInvalidResult = {
    isValid: false;
    error?: MultipleAttachmentsValidationError;
    fileResults: SingleAttachmentValidationResult[];
    files: FileObject[];
};
type MultipleAttachmentsValidationResult = MultipleAttachmentsValidResult | MultipleAttachmentsInvalidResult;

function isMultipleAttachmentsValidationResult(result: unknown): result is MultipleAttachmentsValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFiles' in result || 'fileResults' in result);
}

async function validateMultipleAttachmentFiles(files: FileObject[], items?: DataTransferItem[], isValidatingReceipts = false): Promise<MultipleAttachmentsValidationResult> {
    if (!files?.length || files.some((f) => isDirectory(f))) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.MULTIPLE_FILES.FOLDER_NOT_ALLOWED, fileResults: [], files});
    }

    if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
        return Promise.resolve({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED, fileResults: [], files});
    }

    const results = await Promise.all(files.map((f, index) => validateAttachmentFile(f, items?.at(index), isValidatingReceipts)));
    if (results.every((result) => result.isValid)) {
        return {
            isValid: true,
            validatedFiles: results.map((r) => r.validatedFile),
        };
    }
    return {
        isValid: false,
        fileResults: results,
        files,
    };
}

type FileCorruptionValidResult = {
    isValid: true;
    file: FileObject;
};
type FileCorruptionInvalidResult = {
    isValid: false;
    error: SingleAttachmentValidationError;
};

type FileCorruptionResult = FileCorruptionValidResult | FileCorruptionInvalidResult;

async function isFileCorrupted(fileObject: FileObject, isValidatingReceipts?: boolean): Promise<FileCorruptionResult> {
    const normalizedFile = await normalizeFileObject(fileObject);

    try {
        await validateImageForCorruption(normalizedFile);

        if (normalizedFile.size && normalizedFile.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            return {
                isValid: false,
                error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE,
            } satisfies FileCorruptionInvalidResult;
        }

        if (isValidatingReceipts !== false && normalizedFile.size && normalizedFile.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            return {
                isValid: false,
                error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL,
            } satisfies FileCorruptionInvalidResult;
        }

        return {
            isValid: true,
            file: normalizedFile,
        } satisfies FileCorruptionValidResult;
    } catch (error) {
        return {
            isValid: false,
            error: CONST.FILE_VALIDATION_ERRORS.SINGLE_FILE.FILE_INVALID,
        } satisfies FileCorruptionInvalidResult;
    }
}

function isDirectory(data: FileObject) {
    if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
        return true;
    }

    return false;
}

export {validateAttachmentFile, validateMultipleAttachmentFiles, isSingleAttachmentValidationResult, isMultipleAttachmentsValidationResult};
export type {
    SingleAttachmentValidationResult,
    SingleAttachmentValidResult,
    SingleAttachmentInvalidResult,
    SingleAttachmentValidationError,
    MultipleAttachmentsValidationResult,
    MultipleAttachmentsValidResult,
    MultipleAttachmentsInvalidResult,
    MultipleAttachmentsValidationError,
};
