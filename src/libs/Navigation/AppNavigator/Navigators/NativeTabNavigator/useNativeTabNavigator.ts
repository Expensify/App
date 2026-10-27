import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';

import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {isAnonymousSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

import getActiveTabRoute from './getActiveTabRoute';
import getTabWithoutBarItem from './getTabWithoutBarItem';
import {isInboxTabAtChatList, isNativeTabSelectionEnabled} from './tabScreenListeners';
import useIsTabRootRevealing from './useIsTabRootRevealing';
import useIsWorkspacesTabRestored from './useIsWorkspacesTabRestored';

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
    const {indicatorColor: inboxDotColor} = useInboxTabIndicatorStatus();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {indicatorColor: accountIndicatorColor, status: accountIndicatorStatus} = useAccountTabIndicatorStatus();
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();
    const parentNavigation = navigation.getParent();
    const isFocusedRouteTabRoot = useNavigationState((state) => TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(findFocusedRoute(state)?.name ?? ''));
    const route = useRoute();
    // The Tab.Navigator's own state lives at `parentState.routes[i].state`. We can't read it via
    // `useNavigationState((s) => s)` here because the navigator's body runs before <Tab.Navigator>
    // mounts, so the nearest navigation listener context is still the parent stack's.
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRoute = getActiveTabRoute(tabState);
    // A tab with no item in the bar is drawn over the other tabs as a full screen, so the bar hides while it is focused.
    const isActiveTabWithoutBarItem = activeTabRoute?.name === tabWithoutBarItem;
    // On a phone the right-hand pane covers the whole screen like a screen pushed inside a tab, so the bar hides for it too.
    const isRightModalOnTop = useNavigationState((parentState) => parentState.routes.at(parentState.index)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const isAtTabRoot = isTabRouteAtRoot(activeTabRoute) && !isRightModalOnTop;
    const [isTabRootRevealing, setIsTabRootRevealing] = useIsTabRootRevealing(isAtTabRoot, activeTabRoute?.key);
    const shouldShowNativeTabBar = shouldUseNarrowLayout && (isAtTabRoot || isTabRootRevealing) && !isBlockingViewVisible && !isActiveTabWithoutBarItem;
    const getTabRoute = (tabName: string) => (isRealizedNavigationState(tabState) ? tabState.routes.find((tabRoute) => tabRoute.name === tabName) : undefined);
    const isInboxAtChatList = isInboxTabAtChatList(getTabRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
    const isWorkspacesTabRestored = useIsWorkspacesTabRestored(getTabRoute(NAVIGATORS.WORKSPACE_NAVIGATOR));

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

    // The tabs come back into view at the start of the right-hand pane's closing animation, which on iOS can be a
    // swipe-back that updates the navigation state only once it ends.
    useEffect(
        () =>
            navigation.addListener('transitionStart', (event) => {
                if (!isRightModalOnTop || event.data?.closing !== false) {
                    return;
                }
                setIsTabRootRevealing(true);
            }),
        [navigation, isRightModalOnTop, setIsTabRootRevealing],
    );

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

    const isTabSelectionEnabled = (routeName: string) => isNativeTabSelectionEnabled(routeName, {isAnonymousUser, isInboxAtChatList, isWorkspacesTabRestored});

    return {shouldShowNativeTabBar, isAccountAvatarShown, dotColors, tabLabels, tabWithoutBarItem, tabRouterOverride, isTabSelectionEnabled, setIsTabRootRevealing};
}

export default useNativeTabNavigator;
