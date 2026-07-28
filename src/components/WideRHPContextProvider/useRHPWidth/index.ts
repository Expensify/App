import {navigationRef} from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';

import {useRoute} from '@react-navigation/native';
import {useEffect} from 'react';

import type {RHPWidth} from '..';

import {expandedRHPProgress, useWideRHPActions} from '..';

function getWidthOrder(width: RHPWidth): number {
    if (width === 'super-wide') {
        return 2;
    }
    if (width === 'wide') {
        return 1;
    }
    return 0;
}

/** Sets a screen's RHP width. A per-report hint outranks the caller until the caller's own width catches up — so a pre-marked report opens at the right width without a loading-state flash. */
function useRHPWidth(width: RHPWidth) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {setRHPWidth, removeRHPRouteKey, getReportRHPWidthHint, unmarkReportRHPWidth} = useWideRHPActions();

    const onClose = () => {
        removeRHPRouteKey(route);
        // Clear the one-shot hint on unmount so it can't pin the report wide on a later visit.
        if (reportID) {
            unmarkReportRHPWidth(reportID);
        }
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    };

    useEffect(() => () => onClose(), [onClose]);

    // Register the width; a higher hint outranks the caller so the screen opens pre-marked before its data loads.
    useEffect(() => {
        const hint = reportID ? getReportRHPWidthHint(reportID) : undefined;
        const effectiveWidth: RHPWidth = hint && getWidthOrder(hint) > getWidthOrder(width) ? hint : width;
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, getReportRHPWidthHint]);

    // Clear the hint once the caller's width reaches it; onClose handles the never-reached case.
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
