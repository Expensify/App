import {findFocusedRoute, useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {isAnonymousUser} from '@libs/actions/Session';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getSettingsTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import {TAB_TO_FULLSCREEN} from '@libs/Navigation/linkingConfig/RELATIONS';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, FullScreenName, SearchFullscreenNavigatorParamList, SettingsSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import {getPreservedNavigatorState} from './createSplitNavigator/usePreserveNavigatorState';

function preloadWorkspacesTab(navigation: PlatformStackNavigationProp<AuthScreensParamList>) {
    const lastWorkspacesSplitNavigator = navigation.getState().routes.findLast((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);

    if (!lastWorkspacesSplitNavigator) {
        navigation.preload(SCREENS.WORKSPACES_LIST, {});
        return;
    }

    if (!lastWorkspacesSplitNavigator?.state) {
        return;
    }

    const focusedWorkspaceRoute = findFocusedRoute(lastWorkspacesSplitNavigator.state);

    if (!focusedWorkspaceRoute || !focusedWorkspaceRoute?.params) {
        return;
    }

    if (getIsNarrowLayout()) {
        navigation.preload(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
            screen: SCREENS.WORKSPACE.INITIAL,
            params: focusedWorkspaceRoute.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL],
        });
        return;
    }

    navigation.preload(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: focusedWorkspaceRoute.name,
        params: focusedWorkspaceRoute.params,
    });
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
    const payload = getIsNarrowLayout() ? {screen: SCREENS.HOME} : {screen: SCREENS.REPORT};
    navigation.preload(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, payload);
}

/**
 * Hook that preloads all fullscreen navigators except the current one.
 * This helps improve performance by preloading navigators that might be needed soon.
 */
function usePreloadFullScreenNavigators(fullscreenTabName: keyof typeof NAVIGATION_TABS) {
    const navigation = useNavigation<PlatformStackNavigationProp<AuthScreensParamList>>();
    const state = navigation.getState();
    const preloadedRoutes = useMemo(() => state.preloadedRoutes, [state]);
    const subscriptionPlan = useSubscriptionPlan();

    useFocusEffect(
        useCallback(() => {
            if (isAnonymousUser()) {
                return;
            }

            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Object.values(NAVIGATION_TABS)
                    .filter((tabName) => {
                        const isCurrentTab = tabName === fullscreenTabName;
                        const isRouteAlreadyPreloaded = preloadedRoutes.some((preloadedRoute) => TAB_TO_FULLSCREEN[fullscreenTabName].includes(preloadedRoute.name as FullScreenName));
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
        }, [fullscreenTabName, navigation, preloadedRoutes, subscriptionPlan]),
    );
}

export default usePreloadFullScreenNavigators;
