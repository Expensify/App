import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

import React from 'react';

type ReportActionsListHeaderProps = {
    reportID: string;

    /** Whether a Concierge draft is still streaming in — hides the thinking indicator only while the reply is actively revealing, not after it completes */
    isReplyPendingCompletion?: boolean;
};

function ReportActionsListHeader({reportID, isReplyPendingCompletion}: ReportActionsListHeaderProps) {
    if (isReplyPendingCompletion) {
        return null;
    }

    return <ConciergeThinkingMessage reportID={reportID} />;
}

export default ReportActionsListHeader;
