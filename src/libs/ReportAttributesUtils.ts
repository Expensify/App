import type {OnyxEntry} from 'react-native-onyx';

/** A per-reportID lookup of report names, as produced by `useDerivedReportNamesByReportIDs`. */
type ReportNamesByID = Record<string, string | undefined>;

/**
 * Reads a single report's name from a {@link ReportNamesByID} map, guarding the `reportID` internally so call sites
 * stay a single expression.
 */
function getDerivedReportNameByReportID(reportNames: OnyxEntry<ReportNamesByID>, reportID: string | undefined): string | undefined {
    return reportID ? reportNames?.[reportID] : undefined;
}

export {getDerivedReportNameByReportID};
export type {ReportNamesByID};
