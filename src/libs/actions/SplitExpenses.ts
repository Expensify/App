import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateAmount} from '@libs/IOUUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {buildOptimisticTransaction, getChildTransactions, getOriginalTransactionWithSplitInfo, isDistanceRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import {initSplitExpenseItemData, updateSplitExpenseDistanceFromAmount} from './IOU/Split';

// We use connectWithoutView because `initSplitExpense` doesn't affect the UI rendering and
// this avoids unnecessary re-rendering for components when any transaction changes. This data should ONLY
// be used for `initSplitExpense`
let allTransactions: OnyxCollection<Transaction>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => (allTransactions = value),
});

// We use connectWithoutView because `initSplitExpense` doesn't affect the UI rendering and
// this avoids unnecessary re-rendering for components when any report changes. This data should ONLY
// be used for `initSplitExpense`
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(transaction: OnyxEntry<Transaction>, policy?: OnyxEntry<Policy>): void {
    if (!transaction) {
        return;
    }

    const reportID = transaction.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    if (isExpenseSplit) {
        const relatedTransactions = getChildTransactions(allTransactions, allReports, originalTransactionID);
        const transactionDetails = getTransactionDetails(originalTransaction);
        const splitExpenses = relatedTransactions.map((currentTransaction) => {
            const currentTransactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
            return initSplitExpenseItemData(currentTransaction, currentTransactionReport, {isManuallyEdited: true});
        });
        const draftTransaction = buildOptimisticTransaction({
            originalTransactionID,
            transactionParams: {
                splitExpenses,
                splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
                amount: transactionDetails?.amount ?? 0,
                currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
                participants: transaction?.participants,
                merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
                attendees: transactionDetails?.attendees as Attendee[],
                reportID,
                reimbursable: transactionDetails?.reimbursable,
            },
        });

        Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, draftTransaction);
        if (isSearchTopmostFullScreenRoute()) {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        }
        return;
    }

    const transactionDetails = getTransactionDetails(transaction);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;
    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];

    const splitAmounts = [
        calculateAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', false),
        calculateAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', true),
    ];
    const splitCustomUnits: Array<TransactionCustomUnit | undefined> = [undefined, undefined];
    const splitMerchants: Array<string | undefined> = [undefined, undefined];

    if (isDistanceRequest(transaction)) {
        const mileageRate = DistanceRequestUtils.getRate({transaction, policy: policy ?? undefined});
        const {unit, rate} = mileageRate;

        if (rate && rate > 0 && transaction?.comment?.customUnit) {
            for (let i = 0; i < splitAmounts.length; i++) {
                if (splitAmounts.at(i)) {
                    const splitAmount = splitAmounts.at(i) ?? 0;
                    const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                        splitAmount,
                        rate,
                        unit,
                        transaction.comment.customUnit,
                        mileageRate,
                        transactionDetails?.currency,
                    );

                    splitCustomUnits[i] = updatedCustomUnit;
                    splitMerchants[i] = merchant;
                }
            }
        }
    }

    const splitExpenses = [
        initSplitExpenseItemData(transaction, transactionReport, {
            amount: splitAmounts.at(0) ?? 0,
            transactionID: rand64(),
            customUnit: splitCustomUnits.at(0),
            merchant: splitMerchants.at(0),
            isManuallyEdited: false,
        }),
        initSplitExpenseItemData(transaction, transactionReport, {
            amount: splitAmounts.at(1) ?? 0,
            transactionID: rand64(),
            customUnit: splitCustomUnits.at(1),
            merchant: splitMerchants.at(1),
            isManuallyEdited: false,
        }),
    ];

    const draftTransaction = buildOptimisticTransaction({
        originalTransactionID: transaction.transactionID,
        transactionParams: {
            splitExpenses,
            splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
            amount: transactionDetailsAmount,
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            merchant: transactionDetails?.merchant ?? '',
            participants: transaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            reimbursable: transactionDetails?.reimbursable,
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction?.transactionID}`, draftTransaction);

    if (isSearchTopmostFullScreenRoute()) {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    } else {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    }
}

export default initSplitExpense;
