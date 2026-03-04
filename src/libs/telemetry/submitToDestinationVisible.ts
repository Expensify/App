import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import {cancelSpan, endSpanWithAttributes, getSpan} from './activeSpans';

type DestinationType = ValueOf<typeof CONST.TELEMETRY.DESTINATION_TYPE>;

type PendingExpenseCreateDestination = {
    destinationType: DestinationType;
    reportID?: string;
} | null;

let pendingExpenseCreateDestination: PendingExpenseCreateDestination = null;

/**
 * Set the pending expense-create destination before navigating (for submit-to-destination-visible telemetry).
 * The destination screen should call markSubmitToDestinationVisibleEnd when visible.
 * If there is already a pending destination and the span is still running (e.g. second submit before first destination visible), we cancel the previous span so it is not left stuck or attributed to the wrong destination.
 */
function setPendingExpenseCreateDestination(destinationType: DestinationType, reportID?: string) {
    if (pendingExpenseCreateDestination !== null && getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
        pendingExpenseCreateDestination = null;
    }
    pendingExpenseCreateDestination = {destinationType, reportID};
}

/**
 * Clear the pending expense-create destination (e.g. when the span is ended or cancelled).
 */
function clearPendingExpenseCreateDestination() {
    pendingExpenseCreateDestination = null;
}

/**
 * Read the current pending expense-create destination (for destination screens to check if they should end the span).
 * Not reactive; call from within a callback (e.g. useFocusEffect, onLayout).
 */
function getPendingExpenseCreateDestination(): PendingExpenseCreateDestination {
    return pendingExpenseCreateDestination;
}

/**
 * Mark the submit-to-destination-visible span as finished and clear the pending destination.
 * Call from each destination when its main content is visible (e.g. onLayout).
 * Only ends the span if the passed destination matches the current pending destination (avoids races and wrong attribution).
 */
function markSubmitToDestinationVisibleEnd(destinationType: DestinationType, reportID?: string) {
    if (!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        return;
    }
    const pending = pendingExpenseCreateDestination;
    if (!pending || pending.destinationType !== destinationType) {
        return;
    }
    if (pending.reportID !== undefined && pending.reportID !== reportID) {
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

export {markSubmitToDestinationVisibleEnd, setPendingExpenseCreateDestination, getPendingExpenseCreateDestination, cancelSubmitToDestinationVisibleSpan};
export type {DestinationType};
