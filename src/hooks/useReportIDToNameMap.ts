import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/** Mapping from reportID to report name. */
type ReportIDToNameMap = Record<string, string>;

/** Builds a map of reportID to report name from COLLECTION.REPORT. */
function buildReportIDToNameMap(reports: OnyxCollection<Report> | undefined): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    for (const report of Object.values(reports ?? {})) {
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

export default useReportIDToNameMap;
