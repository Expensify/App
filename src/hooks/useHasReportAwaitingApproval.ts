import {getTodoReportsForSearchKey} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live report data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

/**
 * Lightweight check for whether the current user has at least one expense report awaiting their approval.
 *
 * Unlike `useTodoCounts`, this only subscribes to the Onyx collections the approve predicate actually reads
 * (reports, transactions, policies, report metadata) and computes just the approve bucket, so it does not
 * recompute on the frequent report-action / NVP writes the full to-do classification listens to.
 *
 * Pass `enabled: false` (e.g. an unfocused screen) to freeze the result and skip recomputation on background writes.
 */
function useHasReportAwaitingApproval(enabled = true): boolean {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // Holds the last computed result so a frozen (inactive) consumer can keep returning it without recomputing.
    const [frozen, setFrozen] = useState<boolean | null>(null);

    if (!enabled && frozen !== null) {
        return frozen;
    }

    const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const {reports} = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.APPROVE, {
        allReports,
        allTransactions,
        allPolicies,
        allReportMetadata,
        allReportNameValuePairs: undefined,
        allReportActions: undefined,
        personalDetailsList: undefined,
        bankAccountList: undefined,
        currentUserAccountID,
        login: '',
    });
    const hasReportAwaitingApproval = reports.length > 0;

    // Capture the latest result so it can be returned verbatim once the consumer freezes. Only re-store on an actual
    // change so the setState-during-render can't loop.
    if (frozen !== hasReportAwaitingApproval) {
        setFrozen(hasReportAwaitingApproval);
    }

    return hasReportAwaitingApproval;
}

export default useHasReportAwaitingApproval;
