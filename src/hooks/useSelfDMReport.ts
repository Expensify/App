import DateUtils from '@libs/DateUtils';
import {buildOptimisticSelfDMReport, findSelfDMReportID} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useSelfDMReport() {
    const [selfDMReportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false, selector: findSelfDMReportID});
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {canBeMissing: true});
    return selfDMReport ?? buildOptimisticSelfDMReport(DateUtils.getDBTime());
}

export default useSelfDMReport;
