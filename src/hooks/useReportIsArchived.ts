import {isArchivedReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useReportIsArchived(reportID?: string): boolean {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReportArchived = isArchivedReport(reportNameValuePairs);
    return isReportArchived;
}

export default useReportIsArchived;
