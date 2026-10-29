import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNamesByReportIDs} from '@hooks/useReportAttributes';

import {getReportName} from '@libs/ReportNameUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';

function useFilterReportValue(reportIDs: SearchFilter['value']): string {
    const reportIDList = Array.isArray(reportIDs) ? reportIDs : [];
    const derivedReportNames = useDerivedReportNamesByReportIDs(reportIDList);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    if (!Array.isArray(reportIDs)) {
        return '';
    }

    return reportIDs
        .map((id) => getReportName(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`], derivedReportNames?.[id]))
        .filter(Boolean)
        .join(', ');
}

export default useFilterReportValue;
