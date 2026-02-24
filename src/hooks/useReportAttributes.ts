import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Returns `reports` from the REPORT_ATTRIBUTES derived value.
 *
 * This hook intentionally avoids using a selector. When a selector is passed to
 * `useOnyx`, it forces a `deepEqual` comparison on every Onyx update cycle. Because
 * `reports` is a large `Record<string, ReportAttributes>`, that deep comparison is
 * O(n) and expensive.
 */
function useReportAttributes() {
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    return reportAttributes?.reports;
}

export default useReportAttributes;
