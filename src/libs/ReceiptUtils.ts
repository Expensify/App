import Str from 'expensify-common/lib/str';
import _ from 'lodash';
import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ReceiptDoc from '@assets/images/receipt-doc.png';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import ReceiptHTML from '@assets/images/receipt-html.png';
import ReceiptSVG from '@assets/images/receipt-svg.png';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import * as FileUtils from './fileDownload/FileUtils';
import * as TransactionUtils from './TransactionUtils';

type ThumbnailAndImageURI = {
    image: ImageSourcePropType | string;
    thumbnail: ImageSourcePropType | string | null;
    transaction?: Transaction;
    isLocalFile?: boolean;
    filename?: string;
};

type FileNameAndExtension = {
    fileExtension?: string;
    fileName?: string;
};

/**
 * Grab the appropriate receipt image and thumbnail URIs based on file type
 *
 * @param transaction
 * @param receiptPath
 * @param receiptFileName
 */
function getThumbnailAndImageURIs(transaction: OnyxEntry<Transaction>, receiptPath: string | null = null, receiptFileName: string | null = null): ThumbnailAndImageURI {
    if (TransactionUtils.isFetchingWaypointsFromServer(transaction)) {
        return {thumbnail: null, image: ReceiptGeneric, isLocalFile: true};
    }
    // URI to image, i.e. blob:new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
    // If there're errors, we need to display them in preview. We can store many files in errors, but we just need to get the last one
    const errors = _.findLast(transaction?.errors) as ReceiptError | undefined;
    const path = errors?.source ?? transaction?.receipt?.source ?? receiptPath ?? '';
    // filename of uploaded image or last part of remote URI
    const filename = errors?.filename ?? transaction?.filename ?? receiptFileName ?? '';
    const isReceiptImage = Str.isImage(filename);
    const hasEReceipt = transaction?.hasEReceipt;
    const isReceiptPDF = Str.isPDF(filename);

    if (hasEReceipt) {
        return {thumbnail: null, image: ROUTES.ERECEIPT.getRoute(transaction.transactionID), transaction, filename};
    }

    // For local files, we won't have a thumbnail yet
    if ((isReceiptImage || isReceiptPDF) && typeof path === 'string' && (path.startsWith('blob:') || path.startsWith('file:'))) {
        return {thumbnail: null, image: path, isLocalFile: true, filename};
    }

    if (isReceiptImage) {
        return {thumbnail: `${path}.1024.jpg`, image: path, filename};
    }

    if (isReceiptPDF && typeof path === 'string') {
        return {thumbnail: `${path.substring(0, path.length - 4)}.jpg.1024.jpg`, image: path, filename};
    }

    const {fileExtension} = FileUtils.splitExtensionFromFileName(filename) as FileNameAndExtension;
    let image = ReceiptGeneric;
    if (fileExtension === CONST.IOU.FILE_TYPES.HTML) {
        image = ReceiptHTML;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.DOC || fileExtension === CONST.IOU.FILE_TYPES.DOCX) {
        image = ReceiptDoc;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.SVG) {
        image = ReceiptSVG;
    }

    const isLocalFile = typeof path === 'number' || path.startsWith('blob:') || path.startsWith('file:') || path.startsWith('/');
    return {thumbnail: image, image: path, isLocalFile, filename};
}

// eslint-disable-next-line import/prefer-default-export
export {getThumbnailAndImageURIs};
export type {ThumbnailAndImageURI};
