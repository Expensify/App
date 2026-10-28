import {getSearchTabRouteParams} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import useOnyx from '@hooks/useOnyx';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getPlatform from '@libs/getPlatform';
import {getTabPreloadTarget, isTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {Scheduler} from '@libs/Scheduler';
import {startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import type {OnyxEntry} from 'react-native-onyx';

import {CommonActions} from '@react-navigation/native';
import {useEffect, useEffectEvent} from 'react';

type SearchTabPreloadProps = {
    /** Whether the app is still loading its initial data, so the preload waits for it. */
    isLoadingApp: OnyxEntry<boolean>;

    /** Key of the tab navigator state, set once that navigator exists. */
    tabNavigatorStateKey: string | undefined;
};

/**
 * Mounts the Spend tab off idle with the exact query the tab button would open, so the first visit only reveals it.
 * Its own component, so the saved Spend query it reads re-renders only this and not AuthScreensInitHandler.
 */
function SearchTabPreload({isLoadingApp, tabNavigatorStateKey}: SearchTabPreloadProps) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    // Reads the saved query when the idle task runs, so a Spend search does not reschedule the preload.
    const preloadSearchTab = useEffectEvent(() => {
        if (getIsNarrowLayout()) {
            return;
        }
        const rootState = navigationRef.getRootState();
        const target = getTabPreloadTarget(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        // Already preloaded, but its screens are not mounted yet, so the target check alone would let a rescheduled task preload it again.
        if (!target || isTabPreloaded(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)) {
            return;
        }

        const {query, ...params} = getSearchTabRouteParams(rootState, lastSearchParams, lastExpensesSearchQuery);
        startSpan(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, {name: CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, op: CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, forceTransaction: true});
        navigationRef.dispatch({...CommonActions.preload(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {screen: SCREENS.SEARCH.ROOT, params: {q: query, ...params}}), target});
    });

    // Desktop browsers only: the native tab bar already mounts every tab at startup, and the cost on a phone CPU is unmeasured.
    useEffect(() => {
        if (getPlatform(true) !== CONST.PLATFORM.WEB || isLoadingApp !== false || !tabNavigatorStateKey) {
            return;
        }

        const task = Scheduler.scheduleWhenIdle(() => preloadSearchTab(), {shouldUseFallbackTimer: false});
        return () => task.cancel();
    }, [isLoadingApp, tabNavigatorStateKey]);

    return null;
}

export default SearchTabPreload;
