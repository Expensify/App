// Phase-span marks for a sent comment row. A layout effect ends Propagate and starts PostCommit. The returned handler goes on onLayout and ends the remaining phase and the parent span.

import {useLayoutEffect} from 'react';

import {endSendMessageVisibleSpan, markSendMessageCommitted} from './sendMessageSpans';

function useSendMessageSpanMarks(reportActionID: string | undefined) {
    useLayoutEffect(() => {
        if (!reportActionID) {
            return;
        }
        markSendMessageCommitted(reportActionID);
    }, [reportActionID]);

    return () => {
        if (!reportActionID) {
            return;
        }
        endSendMessageVisibleSpan(reportActionID);
    };
}

export default useSendMessageSpanMarks;
