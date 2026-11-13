import {consumePendingRHPWidth} from '@components/WideRHPContextProvider/pendingRHPWidths';
import type {RHPWidth, RHPWidthHint} from '@components/WideRHPContextProvider/types';

import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {navigationRef} from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {getReportType} from '@src/selectors/Report';

import {useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

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

/** Registers a screen's RHP width. A width left by the press that opened it wins until the screen's own width reaches it, so it opens at the right width. */
function useRHPWidth(width: RHPWidth) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {setRHPWidth, removeRHPRouteKey} = useWideRHPActions();
    const [reportType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: getReportType});
    const isWideHintExcluded = reportType === CONST.REPORT.TYPE.INVOICE || reportType === CONST.REPORT.TYPE.TASK;
    const consumedHintRef = useRef<{reportID: string; floor: RHPWidthHint | undefined}>(undefined);

    const onClose = useEffectEvent(() => {
        removeRHPRouteKey(route);
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    });

    useEffect(() => () => onClose(), []);

    useEffect(() => {
        if (consumedHintRef.current?.reportID !== reportID) {
            // Taken once: it describes the navigation that led here, so it becomes this screen's floor.
            consumedHintRef.current = {reportID, floor: reportID ? consumePendingRHPWidth(reportID) : undefined};
        }
        // Released once the caller's own width reaches it, so a screen whose data later says narrower can still shrink.
        if (consumedHintRef.current.floor && getWidthOrder(width) >= getWidthOrder(consumedHintRef.current.floor)) {
            consumedHintRef.current = {reportID, floor: undefined};
        }
        const {floor} = consumedHintRef.current;
        const hint = floor === 'wide' && isWideHintExcluded ? undefined : floor;
        const effectiveWidth: RHPWidth = hint && getWidthOrder(hint) > getWidthOrder(width) ? hint : width;
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, isWideHintExcluded]);
}

export default useRHPWidth;
