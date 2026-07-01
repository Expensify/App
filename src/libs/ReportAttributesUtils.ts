import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';

/** A lookup keyed by reportID that holds only each report's `reportName`, narrowed from {@link ReportAttributes}. */
type ReportNamesByID = Record<string, Pick<ReportAttributes, 'reportName'>>;

/**
 * Reads a single report's name from a {@link ReportNamesByID} map (the narrowed output produced from REPORT_ATTRIBUTES).
 */
function getDerivedReportNameByReportID(reportNames: OnyxEntry<ReportNamesByID>, reportID: string | undefined): string | undefined {
    return reportID ? reportNames?.[reportID]?.reportName : undefined;
}

export {getDerivedReportNameByReportID};
export type {ReportNamesByID};
