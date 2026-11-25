/**
 * Builds the maps from reportID to room name that Parser needs to turn `<mention-report reportID="...">` tags into room names.
 * Kept free of hooks so libs and derived values can use it.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {ReportNamesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/** Mapping from reportID to report name. */
type ReportIDToNameMap = Record<string, string>;

/** Narrows a map of reportID to name to the rooms whose #name appears in the given markdown, e.g. a draft that will be compared against HTML holding <mention-report reportID=...> */
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

/** Returns the unique reportIDs that any message fragment of the given report actions mentions by reportID. */
function getMentionedReportIDsInReportActions(reportActions: Array<OnyxEntry<ReportAction>>): string[] {
    const reportIDs = new Set<string>();
    for (const reportAction of reportActions) {
        const messages = Array.isArray(reportAction?.message) ? reportAction.message : [reportAction?.message];
        for (const message of messages) {
            for (const reportID of getMentionedReportIDs(message?.html)) {
                reportIDs.add(reportID);
            }
        }
    }
    return [...reportIDs];
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

/**
 * Builds a map of reportID to room name for the rooms the given report actions mention, from the raw report names in the REPORT_ATTRIBUTES derived value.
 * It uses the stored room names, not the display names, which mark archived rooms, so the preview names rooms the same way the rendered message does.
 * LHN rows already read these names through a selector, while a subscription to COLLECTION.REPORT would re-render every row whenever any report changes.
 */
function buildMentionedReportIDToNameMapFromReportNames(reportNames: ReportNamesDerivedValue | undefined, reportActions: Array<OnyxEntry<ReportAction>>): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    for (const reportID of getMentionedReportIDsInReportActions(reportActions)) {
        // REPORT_ATTRIBUTES is restored from disk on startup, and entries saved by an older version don't have rawReportName until they are recomputed.
        // Falling back to the display name keeps naming the room meanwhile, since a room missing from the map renders as #Hidden.
        const reportName = reportNames?.[reportID]?.rawReportName ?? reportNames?.[reportID]?.reportName;
        if (reportName) {
            map[reportID] = reportName;
        }
    }
    return map;
}

export type {ReportIDToNameMap};
export {
    buildMentionedReportIDToNameMapFromReportNames,
    buildMentionedRoomPlaceholderMap,
    buildReportIDToNameMap,
    getMentionedReportIDs,
    getMentionedReportIDsInReportActions,
    getReportIDToNameMapForRoomsInMarkdown,
};
