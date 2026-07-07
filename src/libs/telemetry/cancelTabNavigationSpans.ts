import CONST from '@src/CONST';

import {cancelSpan} from './activeSpans';

// Spans grouped by the tab they belong to. The Reports tab owns three (legacy plus the FirstPaint/ContentLoad
// split). Callers pass a tab's whole group as `preserve` so landing on that tab does not cancel its fresh spans.
const REPORTS_TAB_SPAN_IDS: readonly string[] = [
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD,
];
const INBOX_TAB_SPAN_IDS: readonly string[] = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB];
const TAB_NAVIGATION_SPAN_IDS: readonly string[] = [...REPORTS_TAB_SPAN_IDS, ...INBOX_TAB_SPAN_IDS];

/**
 * Cancels running tab-navigation spans so an abandoned tap does not leave one ticking until the user returns.
 * Pass the focused tab's span group as `preserve` so its freshly started spans survive.
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
