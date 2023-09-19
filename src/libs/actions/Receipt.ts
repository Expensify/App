import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as CollectionUtils from '../CollectionUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

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
 * Detaches the receipt from a transaction
 *
 * @param {String} transactionID
 * @param {String} reportID
 */
function detachReceipt(transactionID, reportID) {
    API.write(
        'DetachReceipt',
        {transactionID},
        {
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
        },
    );
    Navigation.navigate(ROUTES.getReportRoute(reportID));
}

export default {
    setUploadReceiptError,
    clearUploadReceiptError,
    detachReceipt,
};
