import type {ValueOf} from 'type-fest';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import {cleanFileName, normalizeFileObject, validateImageForCorruption} from './fileDownload/FileUtils';

type ValidatedFile = {
    fileType: 'file' | 'uri';
    source: string;
    file: FileObject;
};

type SingleAttachmentValidResult = {
    isValid: true;
    validatedFile: ValidatedFile;
};

type SingleAttachmentValidationError = ValueOf<typeof CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS>;
type SingleAttachmentInvalidResult = {
    isValid: false;
    error: SingleAttachmentValidationError;
};

type SingleAttachmentValidationResult = SingleAttachmentValidResult | SingleAttachmentInvalidResult;

function isSingleAttachmentValidationResult(result: unknown): result is SingleAttachmentValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFile' in result || 'error' in result);
}

function validateAttachmentFile(file: FileObject): Promise<SingleAttachmentValidationResult> {
    if (!file) {
        return Promise.resolve({isValid: false, error: CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS.NO_FILE_PROVIDED});
    }

    let fileObject = file;
    if ('getAsFile' in file && typeof file.getAsFile === 'function') {
        fileObject = file.getAsFile() as FileObject;
    }
    if (!fileObject) {
        return Promise.resolve({isValid: false, error: CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS.FILE_INVALID});
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

type MultipleAttachmentsValidationError = ValueOf<typeof CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS>;
type MultipleAttachmentsInvalidResult = {
    isValid: false;
    error: MultipleAttachmentsValidationError;
    fileResults: SingleAttachmentValidationResult[];
};
type MultipleAttachmentsValidationResult = MultipleAttachmentsValidResult | MultipleAttachmentsInvalidResult;

function isMultipleAttachmentsValidationResult(result: unknown): result is MultipleAttachmentsValidationResult {
    return typeof result === 'object' && result !== null && 'isValid' in result && typeof result.isValid === 'boolean' && ('validatedFiles' in result || 'fileResults' in result);
}

function validateMultipleAttachmentFiles(files: FileObject[]): Promise<MultipleAttachmentsValidationResult> {
    if (!files?.length || files.some((f) => isDirectory(f))) {
        return Promise.resolve({isValid: false, error: CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED, fileResults: []});
    }

    if (files.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
        return Promise.resolve({isValid: false, error: CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED, fileResults: []});
    }

    return Promise.all(files.map((f) => validateAttachmentFile(f))).then((results) => {
        if (results.every((result) => result.isValid)) {
            return {
                isValid: true,
                validatedFiles: results.map((result) => (result as SingleAttachmentValidResult).validatedFile),
            };
        }

        return {
            isValid: false,
            error: CONST.MULTIPLE_ATTACHMENT_FILES_VALIDATION_ERRORS.WRONG_FILE_TYPE,
            fileResults: results,
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
                        error: CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS.FILE_TOO_LARGE,
                    } as SingleAttachmentInvalidResult;
                }

                if (normalizedFile.size && normalizedFile.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                    return {
                        isValid: false,
                        error: CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS.FILE_TOO_SMALL,
                    } as SingleAttachmentInvalidResult;
                }

                return {
                    isValid: true,
                } as SingleAttachmentValidResult;
            })
            .catch(() => {
                return {
                    isValid: false,
                    error: CONST.SINGLE_ATTACHMENT_FILE_VALIDATION_ERRORS.FILE_INVALID,
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
