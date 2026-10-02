import useIsHiddenWideTabPreMount from '@hooks/useIsHiddenWideTabPreMount';
import useIsInPreloadedTab from '@hooks/useIsInPreloadedTab';

import {clearAllReportActionDrafts} from '@libs/actions/Report';

import {useEffect, useEffectEvent} from 'react';

// When the report screen is navigated away from or the report changes, clear all report action edit drafts
function useClearReportActionDraftsOnReportChange(reportID: string | undefined) {
    // A screen mounted out of sight (preloaded tab, wide submit pre-mount) must not wipe the drafts of the report the user is editing.
    const isInPreloadedTab = useIsInPreloadedTab();
    const isHiddenPreMount = useIsHiddenWideTabPreMount();
    const isOutOfSight = isInPreloadedTab || isHiddenPreMount;

    useEffect(() => {
        if (isOutOfSight) {
            return;
        }
        clearAllReportActionDrafts();
    }, [reportID, isOutOfSight]);

    const clearOnLeave = useEffectEvent(() => {
        if (isOutOfSight) {
            return;
        }
        clearAllReportActionDrafts();
    });

    useEffect(() => () => clearOnLeave(), [reportID]);
}

export default useClearReportActionDraftsOnReportChange;
