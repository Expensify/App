import {useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import createTodosReportsAndTransactions from '@libs/TodosUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TodoCounts = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: number;
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: number;
    [CONST.SEARCH.SEARCH_KEYS.PAY]: number;
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: number;
};

type TodoSingleReportIDs = {
    [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.APPROVE]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.PAY]: string | undefined;
    [CONST.SEARCH.SEARCH_KEYS.EXPORT]: string | undefined;
};

/**
 * Computes live to-do report counts and, for each bucket that contains exactly one report, that report's ID.
 * Runs the to-do classification on demand from live Onyx data, only while a consumer is mounted, replacing the
 * always-on TODOS derived value for count consumers.
 *
 * Pass `enabled: false` to freeze the hook: while disabled it skips the expensive classification and returns the
 * last computed result, so e.g. an unfocused screen stops recomputing to-do counts on background Onyx writes.
 */
function useTodoCounts(enabled = true): {counts: TodoCounts; singleReportIDs: TodoSingleReportIDs} {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    // Holds the most recent result so a frozen (inactive) consumer can keep returning it without recomputing.
    const [frozen, setFrozen] = useState<{signature: string; value: {counts: TodoCounts; singleReportIDs: TodoSingleReportIDs}} | null>(null);

    // While frozen, reuse the last captured result and skip the expensive classification below.
    if (!enabled && frozen) {
        return frozen.value;
    }

    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';

    const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport} = createTodosReportsAndTransactions({
        allReports,
        allTransactions,
        allPolicies,
        allReportNameValuePairs,
        allReportActions,
        allReportMetadata,
        bankAccountList,
        currentUserAccountID: userAccountID,
        login,
    });

    const counts: TodoCounts = {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: reportsToSubmit.length,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: reportsToApprove.length,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: reportsToPay.length,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: reportsToExport.length,
    };

    const singleReportIDs: TodoSingleReportIDs = {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: reportsToSubmit.length === 1 ? reportsToSubmit.at(0)?.reportID : undefined,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: reportsToApprove.length === 1 ? reportsToApprove.at(0)?.reportID : undefined,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: reportsToPay.length === 1 ? reportsToPay.at(0)?.reportID : undefined,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: reportsToExport.length === 1 ? reportsToExport.at(0)?.reportID : undefined,
    };

    const value = {counts, singleReportIDs};

    // Capture the latest result so it can be returned verbatim once the consumer freezes. Guarded by a content
    // signature so we only re-render when the counts/IDs actually change (avoids a setState-during-render loop).
    const signature = [
        counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT],
        counts[CONST.SEARCH.SEARCH_KEYS.APPROVE],
        counts[CONST.SEARCH.SEARCH_KEYS.PAY],
        counts[CONST.SEARCH.SEARCH_KEYS.EXPORT],
        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.SUBMIT],
        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.APPROVE],
        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.PAY],
        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.EXPORT],
    ].join('|');

    if (frozen?.signature !== signature) {
        setFrozen({signature, value});
    }

    return value;
}

export default useTodoCounts;
export type {TodoCounts, TodoSingleReportIDs};
