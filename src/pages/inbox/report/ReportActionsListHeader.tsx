import React from 'react';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import {isConciergeChatReport} from '@libs/ReportUtils';
import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ListBoundaryLoader from './ListBoundaryLoader';

type ReportActionsListHeaderProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Callback to retry loading newer chats after an error */
    onRetry: () => void;
};

function ReportActionsListHeader({reportID, onRetry}: ReportActionsListHeaderProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    return (
        <>
            {isConciergeSidePanel && <ConciergeThinkingMessage report={report} />}
            <ListBoundaryLoader
                type={CONST.LIST_COMPONENTS.HEADER}
                onRetry={onRetry}
            />
        </>
    );
}

export default ReportActionsListHeader;
