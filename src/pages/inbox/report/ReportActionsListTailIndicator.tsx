import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

import React from 'react';

type ReportActionsListTailIndicatorProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether the user has an active Concierge draft response - hides the thinking indicator */
    hasActiveDraft?: boolean;
};

function ReportActionsListTailIndicator({reportID, hasActiveDraft}: ReportActionsListTailIndicatorProps) {
    if (hasActiveDraft) {
        return null;
    }

    return <ConciergeThinkingMessage reportID={reportID} />;
}

export default ReportActionsListTailIndicator;
