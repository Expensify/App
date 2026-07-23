import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

import React from 'react';

type ReportActionsListTailIndicatorProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether a Concierge draft is still streaming in - hides the thinking indicator only while the reply is actively revealing, not after it completes */
    isDraftPendingCompletion?: boolean;
};

function ReportActionsListTailIndicator({reportID, isDraftPendingCompletion}: ReportActionsListTailIndicatorProps) {
    if (isDraftPendingCompletion) {
        return null;
    }

    return <ConciergeThinkingMessage reportID={reportID} />;
}

export default ReportActionsListTailIndicator;
