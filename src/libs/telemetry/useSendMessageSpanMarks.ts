// Phase-span marks for a sent comment row. A layout effect ends Propagate and starts PostCommit. The returned handler goes on onLayout and ends the remaining phase and the parent span.

import {useLayoutEffect} from 'react';

import {endSpan} from './activeSpans';
import {endSendMessagePhases, getSendMessageVisibleSpanID, markSendMessageCommitted} from './sendMessageSpans';

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
        endSendMessagePhases(reportActionID);
        endSpan(getSendMessageVisibleSpanID(reportActionID));
    };
}

export default useSendMessageSpanMarks;
