import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as CollectionUtils from '../CollectionUtils';

const allTransactionData = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (data, key) => {
        if (!key || !data) {
            return;
        }
        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactionData[transactionID] = data;
    },
});

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

/**
 * Detaches the receipt from a transaction
 *
 * @param {String} transactionID
 */
function detachReceipt(transactionID) {
    API.write('DetachReceipt', {transactionID}, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    receipt: {},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    receipt: lodashGet(allTransactionData, [transactionID, 'receipt'], {}),
                },
            },
        ],
    });
}

export default {
    setUploadReceiptError,
    clearUploadReceiptError,
    detachReceipt,
};
