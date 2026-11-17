import createTodosReportsAndTransactions, {sortTodoReportsBySearchOrder} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import {useState} from 'react';

import useTodoClassificationParams from './useTodoClassificationParams';

type TodoCounts = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: number;
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: number;
    [CONST.SEARCH.SEARCH_KEYS.PAY]: number;
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: number;
};

/** Each to-do bucket's report IDs, in the order its Spend search lists them */
type TodoReportIDs = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: string[];
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: string[];
    [CONST.SEARCH.SEARCH_KEYS.PAY]: string[];
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: string[];
};

type TodoCountsResult = {counts: TodoCounts; reportIDs: TodoReportIDs};

function getSortedReportIDs(reports: Report[]): string[] {
    return sortTodoReportsBySearchOrder(reports).map((report) => report.reportID);
}

function areReportIDListsEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((reportID, index) => reportID === b.at(index));
}

const TODO_KEYS = [CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY, CONST.SEARCH.SEARCH_KEYS.EXPORT] as const;

/**
 * Computes live to-do report counts and each bucket's report IDs, in the order its Spend search lists them.
 * Runs the to-do classification on demand from live Onyx data, only while a consumer is mounted, replacing the
 * always-on TODOS derived value for count consumers.
 *
 * Pass `enabled: false` to freeze the hook: while disabled it skips the expensive classification and returns the
 * last computed result, so e.g. an unfocused screen stops recomputing to-do counts on background Onyx writes.
 */
function useTodoCounts(enabled = true): TodoCountsResult {
    const todoClassificationParams = useTodoClassificationParams();

    // Holds the most recent result so a frozen (inactive) consumer can keep returning it without recomputing.
    const [frozen, setFrozen] = useState<TodoCountsResult | null>(null);

    // While frozen, reuse the last captured result and skip the expensive classification below.
    if (!enabled && frozen) {
        return frozen;
    }

    const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport} = createTodosReportsAndTransactions(todoClassificationParams);

    const counts: TodoCounts = {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: reportsToSubmit.length,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: reportsToApprove.length,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: reportsToPay.length,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: reportsToExport.length,
    };

    const reportIDs: TodoReportIDs = {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: getSortedReportIDs(reportsToSubmit),
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: getSortedReportIDs(reportsToApprove),
        [CONST.SEARCH.SEARCH_KEYS.PAY]: getSortedReportIDs(reportsToPay),
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: getSortedReportIDs(reportsToExport),
    };

    const value = {counts, reportIDs};

    // Capture the latest result so it can be returned verbatim once the consumer freezes. Only re-store when a
    // count or report ID list actually changes, so the setState-during-render can't loop.
    const hasChanged = !frozen || TODO_KEYS.some((key) => frozen.counts[key] !== counts[key] || !areReportIDListsEqual(frozen.reportIDs[key], reportIDs[key]));
    if (hasChanged) {
        setFrozen(value);
        return value;
    }

    // Nothing changed — return the previously stored object so consumers keep a stable reference and
    // memoized children don't re-render on unrelated Onyx writes to the subscribed collections.
    return frozen;
}

export default useTodoCounts;
export type {TodoCounts};
