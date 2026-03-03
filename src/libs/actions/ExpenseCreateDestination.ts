import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DestinationType = ValueOf<typeof CONST.TELEMETRY.DESTINATION_TYPE>;

/**
 * Set the pending expense-create destination before navigating (for submit-to-destination-visible telemetry).
 * The destination screen should call markSubmitToDestinationVisibleEnd when visible.
 */
function setPendingExpenseCreateDestination(destinationType: DestinationType, reportID?: string) {
    Onyx.set(ONYXKEYS.NVP_PENDING_EXPENSE_CREATE_DESTINATION, {destinationType, reportID});
}

/**
 * Clear the pending expense-create destination (e.g. when the span is ended or cancelled).
 */
function clearPendingExpenseCreateDestination() {
    Onyx.set(ONYXKEYS.NVP_PENDING_EXPENSE_CREATE_DESTINATION, null);
}

export {setPendingExpenseCreateDestination, clearPendingExpenseCreateDestination};
export type {DestinationType};
