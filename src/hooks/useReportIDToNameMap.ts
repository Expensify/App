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

// Same reportID capture and flags as ExpensiMark's reportMentions rule, which accepts the ID with or without quotes and in any case
const MENTION_REPORT_ID_REGEX = /<mention-report reportID="?(\d+)"?/gi;

// Any non-empty room name works as a placeholder, because every room name starts with #
const MENTIONED_ROOM_PLACEHOLDER = '#room';

/** Returns the unique reportIDs of the `<mention-report reportID="...">` tags in the given HTML. */
function getMentionedReportIDs(html: string | undefined): string[] {
    if (!html || !/<mention-report reportID/i.test(html)) {
        return [];
    }
    return [...new Set(Array.from(html.matchAll(MENTION_REPORT_ID_REGEX), (match) => match[1]))];
}

/**
 * Maps every room the HTML mentions by reportID to a placeholder name. Use it only when the converted text is never shown,
 * so the conversion doesn't need a subscription to the reports and doesn't log a missing report name for each mention.
 */
function buildMentionedRoomPlaceholderMap(html: string | undefined): ReportIDToNameMap {
    return Object.fromEntries(getMentionedReportIDs(html).map((reportID) => [reportID, MENTIONED_ROOM_PLACEHOLDER]));
}

/**
 * Builds a map of reportID to report name from COLLECTION.REPORT.
 * The map is keyed by the reportID taken from the Onyx key, not report.reportID, because a partial update can cache a report without its reportID.
 *
 * @param reportIDs - when passed, only these reports are looked up, so callers that know which rooms their HTML mentions avoid a pass over every report
 */
function buildReportIDToNameMap(reports: OnyxCollection<Report> | undefined, reportIDs?: string[]): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    if (reportIDs) {
        for (const reportID of reportIDs) {
            const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            if (report) {
                map[reportID] = report.reportName ?? reportID;
            }
        }
        return map;
    }
    for (const [key, report] of Object.entries(reports ?? {})) {
        if (!report) {
            continue;
        }
        const reportID = key.slice(ONYXKEYS.COLLECTION.REPORT.length);
        map[reportID] = report.reportName ?? reportID;
    }
    return map;
}

/** Returns a map of reportID to report name built from COLLECTION.REPORT. */
function useReportIDToNameMap(): ReportIDToNameMap {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    return buildReportIDToNameMap(reports);
}

export default useReportIDToNameMap;
export {buildMentionedRoomPlaceholderMap, buildReportIDToNameMap, getMentionedReportIDs, getReportIDToNameMapForRoomsInMarkdown};
