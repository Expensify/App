import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {cleanFileName, hasHeicOrHeifExtension, isValidReceiptExtension, normalizeFileObject, validateImageForCorruption} from './fileDownload/FileUtils';

type ValidateAttachmentValidResult = {
    isValid: true;
    file: FileObject;
};

type ValidateAttachmentInvalidResult = {
    isValid: false;
    error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>;
};

type ValidateAttachmentResult = ValidateAttachmentValidResult | ValidateAttachmentInvalidResult;

async function validateAttachmentFile(file: FileObject, item?: DataTransferItem, isValidatingReceipts = false): Promise<ValidateAttachmentResult> {
    if (!file.name || file.size == null) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_INVALID};
    }

    if (isValidatingReceipts && !isValidReceiptExtension(file)) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE};
    }

    if (hasHeicOrHeifExtension(file)) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE};
    }

    const maxFileSize = isValidatingReceipts ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;
    if (file.size > maxFileSize) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE};
    }

    if (isValidatingReceipts && file.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL};
    }

    let fileObject = file;
    const fileConverted = file.getAsFile?.();
    if (fileConverted) {
        fileObject = fileConverted;
    }

    if (!fileObject) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_INVALID};
    }

    if (isDataTransferItemDirectory(item)) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED};
    }

    const normalizedFile = await normalizeFileObject(fileObject);
    try {
        await validateImageForCorruption(normalizedFile);
    } catch (error) {
        return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED};
    }

    if (normalizedFile instanceof File) {
        /**
         * Cleaning file name, done here so that it covers all cases:
         * upload, drag and drop, copy-paste
         */
        let updatedFile = normalizedFile;
        const cleanName = cleanFileName(updatedFile.name);
        if (updatedFile.name !== cleanName) {
            updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
        }
        const inputSource = URL.createObjectURL(updatedFile);
        updatedFile.uri = inputSource;

        return {isValid: true, file: updatedFile};
    }

    return {isValid: true, file: normalizedFile};
}

function isDataTransferItemDirectory(item: DataTransferItem | undefined) {
    if (item?.kind === 'file' && 'webkitGetAsEntry' in item && item.webkitGetAsEntry()?.isDirectory) {
        return true;
    }

    return false;
}

export default validateAttachmentFile;
export type {ValidateAttachmentResult, ValidateAttachmentValidResult, ValidateAttachmentInvalidResult};
