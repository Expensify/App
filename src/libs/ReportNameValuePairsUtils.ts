import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNameValuePairs} from '@src/types/onyx';

function getReportNameValuePairsForReports(reports: OnyxCollection<Report> | undefined, allNVPs: NonNullable<OnyxCollection<ReportNameValuePairs>>): OnyxCollection<ReportNameValuePairs> {
    const result: OnyxCollection<ReportNameValuePairs> = {};
    for (const report of Object.values(reports ?? {})) {
        if (!report?.reportID) {
            continue;
        }
        const key = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}` as const;
        if (allNVPs[key] !== undefined) {
            result[key] = allNVPs[key];
        }
    }
    return result;
}

export default getReportNameValuePairsForReports;
