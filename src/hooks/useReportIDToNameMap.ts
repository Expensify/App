import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/** Mapping from reportID to report name. */
type ReportIDToNameMap = Record<string, string>;

/** Narrows a reportID -> name map to the rooms whose #name appears in the given markdown, e.g. a draft that will be compared against HTML holding <mention-report reportID=...> */
function getReportIDToNameMapForRoomsInMarkdown(reportIDToName: ReportIDToNameMap | undefined, markdown: string): ReportIDToNameMap | undefined {
    if (!reportIDToName || !markdown.includes('#')) {
        return undefined;
    }
    const map: ReportIDToNameMap = {};
    for (const [reportID, reportName] of Object.entries(reportIDToName)) {
        // Only rooms can be mentioned in markdown, and their names keep the leading #.
        if (reportName.startsWith('#') && markdown.includes(reportName)) {
            map[reportID] = reportName;
        }
    }
    return map;
}

// Same tag shape ExpensiMark's reportMentions rule matches when it converts HTML back to markdown
const MENTION_REPORT_ID_REGEX = /<mention-report[^>]*\sreportID="?(\d+)"?/gi;
// Cheap pre-check before the global regex runs; case-insensitive to match how ExpensiMark matches the tag
const HAS_REPORT_MENTION_REGEX = /<mention-report/i;
// Stable fallback for the first render, before Onyx has delivered the collection, so callers don't see a new object each render
const EMPTY_REPORT_ID_TO_NAME_MAP: ReportIDToNameMap = {};

/** Unique reportIDs referenced by <mention-report reportID=...> tags in the given HTML string */
function getMentionedReportIDs(htmlString: string | undefined): string[] {
    if (!htmlString || !HAS_REPORT_MENTION_REGEX.test(htmlString)) {
        return [];
    }
    return [...new Set(Array.from(htmlString.matchAll(MENTION_REPORT_ID_REGEX), (match) => match[1]))];
}

/**
 * Builds a map of reportID to report name from COLLECTION.REPORT.
 * When reportIDs is passed, only those reports are looked up, so the caller never walks the whole collection.
 */
function buildReportIDToNameMap(reports: OnyxCollection<Report> | undefined, reportIDs?: string[]): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    const reportsToMap = reportIDs ? reportIDs.map((reportID) => reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]) : Object.values(reports ?? {});
    for (const report of reportsToMap) {
        if (!report) {
            continue;
        }
        map[report.reportID] = report.reportName ?? report.reportID;
    }
    return map;
}

/** Returns a map of reportID to report name built from COLLECTION.REPORT. */
function useReportIDToNameMap(): ReportIDToNameMap {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    return buildReportIDToNameMap(reports);
}

/**
 * Same as useReportIDToNameMap, but only maps the reports mentioned in the given HTML string.
 * The selector keeps the subscription scoped to those reports, so a write to any other report does not re-render the caller.
 */
function useMentionedReportIDToNameMap(htmlString: string | undefined): ReportIDToNameMap {
    const mentionedReportIDs = getMentionedReportIDs(htmlString);
    const [reportIDToName = EMPTY_REPORT_ID_TO_NAME_MAP] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => buildReportIDToNameMap(reports, mentionedReportIDs)});
    return reportIDToName;
}

export default useReportIDToNameMap;
export {buildReportIDToNameMap, getMentionedReportIDs, getReportIDToNameMapForRoomsInMarkdown, useMentionedReportIDToNameMap};
