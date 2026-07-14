import {isArchivedReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

const isArchivedSelector = isArchivedReport;

function useReportIsArchived(reportID?: string, isActive = true): boolean {
    const [isArchived] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: isArchivedSelector,
        subscribed: isActive,
    });
    return !!isArchived;
}

export default useReportIsArchived;
