import type {OnyxEntry} from 'react-native-onyx';
import type {FlaggedExpensesDerivedValue} from '@src/types/onyx';

type FlaggedExpensesReview = {
    /** Total number of flagged expenses */
    count: number;
    /** Transaction ID of the first flagged expense, used to seed the carousel handoff */
    firstTransactionID: string | undefined;
    /** Parent report ID of the first flagged expense */
    firstReportID: string | undefined;
    /** Ordered list of every flagged transaction ID, used to drive the prev/next review carousel */
    transactionIDs: string[];
};

const EMPTY_FLAGGED_EXPENSES_REVIEW: FlaggedExpensesReview = Object.freeze({
    count: 0,
    firstTransactionID: undefined,
    firstReportID: undefined,
    transactionIDs: [],
}) as FlaggedExpensesReview;

// Manual memoization: ForYouSection's useMemo dependency list consumes the returned object as a whole,
// so we need referential stability across equivalent derived snapshots to avoid cascading re-renders on every Onyx churn.
let previousFlaggedExpensesReview: FlaggedExpensesReview = EMPTY_FLAGGED_EXPENSES_REVIEW;

const flaggedExpensesReviewSelector = (flaggedExpensesValue: OnyxEntry<FlaggedExpensesDerivedValue>): FlaggedExpensesReview => {
    const flaggedExpenses = flaggedExpensesValue?.flaggedExpenses;
    if (!flaggedExpenses || flaggedExpenses.length === 0) {
        previousFlaggedExpensesReview = EMPTY_FLAGGED_EXPENSES_REVIEW;
        return EMPTY_FLAGGED_EXPENSES_REVIEW;
    }

    const first = flaggedExpenses.at(0);
    const transactionIDs = flaggedExpenses.map((flaggedExpense) => flaggedExpense.transactionID);
    const newValue: FlaggedExpensesReview = {
        count: flaggedExpenses.length,
        firstTransactionID: first?.transactionID,
        firstReportID: first?.reportID,
        transactionIDs,
    };

    // shallowEqual would always report a difference because `transactionIDs` is a fresh array each call,
    // so we compare the scalar fields shallowly and the IDs element-by-element to preserve referential stability.
    const previousTransactionIDs = previousFlaggedExpensesReview.transactionIDs;
    const areTransactionIDsEqual =
        previousTransactionIDs.length === transactionIDs.length && previousTransactionIDs.every((transactionID, index) => transactionID === transactionIDs.at(index));
    if (
        previousFlaggedExpensesReview.count === newValue.count &&
        previousFlaggedExpensesReview.firstTransactionID === newValue.firstTransactionID &&
        previousFlaggedExpensesReview.firstReportID === newValue.firstReportID &&
        areTransactionIDsEqual
    ) {
        return previousFlaggedExpensesReview;
    }

    previousFlaggedExpensesReview = newValue;
    return newValue;
};

export {EMPTY_FLAGGED_EXPENSES_REVIEW, flaggedExpensesReviewSelector};
