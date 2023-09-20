import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as CollectionUtils from '../CollectionUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as OnyxTypes from '../../types/onyx';
import CONST from '../../CONST';

type TransactionMap = {
    [key: string]: OnyxTypes.Transaction;
};

const allTransactionData: TransactionMap = {};
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
 */
function detachReceipt(transactionID: string, reportID: string) {
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
    Navigation.navigate(ROUTES.getReportRoute(reportID), CONST.NAVIGATION.TYPE.UP);
}

/*
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
    detachReceipt,
    closeUploadReceiptModal,
};
