import {useRoute} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import {expandedRHPProgress, useWideRHPActions} from '..';
import type {RHPWidth} from '..';

function getWidthOrder(width: RHPWidth): number {
    if (width === 'super-wide') {
        return 2;
    }
    if (width === 'wide') {
        return 1;
    }
    return 0;
}

/**
 * Manages a screen's RHP width. Optimistic hints on the reportID win until the caller settles on a width that meets or exceeds the hint —
 * so Search can pre-mark a multi-tx report as super-wide and the screen won't flash at the loading-state width first.
 */
function useRHPWidth(width: RHPWidth) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {setRHPWidth, removeRHPRouteKey, getReportRHPWidthHint, unmarkReportRHPWidth} = useWideRHPActions();

    const onClose = useCallback(() => {
        removeRHPRouteKey(route);
        // Clear the one-shot hint on unmount so a stale one can't outlive this screen and pin the report wide on a later visit.
        if (reportID) {
            unmarkReportRHPWidth(reportID);
        }
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    }, [removeRHPRouteKey, route, reportID, unmarkReportRHPWidth]);

    useEffect(() => () => onClose(), [onClose]);

    // Register the route's width. The optimistic hint outranks the caller while it's higher, so the screen opens at the pre-marked width before its own data loads.
    useEffect(() => {
        const hint = reportID ? getReportRHPWidthHint(reportID) : undefined;
        const effectiveWidth: RHPWidth = hint && getWidthOrder(hint) > getWidthOrder(width) ? hint : width;
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, getReportRHPWidthHint]);

    // Consume the hint once the caller's own width catches up to it (its data has loaded); onClose covers the case where it never does.
    useEffect(() => {
        if (!reportID) {
            return;
        }
        const hint = getReportRHPWidthHint(reportID);
        if (hint && getWidthOrder(width) >= getWidthOrder(hint)) {
            unmarkReportRHPWidth(reportID, hint);
        }
    }, [width, reportID, getReportRHPWidthHint, unmarkReportRHPWidth]);
}

export default useRHPWidth;
