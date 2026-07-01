import {reportNamesByReportIDsSelector, reportNameSelector} from '@selectors/Attributes';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
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
    const reportAttributesByIDSelector = (value: OnyxEntry<ReportAttributesDerivedValue>) => (reportID ? value?.reports?.[reportID] : undefined);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesByIDSelector,
    });
    return reportAttributes;
}

/**
 * Returns a `{reportID: {reportName}}` map for the given reportIDs using a selector.
 *
 * Use this when a component only needs report names: it subscribes to a narrow slice of REPORT_ATTRIBUTES,
 * so the component re-renders only when one of those names changes — not on every global report attribute
 * change. The selector output is tiny (one `{reportName}` entry per requested ID), so its `deepEqual` is cheap.
 */
function useDerivedReportNamesByReportIDs(reportIDs: Array<string | undefined>) {
    const [reportNames] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportNamesByReportIDsSelector(reportIDs),
    });
    return reportNames;
}

/**
 * Returns a single report's name using a selector.
 *
 * Prefer this over {@link useDerivedReportNamesByReportIDs} when a component only needs one report's name:
 * the selector output is a primitive string, so its comparison is trivial and the component re-renders only
 * when that specific report's name changes.
 */
function useDerivedReportNameByReportID(reportID: string | undefined) {
    const [reportName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: (value: OnyxEntry<ReportAttributesDerivedValue>) => reportNameSelector(value, reportID),
    });
    return reportName;
}

export default useReportAttributes;
export {useReportAttributesByID, useDerivedReportNamesByReportIDs, useDerivedReportNameByReportID};
