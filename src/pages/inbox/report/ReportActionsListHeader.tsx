import React from 'react';
import ConciergeThinkingMessage from '@pages/home/report/ConciergeThinkingMessage';

type ReportActionsListHeaderProps = {
    /** The ID of the report being displayed */
    reportID: string;

    /** Whether the user has an active Concierge draft response — hides the thinking indicator */
    hasActiveDraft?: boolean;
};

function ReportActionsListHeader({reportID, hasActiveDraft}: ReportActionsListHeaderProps) {
    if (hasActiveDraft) {
        return null;
    }

    return <ConciergeThinkingMessage reportID={reportID} />;
}

export default ReportActionsListHeader;
