import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
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

// We use connectWithoutView because `initSplitExpense` doesn't affect the UI rendering and
// this avoids unnecessary re-rendering for components when any policy changes. This data should ONLY
// be used for `initSplitExpense`
let allPolicies: OnyxCollection<Policy>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

// We use connectWithoutView because `initSplitExpense` doesn't affect the UI rendering and
// this avoids unnecessary re-rendering for components when the selfDM report ID changes. This data should ONLY
// be used for `initSplitExpense`
let selfDMReportID: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.SELF_DM_REPORT_ID,
    callback: (value) => (selfDMReportID = value ?? undefined),
});

/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(transaction: OnyxEntry<Transaction>, policy?: OnyxEntry<Policy>, report?: OnyxEntry<Report>): void {
    if (!transaction) {
        return;
    }

    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const relatedTransactions = getChildTransactions(allTransactions, originalTransactionID);
    const hasMultipleSplits = relatedTransactions.length > 1;
    const transactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const isReportOpen = isOpenReport(transactionReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);

    const isSelfDMReport = isSelfDM(report) || isSelfDM(parentReport);

    let reportID;
    if (isSelfDMReport) {
        // If the report itself is selfDM, use its ID directly.
        // If only the parent is selfDM (e.g. user opened from a transaction thread inside selfDM),
        // use the selfDM parent report ID so the edit screen resolves the correct report name
        // instead of showing the transaction thread name (which uses the expense merchant).
        reportID = isSelfDM(report) ? report?.reportID : parentReport?.reportID;
    } else {
        reportID = transaction.reportID;
    }

    if (isExpenseSplit && shouldShowSplitIndicator) {
        const transactionDetails = getTransactionDetails(originalTransaction);
        const splitExpenses = relatedTransactions.map((currentTransaction) => {
            const currentTransactionReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
            let itemReportID: string | undefined;
            if (isSelfDMReport) {
                // If this split was moved to a workspace report, use the workspace report ID
                // so that SplitExpenseEditPage shows the correct workspace report name.
                const actualReport =
                    currentTransaction?.reportID && currentTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                        ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction.reportID}`]
                        : undefined;
                if (actualReport && !isSelfDM(actualReport)) {
                    itemReportID = currentTransaction?.reportID;
                } else {
                    itemReportID = reportID;
                }
            } else if (currentTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                // For unreported (selfDM) transactions viewed from a workspace context,
                // use the selfDM report ID from Onyx so that SplitExpenseEditPage can
                // resolve the correct report and show the edit screen.
                itemReportID = selfDMReportID;
            }
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
        // When policy is undefined (e.g. viewing from self-DM), find the correct policy
        // by searching all policies for one that contains the transaction's customUnitID.
        // If customUnitID is not yet available (e.g. optimistic transaction before server response),
        // fall back to searching by customUnitRateID.
        const customUnitID = transaction?.comment?.customUnit?.customUnitID;
        const customUnitRateID = transaction?.comment?.customUnit?.customUnitRateID;
        const policyByCustomUnitID = customUnitID ? (Object.values(allPolicies ?? {}).find((p) => p?.customUnits?.[customUnitID]) ?? undefined) : undefined;
        const policyByCustomUnitRateID =
            !policyByCustomUnitID && customUnitRateID && customUnitRateID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID
                ? (Object.values(allPolicies ?? {}).find((p) => Object.values(p?.customUnits ?? {}).some((unit) => !!unit.rates?.[customUnitRateID])) ?? undefined)
                : undefined;
        const effectivePolicy = policy ?? policyByCustomUnitID ?? policyByCustomUnitRateID;
        const mileageRate = DistanceRequestUtils.getRate({transaction, policy: effectivePolicy ?? undefined});
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
