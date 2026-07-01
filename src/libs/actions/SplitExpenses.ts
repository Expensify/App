import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {calculateAmount} from '@libs/IOUUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getTransactionDetails, isOpenReport, isSelfDM} from '@libs/ReportUtils';
import {buildOptimisticTransaction, getChildTransactions, getOriginalTransactionWithSplitInfo, isDistanceRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import {initDraftSplitExpenseDataForEdit, initSplitExpenseItemData, resolveSplitItemReportID, resolveSplitMileageRate, updateSplitExpenseDistanceFromAmount} from './IOU/SplitExpenseItems';

// We read the whole transactions collection here only because `initSplitExpense` runs in the action
// layer (not a component/hook), where `useOnyx` can't be called, and it doesn't affect UI rendering, so
// connectWithoutView avoids re-rendering components when any transaction changes. This data should ONLY
// be used for `initSplitExpense`.
// Do NOT copy this pattern into components/hooks: use `useOnyx` (with a selector to narrow the data)
// there so subscriptions stay scoped, the UI updates when the value changes, and they're torn down with
// the component.
let allTransactions: OnyxCollection<Transaction>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => (allTransactions = value),
});

// We read the whole reports collection here only because `initSplitExpense` runs in the action layer
// (not a component/hook), where `useOnyx` can't be called, and it doesn't affect UI rendering, so
// connectWithoutView avoids re-rendering components when any report changes. This data should ONLY be
// used for `initSplitExpense`.
// Do NOT copy this pattern into components/hooks: use `useOnyx` (with a selector to narrow the data)
// there so subscriptions stay scoped, the UI updates when the value changes, and they're torn down with
// the component.
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(
    transaction: OnyxEntry<Transaction>,
    report: OnyxEntry<Report>,
    // The caller-resolved effective policy for the transaction's report, used for mileage rate resolution in distance requests
    effectivePolicy: OnyxEntry<Policy>,
    selfDMReportID: string | undefined,
    // When set, the caller's workspace is billing-restricted: redirect to RESTRICTED_ACTION instead of opening the split flow
    restrictedActionPolicyID: string | undefined,
    {navigateToEditSplitExpense = false, isProduction = false}: {navigateToEditSplitExpense?: boolean; isProduction?: boolean} = {},
): void {
    if (!transaction) {
        return;
    }

    if (restrictedActionPolicyID) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedActionPolicyID));
        return;
    }

    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];

    if (isProduction && (isSelfDM(report) || isSelfDM(parentReport))) {
        return;
    }
    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const relatedTransactions = getChildTransactions(allTransactions, originalTransactionID, isProduction);
    const hasMultipleSplits = getChildTransactions(allTransactions, originalTransactionID, false).length > 1;
    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const isReportOpen = isOpenReport(transactionReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || (isProduction && isReportOpen));

    const isSelfDMReport = isSelfDM(report) || isSelfDM(parentReport);

    let reportID: string;
    if (isSelfDMReport) {
        // If the report itself is selfDM, use its ID directly.
        // If only the parent is selfDM (e.g. user opened from a transaction thread inside selfDM),
        // use the selfDM parent report ID so the edit screen resolves the correct report name
        // instead of showing the transaction thread name (which uses the expense merchant).
        reportID = (isSelfDM(report) ? report?.reportID : parentReport?.reportID) ?? String(CONST.DEFAULT_NUMBER_ID);
    } else {
        reportID = transaction.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
    }

    if (isExpenseSplit && shouldShowSplitIndicator) {
        const transactionDetails = getTransactionDetails(originalTransaction);
        const splitExpenses = relatedTransactions.map((currentTransaction) => {
            const currentTransactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
            const itemReportID = resolveSplitItemReportID({
                childTransaction: currentTransaction,
                allReports,
                selfDMContextReportID: isSelfDMReport ? reportID : undefined,
                selfDMReportIDFallback: selfDMReportID,
            });
            return initSplitExpenseItemData(currentTransaction, currentTransactionReport, {isManuallyEdited: true, reportID: itemReportID});
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
        if (navigateToEditSplitExpense) {
            const splitExpenseOverviewRoute = isSearchTopmostFullScreenRoute()
                ? ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, originalTransactionID, undefined, Navigation.getActiveRoute())
                : ROUTES.SPLIT_EXPENSE.getRoute(reportID, originalTransactionID, undefined, Navigation.getActiveRoute());
            initDraftSplitExpenseDataForEdit(draftTransaction, transaction.transactionID, reportID);
            Navigation.navigate(ROUTES.SPLIT_EXPENSE_EDIT.getRoute(reportID, originalTransactionID, transaction.transactionID, splitExpenseOverviewRoute));
            return;
        }
        if (isSearchTopmostFullScreenRoute()) {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        }
        return;
    }

    const transactionDetails = getTransactionDetails(transaction);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;

    const splitAmounts = [
        calculateAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', false),
        calculateAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', true),
    ];
    const splitCustomUnits: Array<TransactionCustomUnit | undefined> = [undefined, undefined];
    const splitMerchants: Array<string | undefined> = [undefined, undefined];

    if (isDistanceRequest(transaction)) {
        // Use the caller-resolved `effectivePolicy` (from `useSplitEffectivePolicy`) for the mileage rate so
        // distance calculations stay in sync with the split edit screens; raw `policy` drives only the billing guard.
        const mileageRate = resolveSplitMileageRate({transaction, policy: effectivePolicy ?? undefined, isSelfDMSplit: isSelfDMReport});
        const {rate, unit, currency} = mileageRate;

        if (rate && rate > 0 && transaction?.comment?.customUnit) {
            for (let i = 0; i < splitAmounts.length; i++) {
                if (splitAmounts.at(i)) {
                    const splitAmount = splitAmounts.at(i) ?? 0;
                    const {customUnit: updatedCustomUnit, merchant} = updateSplitExpenseDistanceFromAmount(
                        splitAmount,
                        rate,
                        unit,
                        transaction.comment.customUnit,
                        {currency},
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
            reportID,
            customUnit: splitCustomUnits.at(0),
            merchant: splitMerchants.at(0),
            isManuallyEdited: false,
        }),
        initSplitExpenseItemData(transaction, transactionReport, {
            amount: splitAmounts.at(1) ?? 0,
            transactionID: rand64(),
            reportID,
            customUnit: splitCustomUnits.at(1),
            merchant: splitMerchants.at(1),
            isManuallyEdited: false,
        }),
    ];

    const draftTransaction = buildOptimisticTransaction({
        originalTransactionID: transaction.transactionID,
        existingTransaction: transaction,
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
            customUnit: transaction?.comment?.customUnit,
            odometerStart: transaction?.comment?.odometerStart,
            odometerEnd: transaction?.comment?.odometerEnd,
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
