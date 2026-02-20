import Performance from '@libs/Performance';
import {isOneTransactionReport, isReportTransactionThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {cancelSpan, endSpan, getSpan} from './activeSpans';

/**
 * Mark all 'open_report*' performance events as finished using both Performance (local) and Timing (remote) tracking.
 */
function markOpenReportEnd(report: OnyxTypes.Report) {
    const {reportID, type, chatType} = report;

    const isTransactionThread = isReportTransactionThread(report);
    const isOneTransactionThread = isOneTransactionReport(report);

    const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`;
    const span = getSpan(spanId);

    // If the DataFetch child span is still active at layout time, the report rendered from
    // cached Onyx data before the API response arrived (warm path).
    const dataFetchSpanId = `${spanId}_DataFetch`;
    const hadCachedData = !!getSpan(dataFetchSpanId);
    cancelSpan(dataFetchSpanId);

    span?.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_IS_TRANSACTION_THREAD]: isTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_IS_ONE_TRANSACTION_REPORT]: isOneTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_REPORT_TYPE]: type,
        [CONST.TELEMETRY.ATTRIBUTE_CHAT_TYPE]: chatType,
        [CONST.TELEMETRY.ATTRIBUTE_HAD_CACHED_DATA]: hadCachedData,
    });

    endSpan(spanId);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_THREAD);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);

    Performance.markEnd(CONST.TIMING.OPEN_REPORT_SEARCH);
}

export default markOpenReportEnd;
