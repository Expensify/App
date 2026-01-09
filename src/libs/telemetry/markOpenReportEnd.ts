import Timing from '@libs/actions/Timing';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import {endSpan, getSpan} from './activeSpans';

/**
 * Mark all 'open_report*' performance events as finished using both Performance (local) and Timing (remote) tracking.
 */
function markOpenReportEnd(reportId: string, isTransactionThread?: boolean, isOneTransactionThread?: boolean) {
    let reportType = 'report';
    if (isTransactionThread) {
        reportType = 'transaction_thread';
    } else if (isOneTransactionThread) {
        reportType = 'one_transaction_report';
    }

    const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportId}`;
    const span = getSpan(spanId);
    span?.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_IS_TRANSACTION_THREAD]: isTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_IS_ONE_TRANSACTION_REPORT]: isOneTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_REPORT_TYPE]: reportType,
    });

    endSpan(spanId);

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
