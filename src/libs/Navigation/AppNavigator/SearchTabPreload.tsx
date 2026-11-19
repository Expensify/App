import {getSearchTabRouteParams} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import useOnyx from '@hooks/useOnyx';

import getSearchTabPreloadTarget from '@libs/Navigation/helpers/getSearchTabPreloadTarget';
import {setIdlePreloadedSearchTabRouteKey} from '@libs/Navigation/helpers/searchTabPreloadStore';
import {getTabNavigatorState, isTabPreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {Scheduler} from '@libs/Scheduler';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

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
 * Builds the Spend tab off idle with the exact query the tab button would open, so the first visit only reveals it.
 * The platform's `getSearchTabPreloadTarget` decides when a preload has something to build.
 * Its own component, so the saved Spend query it reads re-renders only this and not AuthScreensInitHandler.
 */
function SearchTabPreload({isLoadingApp, tabNavigatorStateKey}: SearchTabPreloadProps) {
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    // Reads the saved query when the idle task runs, so a Spend search does not reschedule the preload.
    const preloadSearchTab = useEffectEvent(() => {
        // A submit that ends on Spend opens the tab itself, pre-inserted under the RHP, so a preload would only compete with it.
        if (getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH) {
            return;
        }
        const rootState = navigationRef.getRootState();
        const target = getSearchTabPreloadTarget(rootState);
        // Already preloaded, but its screens are not mounted yet, so the target check alone would let a rescheduled task preload it again.
        if (!target || isTabPreloaded(rootState, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)) {
            return;
        }
        // Key of the Spend route the preload marks.
        const searchTabRouteKey = getTabNavigatorState(rootState)?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.key;
        if (!searchTabRouteKey) {
            return;
        }

        const {query, ...params} = getSearchTabRouteParams(rootState, lastSearchParams, lastExpensesSearchQuery);
        startSpan(CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, {name: CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, op: CONST.TELEMETRY.SPAN_PRELOAD_SEARCH_TAB, forceTransaction: true});
        setIdlePreloadedSearchTabRouteKey(searchTabRouteKey);
        navigationRef.dispatch({...CommonActions.preload(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {screen: SCREENS.SEARCH.ROOT, params: {q: query, ...params}}), target});
    });

    useEffect(() => {
        if (isLoadingApp !== false || !tabNavigatorStateKey) {
            return;
        }

        const task = Scheduler.scheduleWhenIdle(() => preloadSearchTab(), {shouldUseFallbackTimer: false});
        return () => task.cancel();
    }, [isLoadingApp, tabNavigatorStateKey]);

    return null;
}

export default SearchTabPreload;
