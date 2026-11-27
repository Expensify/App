import {buildReportIDToNameMap, getMentionedReportIDs} from '@libs/ReportIDToNameMapUtils';
import type {ReportIDToNameMap} from '@libs/ReportIDToNameMapUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

const EMPTY_REPORT_ID_TO_NAME_MAP: ReportIDToNameMap = {};

/** Returns a map of reportID to report name built from COLLECTION.REPORT. */
function useReportIDToNameMap(): ReportIDToNameMap {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    return buildReportIDToNameMap(reports);
}

/**
 * Same as useReportIDToNameMap, but only maps the reports mentioned in the given HTML string.
 * The selector re-renders the caller only when the names of those reports change.
 */
function useMentionedReportIDToNameMap(htmlString: string | undefined): ReportIDToNameMap {
    const mentionedReportIDs = getMentionedReportIDs(htmlString);
    const [reportIDToName = EMPTY_REPORT_ID_TO_NAME_MAP] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => buildReportIDToNameMap(reports, mentionedReportIDs)});
    return reportIDToName;
}

export default useReportIDToNameMap;
export {useMentionedReportIDToNameMap};
