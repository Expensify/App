import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';

import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {useNavigationState, useRoute} from '@react-navigation/native';
import {isAnonymousSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

import getActiveTabRoute from './getActiveTabRoute';
import {isNavigationToNativeTabItem} from './nativeTabItemUtils';
import {isInboxTabAtChatList, isNativeTabSelectionEnabled} from './tabScreenListeners';
import useIsWorkspacesTabRestored from './useIsWorkspacesTabRestored';

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

type NativeTabNavigatorParams = {
    /** Whether the bar shows the flat nav items, see useIsNativeFlatNavTabBarEnabled */
    isFlatNavTabBarEnabled?: boolean;
};

function useNativeTabNavigator({isFlatNavTabBarEnabled = false}: NativeTabNavigatorParams = {}) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {translate} = useLocalize();
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});
    const {indicatorColor: inboxDotColor} = useInboxTabIndicatorStatus();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because the navigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
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
    // Only the items in the bar get a label: the iOS labels are sized by how many items the bar has, and a tab without
    // a label is hidden from the bar.
    const tabLabels: Record<string, string> = {
        [SCREENS.HOME]: translate('common.home'),
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: translate('common.inbox'),
        ...(isFlatNavTabBarEnabled
            ? {
                  [SCREENS.NATIVE_TAB_ITEM.EXPENSES]: translate('common.expenses'),
                  [SCREENS.NATIVE_TAB_ITEM.REPORTS]: translate('common.reports'),
                  [SCREENS.NATIVE_TAB_ITEM.MORE]: translate('common.more'),
              }
            : {
                  [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: translate('common.spend'),
                  [SCREENS.INSIGHTS]: translate('common.insights'),
                  [NAVIGATORS.WORKSPACE_NAVIGATOR]: translate('common.workspacesTabTitle'),
              }),
    };

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

    return {shouldShowNativeTabBar, dotColors, tabLabels, tabRouterOverride, isTabSelectionEnabled};
}

export default useNativeTabNavigator;
