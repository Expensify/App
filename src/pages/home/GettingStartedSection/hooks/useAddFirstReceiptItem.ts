import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {generateReportID, isMoneyRequestReport, isReportOwner, isSelfDM} from '@libs/ReportUtils';
import {isDeletedTransaction, isTransactionPendingDelete} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {accountIDSelector} from '@selectors/Session';
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
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [liveExpenseReportIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions) => {
            const reportIDs = new Set<string>();
            for (const transaction of Object.values(transactions ?? {})) {
                if (transaction?.reportID && !isDeletedTransaction(transaction) && !isTransactionPendingDelete(transaction)) {
                    reportIDs.add(transaction.reportID);
                }
            }
            return [...reportIDs];
        },
    });
    // Approvers and payers also hold other people's expenses locally, so only expenses on the user's own reports count.
    const [hasCreatedExpense = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            !!liveExpenseReportIDs?.some((reportID) => {
                if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                    return true;
                }
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                return isReportOwner(report, currentUserAccountID) && (isMoneyRequestReport(report) || isSelfDM(report));
            }),
    });
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    return {
        // Completes on any of the user's own expenses, so expenses created before this step existed also count.
        addFirstReceiptItem: {
            key: 'addFirstReceipt',
            label: translate('homePage.gettingStartedSection.addFirstReceipt'),
            subText: translate('homePage.gettingStartedSection.addFirstReceiptSubText'),
            isComplete: hasCreatedExpense,
            onPress: () => startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, CONST.IOU.REQUEST_TYPE.SCAN),
        },
        // The selector returns an array once the collection loads, even when it is empty.
        isLoadingTransactions: liveExpenseReportIDs === undefined,
    };
}

export default useAddFirstReceiptItem;
