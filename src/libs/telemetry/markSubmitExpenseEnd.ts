import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import {endSpan, getSpan} from './activeSpans';

/**
 * Mark the submit expense telemetry span as finished.
 * Called after all API.write() calls for the expense have been dispatched.
 */
function markSubmitExpenseEnd() {
    if (!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)) {
        return;
    }
    endSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    Performance.markEnd(CONST.TIMING.SUBMIT_EXPENSE);
}

export default markSubmitExpenseEnd;
