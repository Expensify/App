// Phase-span marks for a sent comment row. A layout effect ends Propagate and starts PostCommit. The returned handler goes on onLayout and ends the remaining phase and the parent span.

import CONST from '@src/CONST';

import {useLayoutEffect} from 'react';

import {endSpan} from './activeSpans';
import {endSendMessagePhases, markSendMessageCommitted} from './sendMessageSpans';

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
        endSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}`);
    };
}

export default useSendMessageSpanMarks;
