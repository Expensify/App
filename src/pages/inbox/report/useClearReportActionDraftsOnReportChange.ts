import useIsHiddenWideTabPreMount from '@hooks/useIsHiddenWideTabPreMount';
import useIsInPreloadedTab from '@hooks/useIsInPreloadedTab';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import {useEffect, useEffectEvent} from 'react';

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
    const isInPreloadedTab = useIsInPreloadedTab();
    const isHiddenPreMount = useIsHiddenWideTabPreMount();
    const isOutOfSight = isInPreloadedTab || isHiddenPreMount;

    useEffect(() => {
        if (isOutOfSight) {
            return;
        }
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
