import Timing from '@libs/actions/Timing';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import {cancelSpan, endSpan, getSpan} from './activeSpans';

/**
 * Mark all 'open_report*' performance events as finished using both Performance (local) and Timing (remote) tracking.
 */
function markOpenReportEnd(reportId: string, isTransactionThread?: boolean, isOneTransactionThread?: boolean) {
    if (isTransactionThread || isOneTransactionThread) {
        cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportId}`);
        const span = getSpan(`${CONST.TELEMETRY.SPAN_OPEN_TRANSACTION_THREAD}_${reportId}`);
        if (span) {
            span.setAttributes({
                [CONST.TELEMETRY.ATTRIBUTE_ONE_TRANSACTION_THREAD]: isOneTransactionThread,
            });
        }
        endSpan(`${CONST.TELEMETRY.SPAN_OPEN_TRANSACTION_THREAD}_${reportId}`);
    } else {
        cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_TRANSACTION_THREAD}_${reportId}`);
        endSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportId}`);
    }

    Performance.markEnd(CONST.TIMING.OPEN_REPORT);
    Timing.end(CONST.TIMING.OPEN_REPORT);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_THREAD);
    Timing.end(CONST.TIMING.OPEN_REPORT_THREAD);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
    Timing.end(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_SEARCH);
    Timing.end(CONST.TIMING.OPEN_REPORT_SEARCH);
}

export default markOpenReportEnd;
