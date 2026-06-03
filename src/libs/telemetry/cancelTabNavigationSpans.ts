import CONST from '@src/CONST';
import {cancelSpan} from './activeSpans';

// Spans grouped by the tab they belong to. The Reports tab owns three: the legacy span plus the
// FirstPaint/ContentLoad split. Callers pass the focused tab's whole group as `preserve` so navigating
// to that tab does not cancel its freshly started spans.
const REPORTS_TAB_SPAN_IDS: readonly string[] = [
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD,
];
const INBOX_TAB_SPAN_IDS: readonly string[] = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB];
const TAB_NAVIGATION_SPAN_IDS: readonly string[] = [...REPORTS_TAB_SPAN_IDS, ...INBOX_TAB_SPAN_IDS];

/**
 * Cancels in-flight tab-navigation spans so an abandoned tap doesn't leave one ticking until the user returns.
 * Pass `preserve` with the span group of the tab the user is now on, so its freshly started spans survive.
 */
function cancelTabNavigationSpans(preserve: readonly string[] = []) {
    for (const id of TAB_NAVIGATION_SPAN_IDS) {
        if (preserve.includes(id)) {
            continue;
        }
        cancelSpan(id);
    }
}

export default cancelTabNavigationSpans;
export {REPORTS_TAB_SPAN_IDS, INBOX_TAB_SPAN_IDS};
