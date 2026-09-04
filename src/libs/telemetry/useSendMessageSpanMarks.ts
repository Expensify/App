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
