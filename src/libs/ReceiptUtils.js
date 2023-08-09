import lodashGet from 'lodash/get';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import * as FileUtils from './fileDownload/FileUtils';
import CONST from '../CONST';
import Receipt from './actions/Receipt';
import * as Localize from './Localize';
import ReceiptHTML from '../../assets/images/receipt-html.png';
import ReceiptDoc from '../../assets/images/receipt-doc.png';
import ReceiptGeneric from '../../assets/images/receipt-generic.png';
import ReceiptSVG from '../../assets/images/receipt-svg.png';

function validateReceipt(file) {
    const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
    if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.wrongFileType'), Localize.translateLocal('attachmentPicker.notAllowedExtension'));
        return false;
    }

    if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.attachmentTooLarge'), Localize.translateLocal('attachmentPicker.sizeExceeded'));
        return false;
    }

    if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.attachmentTooSmall'), Localize.translateLocal('attachmentPicker.sizeNotMet'));
        return false;
    }

    return true;
};


/**
 * Grab the appropriate receipt image URI based on file type
 *
 * @param {String}  path      URI to image, i.e. blob://new.expensify.com/9ef3a018-4067-47c6-b29f-5f1bd35f213d or expensify.com/receipts/w_e616108497ef940b7210ec6beb5a462d01a878f4.jpg
 * @param {String}  filename  of uploaded image or last part of remote URI
 * @returns {*}
 */
function getImageURI(path, filename) {
    const {fileExtension} = FileUtils.splitExtensionFromFileName(filename);
    const isReceiptImage = Str.isImage(filename);

    if (isReceiptImage) {
        return path;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.HTML) {
        return ReceiptHTML;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.DOC || fileExtension === CONST.IOU.FILE_TYPES.DOCX) {
        return ReceiptDoc;
    }

    if (fileExtension === CONST.IOU.FILE_TYPES.SVG) {
        return ReceiptSVG;
    }

    return ReceiptGeneric;
};

function isBeingScanned(receipt) {
    return receipt.state === CONST.IOU.RECEIPT_STATE.SCANREADY || receipt.state === CONST.IOU.RECEIPT_STATE.SCANNING;
}

export {
    validateReceipt,
    getImageURI,
    isBeingScanned,
};
