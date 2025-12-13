import type {NavigationRoute} from '@react-navigation/native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {isSingleNewDotEntrySelector} from '@selectors/HybridApp';
import {useCallback, useMemo, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useOnyx from '@hooks/useOnyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {isAnonymousUser} from '@libs/actions/Session';
import getAccountTabScreenToOpen from '@libs/Navigation/helpers/getAccountTabScreenToOpen';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import {TAB_TO_FULLSCREEN} from '@libs/Navigation/linkingConfig/RELATIONS';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, FullScreenName, SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {getPreservedNavigatorState} from './createSplitNavigator/usePreserveNavigatorState';

// This timing is used to call the preload function after a tab change, when the initial tab screen has already been rendered.
const TIMING_TO_CALL_PRELOAD = 1000;

// Currently the Inbox, Workspaces and Account tabs are preloaded, while Search is not preloaded due to its potential complexity.
const TABS_TO_PRELOAD = [NAVIGATION_TABS.HOME, NAVIGATION_TABS.WORKSPACES, NAVIGATION_TABS.SETTINGS];

function preloadWorkspacesTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    const state = getWorkspacesTabStateFromSessionStorage() ?? navigation.getState();
    const lastWorkspacesSplitNavigator = state.routes.findLast((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);

    if (lastWorkspacesSplitNavigator) {
        return;
    }
    navigation.preload(SCREENS.WORKSPACES_LIST, {});
}

function preloadReportsTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    const lastSearchNavigator = navigation.getState().routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastSearchNavigatorState = lastSearchNavigator && lastSearchNavigator.key ? getPreservedNavigatorState(lastSearchNavigator?.key) : undefined;
    const lastSearchRoute = lastSearchNavigatorState?.routes.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

    if (lastSearchRoute) {
        const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
        const queryJSON = buildSearchQueryJSON(q);
        if (queryJSON) {
            const query = buildSearchQueryString(queryJSON);
            navigation.preload(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {screen: SCREENS.SEARCH.ROOT, params: {q: query, ...rest}});
            return;
        }
    }

    navigation.preload(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {screen: SCREENS.SEARCH.ROOT, params: {q: buildCannedSearchQuery()}});
}

function preloadAccountTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>, subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null) {
    const accountTabPayload = getAccountTabScreenToOpen(subscriptionPlan);
    navigation.preload(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, accountTabPayload);
}

function preloadInboxTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    navigation.preload(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {screen: SCREENS.HOME});
}

function preloadTab(tabName: string, navigation: PlatformStackNavigationProp<AuthScreensParamList>, subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null) {
    switch (tabName) {
        case NAVIGATION_TABS.WORKSPACES:
            preloadWorkspacesTab(navigation);
            return;
        case NAVIGATION_TABS.SEARCH:
            preloadReportsTab(navigation);
            return;
        case NAVIGATION_TABS.SETTINGS:
            preloadAccountTab(navigation, subscriptionPlan);
            return;
        case NAVIGATION_TABS.HOME:
            preloadInboxTab(navigation);
            return;
        default:
            return undefined;
    }
}

function isPreloadedRouteSubscriptionScreen(preloadedRoute: NavigationRoute<AuthScreensParamList, keyof AuthScreensParamList>) {
    return (
        preloadedRoute.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR &&
        preloadedRoute.params &&
        `screen` in preloadedRoute.params &&
        preloadedRoute.params?.screen === SCREENS.SETTINGS.SUBSCRIPTION.ROOT
    );
}
/**
 * Hook that preloads all fullscreen navigators except the current one.
 * This helps improve performance by preloading navigators that might be needed soon.
 */
function usePreloadFullScreenNavigators() {
    const navigation = useNavigation<PlatformStackNavigationProp<AuthScreensParamList>>();
    const route = useRoute();
    const state = navigation.getState();
    // The fallback is used to prevent crashing from the UI test
    const preloadedRoutes = useMemo(() => state.preloadedRoutes ?? [], [state.preloadedRoutes]);
    const subscriptionPlan = useSubscriptionPlan();
    const isAuthenticated = useIsAuthenticated();
    const hasPreloadedRef = useRef(false);
    const [isSingleNewDotEntry = false] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isSingleNewDotEntrySelector, canBeMissing: true});

    const hasSubscriptionPlanTurnedOff = useMemo(() => {
        return !subscriptionPlan && preloadedRoutes.some(isPreloadedRouteSubscriptionScreen);
    }, [subscriptionPlan, preloadedRoutes]);

    useFocusEffect(
        useCallback(() => {
            if (!hasSubscriptionPlanTurnedOff) {
                return;
            }
            navigation.reset({...navigation.getState(), preloadedRoutes: preloadedRoutes.filter((preloadedRoute) => preloadedRoute.name !== NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)});
            Navigation.isNavigationReady().then(() => setTimeout(() => preloadAccountTab(navigation, subscriptionPlan), TIMING_TO_CALL_PRELOAD));
        }, [hasSubscriptionPlanTurnedOff, navigation, preloadedRoutes, subscriptionPlan]),
    );

    useFocusEffect(
        useCallback(() => {
            if (isAnonymousUser() || !isAuthenticated || hasPreloadedRef.current || isSingleNewDotEntry) {
                return;
            }
            hasPreloadedRef.current = true;
            setTimeout(() => {
                for (const tabName of TABS_TO_PRELOAD) {
                    // Don't preload the current tab
                    const isCurrentTab = TAB_TO_FULLSCREEN[tabName].includes(route.name as FullScreenName);
                    if (isCurrentTab) {
                        continue;
                    }

                    // Don't preload tabs that are already preloaded
                    const isRouteAlreadyPreloaded = preloadedRoutes.some((preloadedRoute) => TAB_TO_FULLSCREEN[tabName].includes(preloadedRoute.name as FullScreenName));
                    if (isRouteAlreadyPreloaded) {
                        continue;
                    }

                    // Preload everything else
                    preloadTab(tabName, navigation, subscriptionPlan);
                }
            }, TIMING_TO_CALL_PRELOAD);
        }, [isAuthenticated, isSingleNewDotEntry, route.name, preloadedRoutes, navigation, subscriptionPlan]),
    );
}

export default usePreloadFullScreenNavigators;
