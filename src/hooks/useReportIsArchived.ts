import {isArchivedReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useReportIsArchived(reportID?: string): boolean {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const isReportArchived = isArchivedReport(reportNameValuePairs);
    return isReportArchived;
}

export default useReportIsArchived;
