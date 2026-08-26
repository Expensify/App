import type {RHPWidth, RHPWidthHint} from '@components/WideRHPContextProvider/types';

import {navigationRef} from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';

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

/** Sets a screen's RHP width. A per-report hint outranks the caller until the caller's own width reaches it, so a pre-marked report opens at the right width without a loading-state flash. */
function useRHPWidth(width: RHPWidth) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {setRHPWidth, removeRHPRouteKey, getReportRHPWidthHint, unmarkReportRHPWidth} = useWideRHPActions();
    const consumedHintRef = useRef<{reportID: string; floor: RHPWidthHint | undefined}>(undefined);

    const onClose = useEffectEvent(() => {
        removeRHPRouteKey(route);
        // Clears a hint no screen consumed, deferred past this commit so a screen replacing this one gets it first.
        if (reportID) {
            Promise.resolve().then(() => unmarkReportRHPWidth(reportID));
        }
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    });

    useEffect(() => () => onClose(), []);

    // Register the width, with a higher hint outranking the caller so the screen opens pre-marked before its data loads.
    useEffect(() => {
        if (consumedHintRef.current?.reportID !== reportID) {
            // Read once and cleared: it describes the navigation that led here, so it becomes this screen's floor and leaves the next mark free.
            const floor = reportID ? getReportRHPWidthHint(reportID) : undefined;
            consumedHintRef.current = {reportID, floor};
            if (reportID && floor) {
                unmarkReportRHPWidth(reportID, floor);
            }
        } else if (reportID) {
            // A hint marked while this screen already shows that report describes a navigation that never happened, so it can only mislead a later mount.
            unmarkReportRHPWidth(reportID);
        }
        // Released once the caller's own width reaches it, so a screen whose data later says narrower can still shrink.
        if (consumedHintRef.current.floor && getWidthOrder(width) >= getWidthOrder(consumedHintRef.current.floor)) {
            consumedHintRef.current = {reportID, floor: undefined};
        }
        const {floor} = consumedHintRef.current;
        const effectiveWidth: RHPWidth = floor && getWidthOrder(floor) > getWidthOrder(width) ? floor : width;
        setRHPWidth(route, effectiveWidth);
    }, [width, reportID, route, setRHPWidth, getReportRHPWidthHint, unmarkReportRHPWidth]);
}

export default useRHPWidth;
