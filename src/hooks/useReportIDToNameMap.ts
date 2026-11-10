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

// Same reportID capture as ExpensiMark's reportMentions rule, which accepts the ID with or without quotes
const MENTION_REPORT_ID_REGEX = /<mention-report reportID="?(\d+)"?/gi;

/** Returns the unique reportIDs of the `<mention-report reportID="...">` tags in the given HTML. */
function getMentionedReportIDs(html: string | undefined): string[] {
    if (!html?.includes('<mention-report reportID')) {
        return [];
    }
    return [...new Set(Array.from(html.matchAll(MENTION_REPORT_ID_REGEX), (match) => match[1]))];
}

function getReportName(report: Report): string {
    return report.reportName ?? report.reportID;
}

/**
 * Builds a map of reportID to report name from COLLECTION.REPORT.
 *
 * @param reportIDs - when passed, only these reports are looked up, so callers that know which rooms their HTML mentions avoid a pass over every report
 */
function buildReportIDToNameMap(reports: OnyxCollection<Report> | undefined, reportIDs?: string[]): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    if (reportIDs) {
        for (const reportID of reportIDs) {
            const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            if (report) {
                map[report.reportID] = getReportName(report);
            }
        }
        return map;
    }
    for (const report of Object.values(reports ?? {})) {
        if (!report) {
            continue;
        }
        map[report.reportID] = getReportName(report);
    }
    return map;
}

/** Returns a map of reportID to report name built from COLLECTION.REPORT. */
function useReportIDToNameMap(): ReportIDToNameMap {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    return buildReportIDToNameMap(reports);
}

export default useReportIDToNameMap;
export {buildReportIDToNameMap, getMentionedReportIDs, getReportIDToNameMapForRoomsInMarkdown};
export type {ReportIDToNameMap};
