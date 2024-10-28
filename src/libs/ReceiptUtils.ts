import {Str} from 'expensify-common';
import findLast from 'lodash/findLast';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {ReceiptError, ReceiptSource} from '@src/types/onyx/Transaction';
import * as FileUtils from './fileDownload/FileUtils';
import * as TransactionUtils from './TransactionUtils';

type ThumbnailAndImageURI = {
    image?: string;
    thumbnail?: string;
    transaction?: OnyxEntry<Transaction>;
    isLocalFile?: boolean;
    isThumbnail?: boolean;
    filename?: string;
    fileExtension?: string;
};

/**
 * Grab the appropriate receipt image and thumbnail URIs based on file type
 *
 * @param transaction
 * @param receiptPath
 * @param receiptFileName
 */
function getThumbnailAndImageURIs(transaction: OnyxEntry<Transaction>, receiptPath: ReceiptSource | null = null, receiptFileName: string | null = null): ThumbnailAndImageURI {
    if (TransactionUtils.isFetchingWaypointsFromServer(transaction)) {
        return {isThumbnail: true, isLocalFile: true};
    }
    // If there're errors, we need to display them in preview. We can store many files in errors, but we just need to get the last one
    const errors = findLast(transaction?.errors) as ReceiptError | undefined;
    // URI to image, i.e. blob:new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
    const path = errors?.source ?? transaction?.receipt?.source ?? receiptPath ?? '';
    // filename of uploaded image or last part of remote URI
    const filename = errors?.filename ?? transaction?.filename ?? receiptFileName ?? '';
    const isReceiptImage = Str.isImage(filename);
    const hasEReceipt = !TransactionUtils.hasReceiptSource(transaction) && transaction?.hasEReceipt;
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

    const isLocalFile = FileUtils.isLocalFile(path);
    const {fileExtension} = FileUtils.splitExtensionFromFileName(filename);
    return {isThumbnail: true, fileExtension: Object.values(CONST.IOU.FILE_TYPES).find((type) => type === fileExtension), image: path, isLocalFile, filename};
}

// eslint-disable-next-line import/prefer-default-export
export {getThumbnailAndImageURIs};
export type {ThumbnailAndImageURI};
