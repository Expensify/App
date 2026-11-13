import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';

import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {isAnonymousSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

import getActiveTabRoute from './getActiveTabRoute';
import getTabNavigatorState from './getTabNavigatorState';
import {getFlatNavTabHostRouteName, isNavigationToNativeTabItem} from './nativeTabItemUtils';
import {isInboxTabAtChatList, isNativeTabSelectionEnabled} from './tabScreenListeners';
import useIsWorkspacesTabRestored from './useIsWorkspacesTabRestored';

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded, since swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.SETTINGS.ROOT]);

/** Tabs that stay reachable by navigation but have no item in the native bar. */
const TABS_WITHOUT_BAR_ITEM: ReadonlySet<string> = new Set([NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]);

/**
 * With the flat nav bar, Search, Insights and Workspaces are drawn inside the Expenses, Reports and More placeholders.
 * Account has no item to stand in for it, so it has no host and is drawn in Home with no item shown as selected.
 */
const FLAT_NAV_TABS_WITHOUT_BAR_ITEM: ReadonlySet<string> = new Set([
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.INSIGHTS,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
]);

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

type NativeTabNavigatorParams = {
    /** Whether the bar shows the flat nav items, see useIsNativeFlatNavTabBarEnabled */
    isFlatNavTabBarEnabled?: boolean;

    /** The section of the search Search shows, which decides the item Search is drawn inside. Only read with the flat nav bar. */
    flatNavSearchSectionID?: FlatNavSectionID;
};

function useNativeTabNavigator({isFlatNavTabBarEnabled = false, flatNavSearchSectionID}: NativeTabNavigatorParams = {}) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {translate} = useLocalize();
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});
    const {indicatorColor: inboxDotColor} = useInboxTabIndicatorStatus();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const isFocusedRouteTabRoot = useNavigationState((state) => TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(findFocusedRoute(state)?.name ?? ''));
    const route = useRoute();
    const tabState = useNavigationState((parentState) => getTabNavigatorState(parentState, route.key));
    const activeTabRoute = getActiveTabRoute(tabState);
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeTabRoute) && !isBlockingViewVisible;
    const getTabRoute = (tabName: string) => (isRealizedNavigationState(tabState) ? tabState.routes.find((tabRoute) => tabRoute.name === tabName) : undefined);
    const isInboxAtChatList = isInboxTabAtChatList(getTabRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
    const isWorkspacesTabRestored = useIsWorkspacesTabRestored(getTabRoute(NAVIGATORS.WORKSPACE_NAVIGATOR));

    const workspacesDotColor = workspacesIndicatorStatus ? workspacesIndicatorColor : undefined;
    const dotColors: Record<string, string | undefined> = {
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: inboxDotColor,
        [isFlatNavTabBarEnabled ? SCREENS.NATIVE_TAB_ITEM.MORE : NAVIGATORS.WORKSPACE_NAVIGATOR]: workspacesDotColor,
    };
    // The iOS labels are sized by how many items the bar has, so only the items in the bar get a label.
    const tabLabels: Record<string, string> = isFlatNavTabBarEnabled
        ? {
              [SCREENS.HOME]: translate('common.home'),
              [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
              [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: translate('common.expenses'),
              [SCREENS.NATIVE_TAB_ITEM.REPORTS]: translate('common.reports'),
              [SCREENS.NATIVE_TAB_ITEM.MORE]: translate('common.more'),
          }
        : {
              [SCREENS.HOME]: translate('common.home'),
              [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
              [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: translate('common.spend'),
              [SCREENS.INSIGHTS]: translate('common.insights'),
              [NAVIGATORS.WORKSPACE_NAVIGATOR]: translate('common.workspacesTabTitle'),
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

    // The slicing optimization in useCustomRootStackNavigatorState can unmount and later remount
    // this TAB_NAVIGATOR. Without restoration it would default to index 0. We restore the saved
    // state by overriding the bottom-tab router's getInitialState, the same pattern SplitRouter
    // uses for its split navigators.
    // A placeholder of the flat nav bar is never focused and never enters the history: the bar navigates to it when the
    // user selects it, and its tab press handler navigates to the route it stands for instead.
    const tabRouterOverride = <Action extends NavigationAction>(
        originalRouter: Router<TabNavigationState<TabNavigatorParamList>, Action>,
    ): Partial<Router<TabNavigationState<TabNavigatorParamList>, Action>> => ({
        getInitialState: (configOptions) => {
            const preserved = getPreservedNavigatorState<TabNavigationState<TabNavigatorParamList>>(route.key);
            return preserved ? originalRouter.getRehydratedState(preserved, configOptions) : originalRouter.getInitialState(configOptions);
        },
        getStateForAction: (state, action, configOptions) => (isNavigationToNativeTabItem(action) ? state : originalRouter.getStateForAction(state, action, configOptions)),
    });

    const isTabSelectionEnabled = (routeName: string) => isNativeTabSelectionEnabled(routeName, {isAnonymousUser, isInboxAtChatList, isWorkspacesTabRestored});

    const getTabHostRouteName = (routeName: string) => (isFlatNavTabBarEnabled ? getFlatNavTabHostRouteName(routeName, flatNavSearchSectionID) : undefined);

    return {
        shouldShowNativeTabBar,
        dotColors,
        tabLabels,
        tabsWithoutBarItem: isFlatNavTabBarEnabled ? FLAT_NAV_TABS_WITHOUT_BAR_ITEM : TABS_WITHOUT_BAR_ITEM,
        tabRouterOverride,
        isTabSelectionEnabled,
        isFlatNavTabBarEnabled,
        getTabHostRouteName,
    };
}

export default useNativeTabNavigator;
