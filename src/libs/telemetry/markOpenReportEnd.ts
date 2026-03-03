import {isOneTransactionReport, isReportTransactionThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {endSpan, getSpan} from './activeSpans';

type MarkOpenReportEndOptions = {
    warm?: boolean;
};

/**
 * Mark all 'open_report*' telemetry spans as finished.
 */
function markOpenReportEnd(report: OnyxTypes.Report, options: MarkOpenReportEndOptions = {}) {
    const {reportID, type, chatType} = report;

    const isTransactionThread = isReportTransactionThread(report);
    const isOneTransactionThread = isOneTransactionReport(report);

    const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`;
    const span = getSpan(spanId);
    span?.setAttributes({
        [CONST.TELEMETRY.ATTRIBUTE_IS_TRANSACTION_THREAD]: isTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_IS_ONE_TRANSACTION_REPORT]: isOneTransactionThread,
        [CONST.TELEMETRY.ATTRIBUTE_REPORT_TYPE]: type,
        [CONST.TELEMETRY.ATTRIBUTE_CHAT_TYPE]: chatType,
    });
    if (options.warm !== undefined) {
        span?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_IS_WARM, options.warm);
    }

    endSpan(spanId);
}

export default markOpenReportEnd;
