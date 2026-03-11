import type {NavigationRoute} from '@react-navigation/native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
import type {AuthScreensParamList, FullScreenName, RootTabNavigatorParamList, SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {getPreservedNavigatorState} from './createSplitNavigator/usePreserveNavigatorState';

// This timing is used to call the preload function after a tab change, when the initial tab screen has already been rendered.
const TIMING_TO_CALL_PRELOAD = 1000;

// Currently the Workspaces and Account tabs are preloaded, while Search and Inbox are not preloaded due to their potential complexity.
const TABS_TO_PRELOAD: ValueOf<typeof NAVIGATION_TABS>[] = [];

function getEffectiveFullScreenFromState(state: {routes: {name: string; state?: {routes: {name: string}[]; index?: number}}[]}): FullScreenName | undefined {
    const topmostRoute = state.routes.at(-1);
    if (!topmostRoute) {
        return undefined;
    }
    if (topmostRoute.name === NAVIGATORS.ROOT_TAB_NAVIGATOR) {
        const tabState = topmostRoute.state as {routes: {name: keyof RootTabNavigatorParamList}[]; index: number} | undefined;
        return tabState?.routes?.[tabState?.index ?? 0]?.name as FullScreenName | undefined;
    }
    return topmostRoute.name as FullScreenName;
}

function getPreloadedRouteEffectiveScreen(preloadedRoute: NavigationRoute<AuthScreensParamList, keyof AuthScreensParamList>): FullScreenName | undefined {
    if (preloadedRoute.name === NAVIGATORS.ROOT_TAB_NAVIGATOR && preloadedRoute.params && 'screen' in preloadedRoute.params) {
        return (preloadedRoute.params as {screen: keyof RootTabNavigatorParamList}).screen as FullScreenName;
    }
    return preloadedRoute.name as FullScreenName;
}

function preloadWorkspacesTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    const state = getWorkspacesTabStateFromSessionStorage() ?? navigation.getState();
    const lastWorkspacesSplitNavigator = state.routes.findLast((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);

    if (lastWorkspacesSplitNavigator) {
        return;
    }
    navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {screen: SCREENS.WORKSPACES_LIST, params: {}});
}

function preloadReportsTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    const rootState = navigation.getState();
    let lastSearchNavigator = rootState.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    if (!lastSearchNavigator) {
        const rootTabRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.ROOT_TAB_NAVIGATOR);
        const tabState = rootTabRoute?.state as {routes: {name: string; key?: string}[]} | undefined;
        lastSearchNavigator = tabState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    }
    const lastSearchNavigatorState = lastSearchNavigator?.key ? getPreservedNavigatorState(lastSearchNavigator.key) : undefined;
    const lastSearchRoute = lastSearchNavigatorState?.routes?.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

    if (lastSearchRoute) {
        const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
        const queryJSON = buildSearchQueryJSON(q);
        if (queryJSON) {
            const query = buildSearchQueryString(queryJSON);
            navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {
                screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                params: {q: query, ...rest},
            });
            return;
        }
    }

    navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {
        screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
        params: {q: buildCannedSearchQuery()},
    });
}

function preloadAccountTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>, subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null) {
    const accountTabPayload = getAccountTabScreenToOpen(subscriptionPlan);
    navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {
        screen: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
        params: accountTabPayload,
    });
}

function preloadInboxTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {
        screen: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
        params: {screen: SCREENS.INBOX},
    });
}

function preloadHomeTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    navigation.preload(NAVIGATORS.ROOT_TAB_NAVIGATOR, {screen: SCREENS.HOME});
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
        case NAVIGATION_TABS.INBOX:
            preloadInboxTab(navigation);
            return;
        case NAVIGATION_TABS.HOME:
            preloadHomeTab(navigation);
            return;
        default:
            return undefined;
    }
}

function isPreloadedRouteSubscriptionScreen(preloadedRoute: NavigationRoute<AuthScreensParamList, keyof AuthScreensParamList>) {
    if (preloadedRoute.name === NAVIGATORS.ROOT_TAB_NAVIGATOR && preloadedRoute.params && 'screen' in preloadedRoute.params) {
        const params = preloadedRoute.params as {screen: keyof RootTabNavigatorParamList; params?: {screen?: string}};
        return params.screen === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR && params.params?.screen === SCREENS.SETTINGS.SUBSCRIPTION.ROOT;
    }
    return false;
}
/**
 * Hook that preloads all fullscreen navigators except the current one.
 * This helps improve performance by preloading navigators that might be needed soon.
 */
function usePreloadFullScreenNavigators() {
    const navigation = useNavigation<PlatformStackNavigationProp<AuthScreensParamList>>();
    const state = navigation.getState();
    // The fallback is used to prevent crashing from the UI test
    const preloadedRoutes = useMemo(() => state.preloadedRoutes ?? [], [state.preloadedRoutes]);
    const subscriptionPlan = useSubscriptionPlan();
    const isAuthenticated = useIsAuthenticated();
    const hasPreloadedRef = useRef(false);
    const [isSingleNewDotEntry = false] = useOnyx(ONYXKEYS.HYBRID_APP, {selector: isSingleNewDotEntrySelector});

    const hasSubscriptionPlanTurnedOff = useMemo(() => {
        return !subscriptionPlan && preloadedRoutes.some(isPreloadedRouteSubscriptionScreen);
    }, [subscriptionPlan, preloadedRoutes]);

    useFocusEffect(
        useCallback(() => {
            if (!hasSubscriptionPlanTurnedOff) {
                return;
            }
            navigation.reset({
                ...navigation.getState(),
                preloadedRoutes: preloadedRoutes.filter(
                    (preloadedRoute) =>
                        !(
                            preloadedRoute.name === NAVIGATORS.ROOT_TAB_NAVIGATOR &&
                            preloadedRoute.params &&
                            'screen' in preloadedRoute.params &&
                            preloadedRoute.params.screen === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR
                        ),
                ),
            });
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
                const effectiveFullScreen = getEffectiveFullScreenFromState(state);
                for (const tabName of TABS_TO_PRELOAD) {
                    // Don't preload the current tab
                    const isCurrentTab = effectiveFullScreen && TAB_TO_FULLSCREEN[tabName].includes(effectiveFullScreen);
                    if (isCurrentTab) {
                        continue;
                    }

                    // Don't preload tabs that are already preloaded
                    const isRouteAlreadyPreloaded = preloadedRoutes.some((preloadedRoute) => {
                        const effectiveScreen = getPreloadedRouteEffectiveScreen(preloadedRoute);
                        return effectiveScreen !== undefined && TAB_TO_FULLSCREEN[tabName].includes(effectiveScreen);
                    });
                    if (isRouteAlreadyPreloaded) {
                        continue;
                    }

                    // Preload everything else
                    preloadTab(tabName, navigation, subscriptionPlan);
                }
            }, TIMING_TO_CALL_PRELOAD);
        }, [isAuthenticated, isSingleNewDotEntry, state, preloadedRoutes, navigation, subscriptionPlan]),
    );
}

export default usePreloadFullScreenNavigators;
