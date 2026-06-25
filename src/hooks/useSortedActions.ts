import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Returns `sortedActions` from the RAM_ONLY_SORTED_REPORT_ACTIONS derived value.
 */
function useSortedActions() {
    const [sortedReportActions] = useOnyx(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
    return sortedReportActions?.sortedActions;
}

export default useSortedActions;
