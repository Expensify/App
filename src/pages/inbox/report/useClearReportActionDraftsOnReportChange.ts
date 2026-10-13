import useIsInSidePanel from '@hooks/useIsInSidePanel';

import {clearAllReportActionDrafts} from '@libs/actions/Report';

import {useEffect} from 'react';

// When the report screen is navigated away from or the report changes, clear all report action edit drafts
function useClearReportActionDraftsOnReportChange(reportID: string | undefined) {
    const isInSidePanel = useIsInSidePanel();

    useEffect(() => {
        // The side panel report renders next to the central report, so opening or closing it must not discard the central report's edit draft
        if (isInSidePanel) {
            return;
        }

        clearAllReportActionDrafts();

        return () => {
            clearAllReportActionDrafts();
        };
    }, [reportID, isInSidePanel]);
}

export default useClearReportActionDraftsOnReportChange;
