import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import {useEffect} from 'react';

// When the report screen is navigated away from or the report changes, clear all report action edit drafts
function useClearReportActionDraftsOnReportChange(reportID: string | undefined) {
    const isInSidePanel = useIsInSidePanel();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    // Only the docked panel sits beside a usable chat, the narrow modal covers it like a new page on native
    const isDockedSidePanel = isInSidePanel && isExtraLargeScreenWidth;

    useEffect(() => {
        if (isDockedSidePanel) {
            clearReportActionDrafts(reportID);

            return () => {
                clearReportActionDrafts(reportID);
            };
        }

        clearAllReportActionDrafts();

        return () => {
            clearAllReportActionDrafts();
        };
    }, [reportID, isDockedSidePanel]);
}

export default useClearReportActionDraftsOnReportChange;
