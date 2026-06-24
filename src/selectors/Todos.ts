import {shallowEqual} from 'fast-equals';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {FlaggedExpensesDerivedValue, TodosDerivedValue} from '@src/types/onyx';

const EMPTY_TODOS_SINGLE_REPORT_IDS = Object.freeze({
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: undefined,
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
    [CONST.SEARCH.SEARCH_KEYS.PAY]: undefined,
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
});

const todosReportCountsSelector = (todos: OnyxEntry<TodosDerivedValue>) => {
    if (!todos) {
        return undefined;
    }

    return {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: todos.reportsToSubmit.length,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: todos.reportsToApprove.length,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: todos.reportsToPay.length,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: todos.reportsToExport.length,
    };
};

type SingleReportIDs = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.PAY]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: string | undefined;
};

// Manual memoization: singleReportIDs is used as a whole object in useMemo dependency arrays
// in ForYouSection, so referential stability is needed to avoid cascading re-computation.
// todosReportCountsSelector doesn't need this because its values are immediately destructured
// into primitive variables (submitCount, approveCount, etc.).
let previousSingleReportIDs: SingleReportIDs = EMPTY_TODOS_SINGLE_REPORT_IDS as SingleReportIDs;

const todosSingleReportIDsSelector = (todos: OnyxEntry<TodosDerivedValue>) => {
    if (!todos) {
        return EMPTY_TODOS_SINGLE_REPORT_IDS;
    }

    const submitReportID = todos.reportsToSubmit.length === 1 ? todos.reportsToSubmit.at(0)?.reportID : undefined;
    const approveReportID = todos.reportsToApprove.length === 1 ? todos.reportsToApprove.at(0)?.reportID : undefined;
    const payReportID = todos.reportsToPay.length === 1 ? todos.reportsToPay.at(0)?.reportID : undefined;
    const exportReportID = todos.reportsToExport.length === 1 ? todos.reportsToExport.at(0)?.reportID : undefined;

    if (!submitReportID && !approveReportID && !payReportID && !exportReportID) {
        previousSingleReportIDs = EMPTY_TODOS_SINGLE_REPORT_IDS;
        return EMPTY_TODOS_SINGLE_REPORT_IDS;
    }

    const newValue = {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitReportID,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: approveReportID,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: payReportID,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: exportReportID,
    };

    if (shallowEqual(previousSingleReportIDs, newValue)) {
        return previousSingleReportIDs;
    }

    previousSingleReportIDs = newValue;
    return newValue;
};

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

// Manual memoization mirrors `todosSingleReportIDsSelector`: ForYouSection's useMemo dependency
// list consumes the returned object as a whole, so we need referential stability across
// equivalent derived snapshots to avoid cascading re-renders on every Onyx churn.
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

export default todosReportCountsSelector;
export {EMPTY_FLAGGED_EXPENSES_REVIEW, EMPTY_TODOS_SINGLE_REPORT_IDS, flaggedExpensesReviewSelector, todosSingleReportIDsSelector};
