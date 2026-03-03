import {clearPendingExpenseCreateDestination, setPendingExpenseCreateDestination} from '@libs/actions/ExpenseCreateDestination';
import type {DestinationType} from '@libs/actions/ExpenseCreateDestination';
import CONST from '@src/CONST';
import {cancelSpan, endSpanWithAttributes, getSpan} from './activeSpans';

/**
 * Mark the submit-to-destination-visible span as finished and clear the pending destination.
 * Call from each destination when its main content is visible (e.g. onLayout).
 */
function markSubmitToDestinationVisibleEnd(destinationType: DestinationType, reportID?: string) {
    if (!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        return;
    }
    const attributes: Record<string, string> = {
        [CONST.TELEMETRY.ATTRIBUTE_DESTINATION_TYPE]: destinationType,
    };
    if (reportID !== undefined) {
        attributes[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID] = reportID;
    }
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, attributes);
    clearPendingExpenseCreateDestination();
}

/**
 * Cancel the submit-to-destination-visible span and clear the pending destination.
 */
function cancelSubmitToDestinationVisibleSpan() {
    cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    clearPendingExpenseCreateDestination();
}

export default markSubmitToDestinationVisibleEnd;
export {setPendingExpenseCreateDestination, cancelSubmitToDestinationVisibleSpan};
export type {DestinationType};
