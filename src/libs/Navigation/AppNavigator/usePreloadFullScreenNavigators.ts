import {findFocusedRoute, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useCallback, useMemo, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {isAnonymousUser} from '@libs/actions/Session';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getSettingsTabStateFromSessionStorage, getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import {TAB_TO_FULLSCREEN} from '@libs/Navigation/linkingConfig/RELATIONS';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, FullScreenName, SearchFullscreenNavigatorParamList, SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import {getPreservedNavigatorState} from './createSplitNavigator/usePreserveNavigatorState';

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
        }
    }

    navigation.preload(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, {screen: SCREENS.SEARCH.ROOT, params: {q: buildCannedSearchQuery()}});
}

function preloadAccountTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>, subscriptionPlan: ValueOf<typeof CONST.POLICY.TYPE> | null) {
    if (!getIsNarrowLayout()) {
        const settingsTabState = getSettingsTabStateFromSessionStorage();

        if (!settingsTabState) {
            navigation.preload(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, {screen: SCREENS.SETTINGS.PROFILE.ROOT, params: {}});
            return;
        }

        const screenName = findFocusedRoute(settingsTabState)?.name as keyof SettingsSplitNavigatorParamList | undefined;

        if ((!subscriptionPlan && screenName === SCREENS.SETTINGS.SUBSCRIPTION.ROOT) || !screenName) {
            navigation.preload(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, {screen: SCREENS.SETTINGS.PROFILE.ROOT, params: {}});
            return;
        }

        navigation.preload(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, {
            screen: screenName,
        });
        return;
    }
    navigation.preload(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, {screen: SCREENS.SETTINGS.ROOT});
}

function preloadInboxTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    navigation.preload(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {screen: SCREENS.HOME});
}

/**
 * Hook that preloads all fullscreen navigators except the current one.
 * This helps improve performance by preloading navigators that might be needed soon.
 */
function usePreloadFullScreenNavigators() {
    const navigation = useNavigation<PlatformStackNavigationProp<AuthScreensParamList>>();
    const route = useRoute();
    const state = navigation.getState();
    const preloadedRoutes = useMemo(() => state.preloadedRoutes, [state]);
    const subscriptionPlan = useSubscriptionPlan();
    const isAuthenticated = useIsAuthenticated();
    const hasPreloadedRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (isAnonymousUser() || !isAuthenticated || hasPreloadedRef.current) {
                return;
            }
            hasPreloadedRef.current = true;
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Object.values(NAVIGATION_TABS)
                    .filter((tabName) => {
                        const isCurrentTab = TAB_TO_FULLSCREEN[tabName].includes(route.name as FullScreenName);
                        const isRouteAlreadyPreloaded = preloadedRoutes.some((preloadedRoute) => TAB_TO_FULLSCREEN[tabName].includes(preloadedRoute.name as FullScreenName));
                        return !isCurrentTab && !isRouteAlreadyPreloaded;
                    })
                    .forEach((tabName) => {
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
                    });
            });
        }, [navigation, preloadedRoutes, route.name, subscriptionPlan, isAuthenticated]),
    );
}

export default usePreloadFullScreenNavigators;
