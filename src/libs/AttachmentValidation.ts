import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import {cleanFileName, isHeicOrHeifImage, isValidReceiptExtension, normalizeFileObject, validateImageForCorruption} from './fileDownload/FileUtils';

type ValidatedFile = {
    fileType: 'file' | 'uri';
    source: string;
    file: FileObject;
};

type SingleAttachmentValidResult = {
    isValid: true;
    validatedFile: ValidatedFile;
};

type SingleAttachmentValidationError = ValueOf<typeof CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE>;
type SingleAttachmentInvalidResult = {
    isValid: false;
    error: SingleAttachmentValidationError;
    file: FileObject;
};

type SingleAttachmentValidationResult = SingleAttachmentValidResult | SingleAttachmentInvalidResult;

function isSingleAttachmentValidationResult(result: unknown): result is SingleAttachmentValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFile' in result || 'error' in result);
}

function validateAttachmentFile(file: FileObject, item?: DataTransferItem, isValidatingReceipt?: boolean): Promise<SingleAttachmentValidationResult> {
    if (!file) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.NO_FILE_PROVIDED, file});
    }

    const maxFileSize = isValidatingReceipt ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;

    const isImage = Str.isImage(file.name ?? '');

    if (isImage && isHeicOrHeifImage(file)) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.HEIC_OR_HEIF_IMAGE, file});
    }

    if (!isImage && !isHeicOrHeifImage(file) && (file?.size ?? 0) > maxFileSize) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE, file});
    }

    if (isValidatingReceipt && (file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL, file});
    }

    if (isValidatingReceipt && !isValidReceiptExtension(file)) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.WRONG_FILE_TYPE, file});
    }

    let fileObject = file;
    if ('getAsFile' in file && typeof file.getAsFile === 'function') {
        fileObject = file.getAsFile() as FileObject;
    }

    if (!fileObject) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_INVALID, file});
    }

    if (item && item.kind === 'file' && 'webkitGetAsEntry' in item) {
        const entry = item.webkitGetAsEntry();

        if (entry?.isDirectory) {
            return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FOLDER_NOT_ALLOWED, file});
        }
    }

    return isFileCorrupted(fileObject).then((corruptionResult) => {
        if (!corruptionResult.isValid) {
            return corruptionResult;
        }

        let validatedFile: ValidatedFile;

        if (fileObject instanceof File) {
            /**
             * Cleaning file name, done here so that it covers all cases:
             * upload, drag and drop, copy-paste
             */
            let updatedFile = fileObject;
            const cleanName = cleanFileName(updatedFile.name);
            if (updatedFile.name !== cleanName) {
                updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
            }
            const inputSource = URL.createObjectURL(updatedFile);
            updatedFile.uri = inputSource;

            validatedFile = {
                fileType: 'file',
                source: inputSource,
                file: updatedFile,
            };

            return {isValid: true, validatedFile};
        }

        validatedFile = {
            fileType: 'uri',
            source: fileObject.uri ?? '',
            file: fileObject,
        };

        return {isValid: true, validatedFile};
    });
}

type MultipleAttachmentsValidResult = {
    isValid: true;
    validatedFiles: ValidatedFile[];
};

type MultipleAttachmentsValidationError = ValueOf<typeof CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES>;
type MultipleAttachmentsInvalidResult = {
    isValid: false;
    error: MultipleAttachmentsValidationError;
    fileResults: SingleAttachmentValidationResult[];
    files: FileObject[];
};
type MultipleAttachmentsValidationResult = MultipleAttachmentsValidResult | MultipleAttachmentsInvalidResult;

function isMultipleAttachmentsValidationResult(result: unknown): result is MultipleAttachmentsValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFiles' in result || 'fileResults' in result);
}

function validateMultipleAttachmentFiles(files: FileObject[], items?: DataTransferItem[]): Promise<MultipleAttachmentsValidationResult> {
    if (!files?.length || files.some((f) => isDirectory(f))) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.FOLDER_NOT_ALLOWED, fileResults: [], files});
    }

    if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
        return Promise.resolve({isValid: false, error: CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.MAX_FILE_LIMIT_EXCEEDED, fileResults: [], files});
    }

    return Promise.all(files.map((f, index) => validateAttachmentFile(f, items?.at(index)))).then((results) => {
        if (results.every((result) => result.isValid)) {
            return {
                isValid: true,
                validatedFiles: results.map((result) => result.validatedFile),
            };
        }

        return {
            isValid: false,
            error: CONST.ATTACHMENT_VALIDATION_ERRORS.MULTIPLE_FILES.WRONG_FILE_TYPE,
            fileResults: results,
            files,
        };
    });
}

function isFileCorrupted(fileObject: FileObject): Promise<SingleAttachmentValidationResult> {
    return normalizeFileObject(fileObject).then((normalizedFile) => {
        return validateImageForCorruption(normalizedFile)
            .then(() => {
                if (normalizedFile.size && normalizedFile.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                    return {
                        isValid: false,
                        error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_LARGE,
                    } as SingleAttachmentInvalidResult;
                }

                if (normalizedFile.size && normalizedFile.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                    return {
                        isValid: false,
                        error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_TOO_SMALL,
                    } as SingleAttachmentInvalidResult;
                }

                return {
                    isValid: true,
                } as SingleAttachmentValidResult;
            })
            .catch(() => {
                return {
                    isValid: false,
                    error: CONST.ATTACHMENT_VALIDATION_ERRORS.SINGLE_FILE.FILE_INVALID,
                } as SingleAttachmentInvalidResult;
            });
    });
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
