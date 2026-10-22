import {isSearchTabContentReady} from '@libs/Navigation/helpers/searchTabPreloadStore';
import {isReportsTabPreloaded, isTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

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

/** Whether the tap only reveals a Spend tab built at idle. A tap during the background build does not count. */
function isSearchTabPreloadedAndBuilt() {
    return isTabPreloaded(navigationRef.getRootState(), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) && isSearchTabContentReady();
}

/** Starts ManualNavigateToReports and its FirstPaint/ContentLoad split at the tap. Call it before navigating, since opening the tab clears its preloaded state. */
function startNavigateToReportsTabSpans() {
    const attributes = {[CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: isSearchTabPreloadedAndBuilt()};
    startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {
        name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
        op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS,
        forceTransaction: true,
        attributes,
    });
    startNavigateToReportsSpans(attributes);
}

export {startNavigateToInboxTabSpan, startNavigateToReportsTabSpans};
