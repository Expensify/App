import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Sets the upload receipt error modal content when an invalid receipt is uploaded
 *
 * @param {Boolean} isAttachmentInvalid
 * @param {String} attachmentInvalidReasonTitle
 * @param {String} attachmentInvalidReason
 */
function setUploadReceiptError(isAttachmentInvalid, attachmentInvalidReasonTitle, attachmentInvalidReason) {
    Onyx.merge(ONYXKEYS.RECEIPT_MODAL, {
        isAttachmentInvalid,
        attachmentInvalidReasonTitle,
        attachmentInvalidReason,
    });
}

/**
 * Clears the receipt error modal
 */
function clearUploadReceiptError() {
    Onyx.merge(ONYXKEYS.RECEIPT_MODAL, {
        isAttachmentInvalid: false,
        attachmentInvalidReasonTitle: '',
        attachmentInvalidReason: '',
    });
}

export default {
    setUploadReceiptError,
    clearUploadReceiptError,
};
