import {Str} from 'expensify-common';
import findLast from 'lodash/findLast';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {ReceiptError, ReceiptSource} from '@src/types/onyx/Transaction';
import {isLocalFile as isLocalFileFileUtils, splitExtensionFromFileName, validateImageForCorruption} from './fileDownload/FileUtils';
import {hasReceipt, hasReceiptSource, isFetchingWaypointsFromServer} from './TransactionUtils';

type ThumbnailAndImageURI = {
    image?: string;
    thumbnail?: string;
    transaction?: OnyxEntry<Transaction>;
    isLocalFile?: boolean;
    isThumbnail?: boolean;
    filename?: string;
    fileExtension?: string;
    isEmptyReceipt?: boolean;
};

/**
 * Grab the appropriate receipt image and thumbnail URIs based on file type
 *
 * @param transaction
 * @param receiptPath
 * @param receiptFileName
 */
function getThumbnailAndImageURIs(transaction: OnyxEntry<Transaction>, receiptPath: ReceiptSource | null = null, receiptFileName: string | null = null): ThumbnailAndImageURI {
    if (!hasReceipt(transaction) && !receiptPath && !receiptFileName) {
        return {isEmptyReceipt: true};
    }
    if (isFetchingWaypointsFromServer(transaction)) {
        return {isThumbnail: true, isLocalFile: true};
    }
    // If there're errors, we need to display them in preview. We can store many files in errors, but we just need to get the last one
    const errors = findLast(transaction?.errors) as ReceiptError | undefined;
    // URI to image, i.e. blob:new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
    const path = errors?.source ?? transaction?.receipt?.source ?? receiptPath ?? '';
    // filename of uploaded image or last part of remote URI
    const filename = errors?.filename ?? transaction?.filename ?? receiptFileName ?? '';
    const isReceiptImage = Str.isImage(filename);
    const hasEReceipt = !hasReceiptSource(transaction) && transaction?.hasEReceipt;
    const isReceiptPDF = Str.isPDF(filename);

    if (hasEReceipt) {
        return {image: ROUTES.ERECEIPT.getRoute(transaction.transactionID), transaction, filename};
    }

    // For local files, we won't have a thumbnail yet
    if ((isReceiptImage || isReceiptPDF) && typeof path === 'string' && (path.startsWith('blob:') || path.startsWith('file:'))) {
        return {image: path, isLocalFile: true, filename};
    }

    if (isReceiptImage) {
        return {thumbnail: `${path}.1024.jpg`, image: path, filename};
    }

    if (isReceiptPDF && typeof path === 'string') {
        return {thumbnail: `${path.substring(0, path.length - 4)}.jpg.1024.jpg`, image: path, filename};
    }

    const isLocalFile = isLocalFileFileUtils(path);
    const {fileExtension} = splitExtensionFromFileName(filename);
    return {isThumbnail: true, fileExtension: Object.values(CONST.IOU.FILE_TYPES).find((type) => type === fileExtension), image: path, isLocalFile, filename};
}

type ValidateReceiptResult = {
    isValid: boolean;
    title?: TranslationPaths;
    reason?: TranslationPaths;
};
/**
 * Validate a given receipt file for correctness and adherence to file constraints
 */
function validateReceipt(file: FileObject): Promise<ValidateReceiptResult> {
    return validateImageForCorruption(file)
        .then(() => {
            const {fileExtension} = splitExtensionFromFileName(file?.name ?? '');
            const extension = fileExtension.toLowerCase() as TupleToUnion<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>;

            if (!CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS.includes(extension)) {
                return {
                    isValid: false,
                    title: 'attachmentPicker.wrongFileType' as TranslationPaths,
                    reason: 'attachmentPicker.notAllowedExtension' as TranslationPaths,
                };
            }

            if (!Str.isImage(file.name ?? '') && (file?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE) {
                return {
                    isValid: false,
                    title: 'attachmentPicker.attachmentTooLarge' as TranslationPaths,
                    reason: 'attachmentPicker.sizeExceededWithLimit' as TranslationPaths,
                };
            }

            if ((file?.size ?? 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                return {
                    isValid: false,
                    title: 'attachmentPicker.attachmentTooSmall' as TranslationPaths,
                    reason: 'attachmentPicker.sizeNotMet' as TranslationPaths,
                };
            }

            return {isValid: true};
        })
        .catch(() => {
            return {
                isValid: false,
                title: 'attachmentPicker.attachmentError' as TranslationPaths,
                reason: 'attachmentPicker.errorWhileSelectingCorruptedAttachment' as TranslationPaths,
            };
        });
}

// eslint-disable-next-line import/prefer-default-export
export {getThumbnailAndImageURIs, validateReceipt};
export type {ThumbnailAndImageURI};
