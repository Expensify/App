import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {generateReportID} from '@libs/ReportUtils';
import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';

import type {GettingStartedItem} from './useGettingStartedItems';

/** Builds the "Add your first receipt" step that every Getting started list shares. */
type UseAddFirstReceiptItemResult = {
    addFirstReceiptItem: GettingStartedItem;

    /** Until transactions load, the step reads as incomplete even for a user who already has expenses */
    isLoadingTransactions: boolean;
};

function useAddFirstReceiptItem(): UseAddFirstReceiptItemResult {
    const {translate} = useLocalize();
    const [hasCreatedExpense] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => Object.values(transactions ?? {}).some((transaction) => !!transaction && !isDeletedTransaction(transaction) && !isTransactionPendingDelete(transaction)),
    });
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    return {
        // Completes on any expense the user has, so expenses created before this step existed also count.
        addFirstReceiptItem: {
            key: 'addFirstReceipt',
            label: translate('homePage.gettingStartedSection.addFirstReceipt'),
            subText: translate('homePage.gettingStartedSection.addFirstReceiptSubText'),
            isComplete: !!hasCreatedExpense,
            onPress: () => startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, CONST.IOU.REQUEST_TYPE.SCAN),
        },
        // The selector returns a boolean once the collection loads, even when it is empty.
        isLoadingTransactions: hasCreatedExpense === undefined,
    };
}

export default useAddFirstReceiptItem;
