import CONST from '@src/CONST';
import {cancelSpan} from './activeSpans';

const TAB_NAVIGATION_SPAN_IDS = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB] as const;

/**
 * Cancels in-flight tab-navigation spans so an abandoned tap doesn't leave one ticking until the user returns.
 * Pass `except` to preserve the span for the tab the user is now on.
 */
function cancelTabNavigationSpans(except?: string) {
    for (const id of TAB_NAVIGATION_SPAN_IDS) {
        if (id === except) {
            continue;
        }
        cancelSpan(id);
    }
}

export default cancelTabNavigationSpans;
