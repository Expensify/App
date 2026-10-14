import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import getStringParam from '@components/Navigation/NavigationTabBar/getStringParam';

import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import Navigation from '@libs/Navigation/Navigation';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {isAnonymousSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

import type {NativeTabItemKind} from './NATIVE_TAB_GLYPHS';

import getNativeTabBarItems from './getNativeTabBarItems';
import {NATIVE_TAB_ITEM_KINDS} from './NATIVE_TAB_GLYPHS';
import {isInboxTabAtChatList, isNativeTabSelectionEnabled} from './tabScreenListeners';

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded, since swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.MORE, SCREENS.SETTINGS.ROOT]);

/** stale === false distinguishes a fully realized NavigationState from a PartialState. */
function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

function useNativeTabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const {translate} = useLocalize();
    const [isAnonymousUser = false] = useOnyx(ONYXKEYS.SESSION, {selector: isAnonymousSessionSelector});
    const {indicatorColor: inboxDotColor} = useInboxTabIndicatorStatus();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const isFocusedRouteTabRoot = useNavigationState((state) => TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(findFocusedRoute(state)?.name ?? ''));
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because the navigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRoute = isRealizedNavigationState(tabState) ? tabState.routes[tabState.index] : undefined;
    const getTabRoute = (tabName: string) => (isRealizedNavigationState(tabState) ? tabState.routes.find((tabRoute) => tabRoute.name === tabName) : undefined);
    const spendSearchKey = getStringParam(getTabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR)?.state?.routes.at(0)?.params, 'searchKey');
    const tabBarItems = getNativeTabBarItems(activeTabRoute?.name, spendSearchKey);
    // A tab with no item in the bar is drawn over the other tabs as a full screen, so the bar hides while it is focused.
    const isActiveTabWithoutBarItem = !!activeTabRoute && !tabBarItems[activeTabRoute.name];
    const shouldShowNativeTabBar = shouldUseNarrowLayout && isTabRouteAtRoot(activeTabRoute) && !isBlockingViewVisible && !isActiveTabWithoutBarItem;
    const isInboxAtChatList = isInboxTabAtChatList(getTabRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

    const dotColors: Partial<Record<NativeTabItemKind, string>> = {
        [NATIVE_TAB_ITEM_KINDS.INBOX]: inboxDotColor,
        // Workspaces lives behind More, so its attention dot has to surface there.
        [NATIVE_TAB_ITEM_KINDS.MORE]: workspacesIndicatorStatus ? workspacesIndicatorColor : undefined,
    };
    const tabLabels: Record<NativeTabItemKind, string> = {
        [NATIVE_TAB_ITEM_KINDS.HOME]: translate('common.home'),
        [NATIVE_TAB_ITEM_KINDS.INBOX]: translate('common.inbox'),
        [NATIVE_TAB_ITEM_KINDS.EXPENSES]: translate('search.tabs.expenses'),
        [NATIVE_TAB_ITEM_KINDS.REPORTS]: translate('common.reports'),
        [NATIVE_TAB_ITEM_KINDS.MORE]: translate('common.more'),
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

    // Without the beta, the Insights page is not found, so a restored or deep-linked Insights tab would land on a dead
    // end. Home replaces it, so going back does not return to it. Betas that are still loading are not a missing beta.
    const isInsightsTabFocusedWithoutBeta = isBetaEnabledOrUnknown(CONST.BETAS.INSIGHTS_PAGE) === false && activeTabRoute?.name === SCREENS.INSIGHTS;
    useEffect(() => {
        if (!isInsightsTabFocusedWithoutBeta) {
            return;
        }
        Navigation.navigate(ROUTES.HOME, {forceReplace: true});
    }, [isInsightsTabFocusedWithoutBeta]);

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

    const isTabSelectionEnabled = (routeName: string) => !!tabBarItems[routeName]?.isNativeSelectionEnabled && isNativeTabSelectionEnabled(routeName, {isAnonymousUser, isInboxAtChatList});

    return {shouldShowNativeTabBar, dotColors, tabLabels, tabBarItems, tabRouterOverride, isTabSelectionEnabled};
}

export default useNativeTabNavigator;
