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

/**
 * Returns a single report's attributes using a selector.
 * Deep comparison is cheap (single small object), so re-renders only occur
 * when that specific report's attributes change — not on every global report change.
 */
function useReportAttributesByID(reportID: string | undefined) {
    const reportAttributesByIDSelector = (value: {reports?: Record<string, unknown>} | undefined) => (reportID ? value?.reports?.[reportID] : undefined);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesByIDSelector,
    });
    return reportAttributes;
}

export default useReportAttributes;
export {useReportAttributesByID};
