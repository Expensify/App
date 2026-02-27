import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import {endSpan, getSpan} from './activeSpans';

/**
 * Mark the post-submit navigation telemetry span as finished.
 */
function markNavigateAfterExpenseCreateEnd() {
    if (!getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_AFTER_EXPENSE_CREATE)) {
        return;
    }
    endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_AFTER_EXPENSE_CREATE);
    Performance.markEnd(CONST.TIMING.NAVIGATE_AFTER_EXPENSE_CREATE);
}

export default markNavigateAfterExpenseCreateEnd;
