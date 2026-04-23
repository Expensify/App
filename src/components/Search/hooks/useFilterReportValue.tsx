import useOnyx from '@hooks/useOnyx';
import {getReportName} from '@libs/ReportNameUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterReportValue(reportIDs: SearchFilter['value']): string {
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    if (!Array.isArray(reportIDs)) {
        return '';
    }

    return reportIDs
        .map((id) => getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`], reportAttributes?.reports))
        .filter(Boolean)
        .join(', ');
}

export default useFilterReportValue;
