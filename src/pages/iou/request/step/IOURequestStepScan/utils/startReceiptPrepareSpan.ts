import getPlatform from '@libs/getPlatform';
import {getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

/**
 * Starts the receipt-prepare telemetry span as a child of the shutter-to-confirmation span.
 * It is ended by `startScanProcessSpan` and cancelled by the flows that skip the confirmation page.
 */
function startReceiptPrepareSpan() {
    startSpan(CONST.TELEMETRY.SPAN_RECEIPT_PREPARE, {
        name: CONST.TELEMETRY.SPAN_RECEIPT_PREPARE,
        op: CONST.TELEMETRY.SPAN_RECEIPT_PREPARE,
        parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: getPlatform()},
    });
}

export default startReceiptPrepareSpan;
