import {isReportsTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';

import {startSpan} from './activeSpans';
import {startNavigateToReportsSpans} from './navigateToReportsSpans';

/**
 * Starts ManualNavigateToInboxTab at the tab tap. Call it before the tab navigation is dispatched, because the
 * preloaded state it records is dropped once the tab is jumped to.
 */
function startNavigateToInboxTabSpan({isWideLayout}: {isWideLayout: boolean}) {
    startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
        name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        forceTransaction: true,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_WIDE_LAYOUT]: isWideLayout,
            [CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: isReportsTabPreloaded(navigationRef.getRootState()),
            [CONST.TELEMETRY.ATTRIBUTE_WAITED_ON_OPEN_REPORT]: false,
        },
    });
}

/** Starts the legacy ManualNavigateToReports span and its FirstPaint/ContentLoad split at the tab tap. */
function startNavigateToReportsTabSpans() {
    startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {
        name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
        op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
        forceTransaction: true,
    });
    startNavigateToReportsSpans();
}

export {startNavigateToInboxTabSpan, startNavigateToReportsTabSpans};
