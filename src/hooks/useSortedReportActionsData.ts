import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Returns the full RAM_ONLY_SORTED_REPORT_ACTIONS derived value:
 * `{sortedActions, lastActions, transactionThreadIDs}` — tx-thread-combined at source.
 */
function useSortedReportActionsData() {
    const [sortedReportActionsData] = useOnyx(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
    return sortedReportActionsData;
}

export default useSortedReportActionsData;
