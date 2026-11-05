import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import {isSearchTabContentReady} from '@libs/Navigation/helpers/searchTabPreloadStore';
import {getFocusedTabRouteName, getTabNavigatorStateKey, isReportsTabPreloaded, isTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';

import navigationRef from '@navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';

import {startSpan} from './activeSpans';
import {startNavigateToReportsSpans} from './navigateToReportsSpans';
import {getMsSinceReportsTabPreload} from './reportsTabPreloadTime';

/** Must run before the tab switch is dispatched, while the tab being left is still focused. */
function getSourceTab(rootState: ReturnType<typeof navigationRef.getRootState>): string {
    const focusedRouteName = getFocusedTabRouteName(rootState);
    return (focusedRouteName && ROUTE_TO_NAVIGATION_TAB[focusedRouteName]) ?? 'unknown';
}

/**
 * Starts ManualNavigateToInboxTab at the tab tap. Call it before the tab navigation is dispatched, because the
 * preloaded state and the source tab it records change once the tab is jumped to.
 */
function startNavigateToInboxTabSpan({isWideLayout}: {isWideLayout: boolean}) {
    const rootState = navigationRef.getRootState();
    const isPreloaded = isReportsTabPreloaded(rootState);
    const msSincePreload = isPreloaded ? getMsSinceReportsTabPreload(getTabNavigatorStateKey(rootState)) : undefined;

    startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
        name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        forceTransaction: true,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_WIDE_LAYOUT]: isWideLayout,
            [CONST.TELEMETRY.ATTRIBUTE_IS_PRELOADED]: isPreloaded,
            [CONST.TELEMETRY.ATTRIBUTE_WAITED_ON_OPEN_REPORT]: false,
            [CONST.TELEMETRY.ATTRIBUTE_SOURCE_TAB]: getSourceTab(rootState),
            ...(msSincePreload !== undefined && {[CONST.TELEMETRY.ATTRIBUTE_MS_SINCE_PRELOAD]: msSincePreload}),
        },
    });
}

/**
 * Whether the tap only reveals a Spend tab built at idle. A tab built only as far as its loading skeleton counts too, and
 * those taps end with start_type cold. A tap during the background build does not count.
 */
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
