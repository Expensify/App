import CONST from '@src/CONST';
import {cancelSpan} from './activeSpans';

// Spans grouped by the tab they belong to. The Reports tab owns three: the legacy span plus the
// FirstPaint/ContentLoad split. `except` carries a single span id (the focused tab's legacy span),
// so it must preserve the whole group of that tab, otherwise navigating to Reports would cancel the
// freshly started FirstPaint/ContentLoad spans.
const REPORTS_TAB_SPAN_IDS: readonly string[] = [
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT,
    CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD,
];
const INBOX_TAB_SPAN_IDS: readonly string[] = [CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB];
const TAB_NAVIGATION_SPAN_IDS: readonly string[] = [...REPORTS_TAB_SPAN_IDS, ...INBOX_TAB_SPAN_IDS];

/** Returns the span group the focused tab owns, so the whole group is preserved from cancellation. */
function getPreservedGroup(except?: string): readonly string[] | undefined {
    if (except === undefined) {
        return undefined;
    }
    if (REPORTS_TAB_SPAN_IDS.includes(except)) {
        return REPORTS_TAB_SPAN_IDS;
    }
    if (INBOX_TAB_SPAN_IDS.includes(except)) {
        return INBOX_TAB_SPAN_IDS;
    }
    return undefined;
}

/**
 * Cancels in-flight tab-navigation spans so an abandoned tap doesn't leave one ticking until the user returns.
 * Pass `except` to preserve the whole span group for the tab the user is now on.
 */
function cancelTabNavigationSpans(except?: string) {
    const preservedGroup = getPreservedGroup(except);

    for (const id of TAB_NAVIGATION_SPAN_IDS) {
        if (preservedGroup?.includes(id)) {
            continue;
        }
        cancelSpan(id);
    }
}

export default cancelTabNavigationSpans;
