import {isArchivedReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

const isArchivedSelector = isArchivedReport;

function useReportIsArchived(reportID?: string): boolean {
    const [isArchived] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: isArchivedSelector,
    });
    return !!isArchived;
}

export default useReportIsArchived;
