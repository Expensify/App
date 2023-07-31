import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setUploadReceiptError(isAttachmentInvalid, attachmentInvalidReasonTitle, attachmentInvalidReason) {
    Onyx.merge(ONYXKEYS.RECEIPT_MODAL, {
        isAttachmentInvalid,
        attachmentInvalidReasonTitle,
        attachmentInvalidReason,
    });
}

function clearUploadReceiptError() {
    Onyx.merge(ONYXKEYS.RECEIPT_MODAL, {
        isAttachmentInvalid: false,
    });
}

export default {
    setUploadReceiptError,
    clearUploadReceiptError,
};
