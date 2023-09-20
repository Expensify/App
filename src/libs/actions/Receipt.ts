import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Sets the upload receipt error modal content when an invalid receipt is uploaded
 */
function setUploadReceiptError(isAttachmentInvalid: boolean, attachmentInvalidReasonTitle: string, attachmentInvalidReason: string) {
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

/**
 * Close the receipt modal
 */
function closeUploadReceiptModal() {
    Onyx.merge(ONYXKEYS.RECEIPT_MODAL, {
        isAttachmentInvalid: false,
    });
}

export default {
    setUploadReceiptError,
    clearUploadReceiptError,
    closeUploadReceiptModal,
};
