import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {hasHeicOrHeifExtension, isValidReceiptExtension, normalizeFileObject, validateImageForCorruption} from './fileDownload/FileUtils';

type AttachmentValidationResult = ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null;

async function validateAttachmentFile(file: FileObject, item?: DataTransferItem, isValidatingReceipts = false): Promise<AttachmentValidationResult> {
    if (!file.name || file.size == null) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_INVALID;
    }

    if (isValidatingReceipts && !isValidReceiptExtension(file)) {
        return CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE;
    }

    if (hasHeicOrHeifExtension(file)) {
        return CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE;
    }

    const isImage = Str.isImage(file.name);
    const maxFileSize = isValidatingReceipts ? CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE : CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE;
    if (!isImage && !hasHeicOrHeifExtension(file) && file.size > maxFileSize) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE;
    }

    if (isValidatingReceipts && file.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL;
    }

    let fileObject = file;
    const fileConverted = file.getAsFile?.();
    if (fileConverted) {
        fileObject = fileConverted;
    }

    if (!fileObject) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_INVALID;
    }

    if (isDataTransferItemDirectory(item)) {
        return CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED;
    }

    const normalizedFile = await normalizeFileObject(fileObject);
    try {
        await validateImageForCorruption(normalizedFile);
    } catch (error) {
        return CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED;
    }

    return null;
}

function isDataTransferItemDirectory(item: DataTransferItem | undefined) {
    if (item && item.kind === 'file' && 'webkitGetAsEntry' in item && item.webkitGetAsEntry()?.isDirectory) {
        return true;
    }

    return false;
}

export default validateAttachmentFile;
