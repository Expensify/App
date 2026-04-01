import React from 'react';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';
import ReportTypingIndicator from '@pages/inbox/report/ReportTypingIndicator';

function AgentZeroAwareTypingIndicator({reportID}: {reportID: string}) {
    const shouldSuppress = useShouldSuppressConciergeIndicators(reportID);
    if (shouldSuppress) {
        return null;
    }
    return <ReportTypingIndicator reportID={reportID} />;
}

export default AgentZeroAwareTypingIndicator;
