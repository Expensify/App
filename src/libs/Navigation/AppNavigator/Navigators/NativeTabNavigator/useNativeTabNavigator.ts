import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useChatTabBrickRoad} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import Navigation from '@libs/Navigation/Navigation';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import cancelTabNavigationSpans, {NAVIGATION_TAB_TO_SPANS} from '@libs/telemetry/cancelTabNavigationSpans';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {isAnonymousSessionSelector} from '@selectors/Session';
import {useEffect, useState} from 'react';

import getTabWithoutBarItem from './getTabWithoutBarItem';

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded, since swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.SETTINGS.ROOT]);

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

function useNativeTabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const {translate} = useLocalize();
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});
    const isInsightsTabVisible = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const tabWithoutBarItem = getTabWithoutBarItem(isInsightsTabVisible);
    const theme = useTheme();
    const chatTabBrickRoad = useChatTabBrickRoad();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {indicatorColor: accountIndicatorColor, status: accountIndicatorStatus} = useAccountTabIndicatorStatus();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const isFocusedRouteTabRoot = useNavigationState((state) => TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(findFocusedRoute(state)?.name ?? ''));
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because the navigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRoute = isRealizedNavigationState(tabState) ? tabState.routes[tabState.index] : undefined;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeTabRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    // A tab with no item in the bar is drawn over the other tabs as a full screen, so the bar hides while it is focused.
    const isActiveTabWithoutBarItem = activeTabRoute?.name === tabWithoutBarItem;
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeTabRoute) && !isBlockingViewVisible && !isActiveTabWithoutBarItem;
    const isSpendSelected = activeTabRoute?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
    const [hasSpendBeenSelected, setHasSpendBeenSelected] = useState(isSpendSelected);
    if (isSpendSelected && !hasSpendBeenSelected) {
        setHasSpendBeenSelected(true);
    }

    let inboxDotColor: string | undefined;
    if (chatTabBrickRoad) {
        inboxDotColor = chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger;
    }
    const dotColors: Record<string, string | undefined> = {
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: inboxDotColor,
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: workspacesIndicatorStatus ? workspacesIndicatorColor : undefined,
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: accountIndicatorStatus ? accountIndicatorColor : undefined,
    };
    const tabLabels: Record<string, string> = {
        [SCREENS.HOME]: translate('common.home'),
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: translate('common.spend'),
        [SCREENS.INSIGHTS]: translate('common.insights'),
        [NAVIGATORS.WORKSPACE_NAVIGATOR]: translate('common.workspacesTabTitle'),
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: translate('initialSettingsPage.account'),
    };

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        parentNavigation.setOptions({gestureEnabled: !isFocusedRouteTabRoot});
    }, [isFocusedRouteTabRoot, shouldUseNarrowLayout, parentNavigation]);

    useEffect(() => {
        if (!isRealizedNavigationState(tabState)) {
            return;
        }
        setPreservedNavigatorState(route.key, tabState);
    }, [tabState, route.key]);

    // Without the beta, Insights has no bar item and its page is not found, so a restored or deep-linked Insights tab
    // would be a full screen with no way out. Home replaces it, so going back does not return to it. Betas that are
    // still loading are not a missing beta.
    const isInsightsTabFocusedWithoutBeta = isBetaEnabledOrUnknown(CONST.BETAS.INSIGHTS_PAGE) === false && activeTabRoute?.name === SCREENS.INSIGHTS;
    useEffect(() => {
        if (!isInsightsTabFocusedWithoutBeta) {
            return;
        }
        Navigation.navigate(ROUTES.HOME, {forceReplace: true});
    }, [isInsightsTabFocusedWithoutBeta]);

    // Cancel any in-flight tab-navigation span that doesn't match the new focused tab. The new tab's span is started at
    // the tap, before navigation, so it is kept. On wide layouts the JS side bar does this.
    useEffect(() => {
        if (!shouldUseNarrowLayout) {
            return;
        }
        cancelTabNavigationSpans(NAVIGATION_TAB_TO_SPANS[selectedTab]);
    }, [selectedTab, shouldUseNarrowLayout]);

    // The slicing optimization in useCustomRootStackNavigatorState can unmount and later remount
    // this TAB_NAVIGATOR. Without restoration it would default to index 0. We restore the saved
    // state by overriding the bottom-tab router's getInitialState, the same pattern SplitRouter
    // uses for its split navigators.
    const tabRouterOverride = <Action extends NavigationAction>(
        originalRouter: Router<TabNavigationState<TabNavigatorParamList>, Action>,
    ): Partial<Router<TabNavigationState<TabNavigatorParamList>, Action>> => ({
        getInitialState: (configOptions) => {
            const preserved = getPreservedNavigatorState<TabNavigationState<TabNavigatorParamList>>(route.key);
            return preserved ? originalRouter.getRehydratedState(preserved, configOptions) : originalRouter.getInitialState(configOptions);
        },
    });

    const isAccountAvatarShown = shouldUseNarrowLayout && tabWithoutBarItem !== NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR;

    return {shouldShowNativeTabBar, isAccountAvatarShown, dotColors, tabLabels, tabWithoutBarItem, tabRouterOverride, isAnonymousUser, hasSpendBeenSelected};
}

export default useNativeTabNavigator;
