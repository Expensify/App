import TestReceipt from '@assets/images/fake-receipt.png';
import setTestReceipt from '@libs/actions/setTestReceipt';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setMoneyRequestReceipt} from '@userActions/IOU';
import {removeDraftTransactions} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';

/**
 * Creates a handler function that sets a test receipt and navigates to the confirmation step.
 * Used by the test infrastructure via the onLayout pattern.
 */
function createTestReceiptHandler(
    transactionID: string,
    isEditing: boolean,
    navigateToConfirmationStep: (files: ReceiptFile[], locationPermissionGranted: boolean, isTestTransaction: boolean) => void,
): () => void {
    return () => {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(transactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            removeDraftTransactions(true);
            navigateToConfirmationStep([{file, source, transactionID}], false, true);
        });
    };
}

export default createTestReceiptHandler;
