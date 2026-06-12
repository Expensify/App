import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

/**
 * Dismisses the modal when a money request report is removed (e.g. deleted or merged).
 * Skips dismissal during route changes — the new report's data may not be loaded yet,
 * so the absent `report` should not be interpreted as removal.
 */
function useDismissOnMoneyRequestReportRemoval(reportIDFromRoute: string | undefined) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const prevReport = usePrevious(report);
    const prevReportIDFromRoute = usePrevious(reportIDFromRoute);
    const isFocused = useIsFocused();
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        if (prevReportIDFromRoute !== reportIDFromRoute) {
            return;
        }

        const isRemovalExpectedForReportType = !report && isMoneyRequestReport(prevReport);

        if (isRemovalExpectedForReportType) {
            if (!isFocused) {
                return;
            }
            Navigation.dismissModal();
        }
    }, [report, isFocused, prevReport, prevReportIDFromRoute, reportIDFromRoute]);
}

export default useDismissOnMoneyRequestReportRemoval;
