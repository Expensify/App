import {isOneTransactionReport, isReportTransactionThread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {SpanAttributes} from '@sentry/core';
import type {OnyxEntry} from 'react-native-onyx';

import {endSpanWithAttributes} from './activeSpans';

type MarkOpenReportEndOptions = {
    warm?: boolean;
};

/**
 * Mark all 'open_report*' telemetry spans as finished. Keyed by `reportID` so it still ends when the report
 * hasn't loaded. The report-shape attributes are then left off.
 */
function markOpenReportEnd(reportID: string, report: OnyxEntry<OnyxTypes.Report>, options: MarkOpenReportEndOptions = {}) {
    const spanId = `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`;

    const attributes: SpanAttributes = {};

    // Cold opens close this span before the report reaches Onyx. Reading the shape off a missing report would
    // report `false` for an unknown, so leave the attributes off and let the consumer read absence as unknown.
    if (report) {
        attributes[CONST.TELEMETRY.ATTRIBUTE_IS_TRANSACTION_THREAD] = isReportTransactionThread(report);
        attributes[CONST.TELEMETRY.ATTRIBUTE_IS_ONE_TRANSACTION_REPORT] = isOneTransactionReport(report);
        attributes[CONST.TELEMETRY.ATTRIBUTE_REPORT_TYPE] = report.type;
        attributes[CONST.TELEMETRY.ATTRIBUTE_CHAT_TYPE] = report.chatType;
    }

    if (options.warm !== undefined) {
        attributes[CONST.TELEMETRY.ATTRIBUTE_IS_WARM] = options.warm;
    }

    endSpanWithAttributes(spanId, attributes);
}

export default markOpenReportEnd;
