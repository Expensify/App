import type {OnyxCollection} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {buildOptimisticSelfDMReport, isSelfDM, isThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

const selfDMReportIDSelector = (reports: OnyxCollection<Report>) => {
    return Object.values(reports ?? {}).find((report) => isSelfDM(report) && !isThread(report))?.reportID;
};

function useSelfDMReport() {
    const [cachedSelfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: selfDMReportIDSelector});
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${cachedSelfDMReportID ?? selfDMReportID}`);
    return selfDMReport ?? buildOptimisticSelfDMReport(DateUtils.getDBTime());
}

export default useSelfDMReport;
