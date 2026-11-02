import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportOutOfSight from '@hooks/useIsReportOutOfSight';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import {useEffect, useEffectEvent, useRef} from 'react';

function clearDrafts(reportID: string | undefined, isDockedSidePanel: boolean) {
    if (isDockedSidePanel) {
        clearReportActionDrafts(reportID);
        return;
    }
    clearAllReportActionDrafts();
}

// When the report screen is navigated away from or the report changes, clear all report action edit drafts
function useClearReportActionDraftsOnReportChange(reportID: string | undefined) {
    const isInSidePanel = useIsInSidePanel();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    // Only the docked panel sits beside a usable chat, the narrow modal covers it like a new page on native
    const isDockedSidePanel = isInSidePanel && isExtraLargeScreenWidth;

    // A screen mounted out of sight (preloaded tab, wide submit pre-mount) must not wipe the drafts of the report the user is editing.
    const isOutOfSight = useIsReportOutOfSight();

    // A report already cleared in sight keeps its drafts when it comes back from out of sight, e.g. after a cancelled pre-mount.
    const lastClearedInSightKeyRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const inSightKey = `${reportID}:${isDockedSidePanel}`;
        if (isOutOfSight || lastClearedInSightKeyRef.current === inSightKey) {
            return;
        }
        lastClearedInSightKeyRef.current = inSightKey;
        clearDrafts(reportID, isDockedSidePanel);
    }, [reportID, isDockedSidePanel, isOutOfSight]);

    const clearOnLeave = useEffectEvent((leftReportID: string | undefined, wasDockedSidePanel: boolean) => {
        if (isOutOfSight) {
            return;
        }
        clearDrafts(leftReportID, wasDockedSidePanel);
    });

    useEffect(() => () => clearOnLeave(reportID, isDockedSidePanel), [reportID, isDockedSidePanel]);
}

export default useClearReportActionDraftsOnReportChange;
