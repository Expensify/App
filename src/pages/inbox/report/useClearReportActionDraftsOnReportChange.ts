import useIsInSidePanel from '@hooks/useIsInSidePanel';

import {clearAllReportActionDrafts, clearReportActionDrafts} from '@libs/actions/Report';

import {useEffect} from 'react';

// When the report screen is navigated away from or the report changes, clear all report action edit drafts
function useClearReportActionDraftsOnReportChange(reportID: string | undefined) {
    const isInSidePanel = useIsInSidePanel();

    useEffect(() => {
        // The side panel report renders next to the central report, so opening or closing it only discards the side panel report's own edit draft
        if (isInSidePanel) {
            clearReportActionDrafts(reportID);

            return () => {
                clearReportActionDrafts(reportID);
            };
        }

        clearAllReportActionDrafts();

        return () => {
            clearAllReportActionDrafts();
        };
    }, [reportID, isInSidePanel]);
}

export default useClearReportActionDraftsOnReportChange;
