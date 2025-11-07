import {useCallback} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useReportAttributes(reportID: string | undefined) {
    const reportAttributesSelector = useCallback(
        (reportAttributes: ReportAttributesDerivedValue) => {
            const attributes = reportID ? reportAttributes?.reports?.[reportID] : undefined;

            return {
                brickRoadStatus: attributes?.brickRoadStatus,
                reportName: attributes?.reportName,
            };
        },
        [reportID],
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportAttributesSelector});

    return reportAttributes;
}

export default useReportAttributes;
