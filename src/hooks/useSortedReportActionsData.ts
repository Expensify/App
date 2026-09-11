import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useSortedReportActionsData() {
    const [sortedReportActionsData] = useOnyx(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
    return sortedReportActionsData;
}

export default useSortedReportActionsData;
