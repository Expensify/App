import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';

import CONST from '@src/CONST';

import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';

/**
 * A global-create submit off the inbox lands on Search — reserve the channel so the optimistic write defers behind the skeleton.
 *
 * `destinationReportID` is frequently undefined here (true global-create-to-Search has no known
 * destination report yet), leaving this reservation unscoped on a global key. That is safe for
 * submit *correctness*: `getRegistrationPromiseForReport`/`isWritePendingForReport` only ever
 * match an unscoped reservation for `undefined` report IDs, so an unscoped SEARCH reservation
 * cannot cause a submit-side waiter for some *other*, already-existing report to block on it - in
 * the pre-registration window the reservation's destination report does not exist client-side yet,
 * so no submit for it is even possible. The remaining risk is a *leaked* reservation poisoning the
 * shared key for later flows, which is handled separately by the unmount/background abandonment
 * wiring in SubmitExpenseOrchestrator, not by scoping.
 *
 * Returns whether this call actually created the reservation (see `reserveDeferredWriteChannel`) -
 * callers that abandon this key later on unmount must check this first, or they risk deleting a
 * different, still-live caller's reservation instead of their own.
 */
function reserveSearchChannelIfGlobalCreate(isFromGlobalCreate: boolean, destinationReportID?: string): boolean {
    if (!isFromGlobalCreate || isReportTopmostSplitNavigator()) {
        return false;
    }
    return reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, {destinationReportID});
}

export default reserveSearchChannelIfGlobalCreate;
