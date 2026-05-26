import {useRoute} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import {expandedRHPProgress, useWideRHPActions} from '..';
import type {RHPWidth} from '..';

/**
 * Manages a screen's RHP width. On 'narrow', falls back to any optimistic hint set on the report
 * so the screen still pre-renders at the right width before data settles.
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
     * Effect that registers the route's width. A 'narrow' caller falls back to the optimistic hint
     * (if any); once the caller passes a real width, the hint is cleared to avoid staleness on the
     * next visit.
     */
    useEffect(() => {
        const hint = reportID ? getReportRHPWidthHint(reportID) : undefined;
        const effectiveWidth = width === 'narrow' && hint ? hint : width;
        if (reportID && hint && width !== 'narrow') {
            unmarkReportRHPWidth(reportID, hint);
        }
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, getReportRHPWidthHint, unmarkReportRHPWidth]);
}

export default useRHPWidth;
