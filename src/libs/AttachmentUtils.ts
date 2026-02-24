import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {cleanFileName, validateImageForCorruption} from './fileDownload/FileUtils';

type AttachmentValidationError = CorruptionError | 'fileDoesNotExist' | 'fileInvalid';
type ValidResult = {
    isValid: true;
    fileType: 'file' | 'uri';
    source: string;
    file: FileObject;
};
type InvalidResult = {
    isValid: false;
    error: AttachmentValidationError;
};

type AttachmentValidationResult = ValidResult | InvalidResult;

function validateAttachmentFile(file: FileObject): Promise<AttachmentValidationResult> {
    if (!file || !isDirectoryCheck(file)) {
        return Promise.resolve({isValid: false, error: 'fileDoesNotExist'});
    }

    let fileObject = file;
    const fileConverted = file.getAsFile?.();
    if (fileConverted) {
        fileObject = fileConverted;
    }
    if (!fileObject) {
        return Promise.resolve({isValid: false, error: 'fileInvalid'});
    }

    return isFileCorrupted(fileObject).then((corruptionResult) => {
        if (!corruptionResult.isValid) {
            return corruptionResult as InvalidResult;
        }

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

            return {isValid: true, fileType: 'file', source: inputSource, file: updatedFile} as ValidResult;
        }

        return {isValid: true, fileType: 'uri', source: fileObject.uri, file: fileObject} as ValidResult;
    });
}

type CorruptionError = 'tooLarge' | 'tooSmall' | 'error';
type NoCorruptionResult = {
    isValid: true;
};
type CorruptionResult = {
    isValid: false;
    error: CorruptionError;
};
type AttachmentCorruptionValidationResult = NoCorruptionResult | CorruptionResult;

function isFileCorrupted(fileObject: FileObject): Promise<AttachmentCorruptionValidationResult> {
    return validateImageForCorruption(fileObject)
        .then(() => {
            if (fileObject.size && fileObject.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                return {
                    isValid: false,
                    error: 'tooLarge',
                } satisfies AttachmentCorruptionValidationResult;
            }

            if (fileObject.size && fileObject.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                return {
                    isValid: false,
                    error: 'tooSmall',
                } satisfies AttachmentCorruptionValidationResult;
            }

            return {
                isValid: true,
            } satisfies AttachmentCorruptionValidationResult;
        })
        .catch(() => {
            return {
                isValid: false,
                error: 'error',
            };
        });
}

function isDirectoryCheck(data: FileObject) {
    if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
        return false;
    }

    return true;
}

export default validateAttachmentFile;
export type {AttachmentValidationResult};
