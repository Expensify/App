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
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    }, [removeRHPRouteKey, route]);

    /**
     * Effect that sets up cleanup when the screen is unmounted.
     */
    useEffect(() => () => onClose(), [onClose]);

    /**
     * Effect that registers the route's width. The optimistic hint overrides the caller's width when the hint is at a higher priority,
     * and is only cleared once the caller confirms or exceeds it.
     */
    useEffect(() => {
        const hint = reportID ? getReportRHPWidthHint(reportID) : undefined;
        const effectiveWidth: RHPWidth = hint && getWidthOrder(hint) > getWidthOrder(width) ? hint : width;
        if (reportID && hint && getWidthOrder(width) >= getWidthOrder(hint)) {
            unmarkReportRHPWidth(reportID, hint);
        }
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, getReportRHPWidthHint, unmarkReportRHPWidth]);
}

export default useRHPWidth;
