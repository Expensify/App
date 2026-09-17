import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';

import ReportTypingIndicator from '@pages/inbox/report/ReportTypingIndicator';

import React from 'react';

import {useComposerState} from './ComposerContext';

function ComposerTypingIndicator() {
    const {reportID} = useComposerState();
    const shouldSuppress = useShouldSuppressConciergeIndicators(reportID);
    if (shouldSuppress) {
        return null;
    }
    return <ReportTypingIndicator reportID={reportID} />;
}

export default ComposerTypingIndicator;
