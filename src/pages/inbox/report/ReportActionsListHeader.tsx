import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

import React from 'react';

import ConciergeChatHistoryToggle from './ConciergeChatHistoryToggle';

type ReportActionsListHeaderProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether a Concierge draft is still streaming in — hides the thinking indicator only while the reply is actively revealing, not after it completes */
    isDraftPendingCompletion?: boolean;
};

function ReportActionsListHeader({reportID, isDraftPendingCompletion}: ReportActionsListHeaderProps) {
    return (
        <>
            <ConciergeChatHistoryToggle reportID={reportID} />
            {!isDraftPendingCompletion && <ConciergeThinkingMessage reportID={reportID} />}
        </>
    );
}

export default ReportActionsListHeader;
