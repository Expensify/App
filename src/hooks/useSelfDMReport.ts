import type {OnyxCollection} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {buildOptimisticSelfDMReport, isSelfDM, isThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

function findSelfDMReportID(reports: OnyxCollection<Report>): string | undefined {
    return Object.values(reports ?? {}).find((report) => isSelfDM(report) && !isThread(report))?.reportID;
}

function computeSelfDMReport(reports: OnyxCollection<Report>, cachedSelfDMReportID: string | undefined): Report {
    const resolvedID = cachedSelfDMReportID ?? findSelfDMReportID(reports);
    const key = resolvedID ? `${ONYXKEYS.COLLECTION.REPORT}${resolvedID}` : undefined;
    const found = key ? reports?.[key] : undefined;
    return found ?? buildOptimisticSelfDMReport(DateUtils.getDBTime());
}

function useSelfDMReport() {
    const [cachedSelfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: findSelfDMReportID});
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${cachedSelfDMReportID ?? selfDMReportID}`);
    return selfDMReport ?? buildOptimisticSelfDMReport(DateUtils.getDBTime());
}

export default useSelfDMReport;
export {computeSelfDMReport, findSelfDMReportID};
