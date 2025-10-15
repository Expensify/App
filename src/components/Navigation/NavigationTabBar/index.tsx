import {findFocusedRoute, StackActions, useNavigationState} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderGap from '@components/HeaderGap';
import Icon from '@components/Icon';
// import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import getAccountTabScreenToOpen from '@libs/Navigation/helpers/getAccountTabScreenToOpen';
import isRoutePreloaded from '@libs/Navigation/helpers/isRoutePreloaded';
import navigateToWorkspacesPage, {getWorkspaceNavigationRouteState} from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import navigationRef from '@navigation/navigationRef';
import type {RootNavigatorParamList, SearchFullscreenNavigatorParamList, State, WorkspaceSplitNavigatorParamList} from '@navigation/types';
import NavigationTabBarAvatar from '@pages/home/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/home/sidebar/NavigationTabBarFloatingActionButton';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import NAVIGATION_TABS from './NAVIGATION_TABS';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isTopLevelBar?: boolean;
};

function NavigationTabBar({selectedTab, isTopLevelBar = false}: NavigationTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const getIconFill = useCallback(
        (isSelected: boolean, isHovered: boolean) => {
            if (isSelected) {
                return theme.iconMenu;
            }
            if (isHovered) {
                return theme.success;
            }
            return theme.icon;
        },
        [theme],
    );
    const {translate, preferredLocale} = useLocalize();
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {orderedReportIDs} = useSidebarOrderedReports();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const navigationState = useNavigationState(findFocusedRoute);
    const initialNavigationRouteState = getWorkspaceNavigationRouteState();
    const [lastWorkspacesTabNavigatorRoute, setLastWorkspacesTabNavigatorRoute] = useState(initialNavigationRouteState.lastWorkspacesTabNavigatorRoute);
    const [workspacesTabState, setWorkspacesTabState] = useState(initialNavigationRouteState.workspacesTabState);
    const params = workspacesTabState?.routes?.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
    const {typeMenuSections} = useSearchTypeMenuSections();
    const subscriptionPlan = useSubscriptionPlan();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Inbox', 'MoneySearch', 'Buildings'] as const);

    const [lastViewedPolicy] = useOnyx(
        ONYXKEYS.COLLECTION.POLICY,
        {
            canBeMissing: true,
            selector: (val) => {
                if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || !params?.policyID) {
                    return undefined;
                }

                return val?.[`${ONYXKEYS.COLLECTION.POLICY}${params.policyID}`];
            },
        },
        [navigationState],
    );

    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);

    const StyleUtils = useStyleUtils();

    useEffect(() => {
        const newWorkspacesTabState = getWorkspaceNavigationRouteState();
        const newLastRoute = newWorkspacesTabState.lastWorkspacesTabNavigatorRoute;
        const newTabState = newWorkspacesTabState.workspacesTabState;

        setLastWorkspacesTabNavigatorRoute(newLastRoute);
        setWorkspacesTabState(newTabState);
    }, [navigationState]);

    // On a wide layout DebugTabView should be rendered only within the navigation tab bar displayed directly on screens.
    const shouldRenderDebugTabViewOnWideLayout = !!isDebugModeEnabled && !isTopLevelBar;

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(orderedReportIDs, reportAttributes));
    }, [orderedReportIDs, reportAttributes]);

    const navigateToChats = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }

        Navigation.navigate(ROUTES.HOME);
    }, [selectedTab]);

    const navigateToSearch = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.SEARCH) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
            const lastSearchNavigator = rootState.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
            const lastSearchNavigatorState = lastSearchNavigator && lastSearchNavigator.key ? getPreservedNavigatorState(lastSearchNavigator?.key) : undefined;
            const lastSearchRoute = lastSearchNavigatorState?.routes.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

            if (lastSearchRoute) {
                const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
                const queryJSON = buildSearchQueryJSON(q);
                if (queryJSON) {
                    const query = buildSearchQueryString(queryJSON);
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query,
                            ...rest,
                        }),
                    );
                    return;
                }
            }

            const nonExploreTypeQuery = typeMenuSections.at(0)?.menuItems.at(0)?.searchQuery;
            const savedSearchQuery = Object.values(savedSearches ?? {}).at(0)?.query;
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: nonExploreTypeQuery ?? savedSearchQuery ?? buildCannedSearchQuery()}));
        });
    }, [selectedTab, typeMenuSections, savedSearches]);

    const navigateToSettings = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            if (isRoutePreloaded(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)) {
                // We use dispatch here because the correct screens and params are preloaded and set up in usePreloadFullScreenNavigators.
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.PUSH, payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}});
                return;
            }
            const accountTabPayload = getAccountTabScreenToOpen(subscriptionPlan);
            navigationRef.dispatch(StackActions.push(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, accountTabPayload));
        });
    }, [selectedTab, subscriptionPlan]);

    /**
     * The settings tab is related to SettingsSplitNavigator and WorkspaceSplitNavigator.
     * If the user opens this tab from another tab, it is necessary to check whether it has not been opened before.
     * If so, all previously opened screens have be pushed to the navigation stack to maintain the order of screens within the tab.
     * If the user clicks on the settings tab while on this tab, this button should go back to the previous screen within the tab.
     */
    const showWorkspaces = useCallback(() => {
        navigateToWorkspacesPage({shouldUseNarrowLayout, currentUserLogin, policy: lastViewedPolicy});
    }, [shouldUseNarrowLayout, currentUserLogin, lastViewedPolicy]);

    if (!shouldUseNarrowLayout) {
        return (
            <>
                {shouldRenderDebugTabViewOnWideLayout && (
                    <DebugTabView
                        selectedTab={selectedTab}
                        chatTabBrickRoad={chatTabBrickRoad}
                    />
                )}
                <View style={styles.leftNavigationTabBarContainer}>
                    <HeaderGap />
                    <View style={styles.flex1}>
                        <PressableWithFeedback
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel="Home"
                            accessible
                            testID="ExpensifyLogoButton"
                            onPress={navigateToChats}
                            wrapperStyle={styles.leftNavigationTabBarItem}
                        >
                            <ImageSVG
                                style={StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT)}
                                src={expensifyIcons.ExpensifyAppIcon}
                            />
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            onPress={navigateToChats}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.inbox')}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                        >
                            {({hovered}) => (
                                <>
                                    <View>
                                        <Icon
                                            src={expensifyIcons.Inbox}
                                            fill={getIconFill(selectedTab === NAVIGATION_TABS.HOME, hovered)}
                                            width={variables.iconBottomBar}
                                            height={variables.iconBottomBar}
                                        />
                                        {!!chatTabBrickRoad && (
                                            <View
                                                style={[
                                                    styles.navigationTabBarStatusIndicator,
                                                    styles.statusIndicatorColor(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger),
                                                    hovered && {borderColor: theme.sidebarHover},
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            styles.textSmall,
                                            styles.textAlignCenter,
                                            styles.mt1Half,
                                            selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                                            styles.navigationTabBarLabel,
                                        ]}
                                    >
                                        {translate('common.inbox')}
                                    </Text>
                                </>
                            )}
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            onPress={navigateToSearch}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.reports')}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                        >
                            {({hovered}) => (
                                <>
                                    <View>
                                        <Icon
                                            src={expensifyIcons.MoneySearch}
                                            fill={getIconFill(selectedTab === NAVIGATION_TABS.SEARCH, hovered)}
                                            width={variables.iconBottomBar}
                                            height={variables.iconBottomBar}
                                        />
                                    </View>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            styles.textSmall,
                                            styles.textAlignCenter,
                                            styles.mt1Half,
                                            selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                                            styles.navigationTabBarLabel,
                                        ]}
                                    >
                                        {translate('common.reports')}
                                    </Text>
                                </>
                            )}
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            onPress={showWorkspaces}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.workspacesTabTitle')}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                        >
                            {({hovered}) => (
                                <>
                                    <View>
                                        <Icon
                                            src={expensifyIcons.Buildings}
                                            fill={getIconFill(selectedTab === NAVIGATION_TABS.WORKSPACES, hovered)}
                                            width={variables.iconBottomBar}
                                            height={variables.iconBottomBar}
                                        />
                                        {!!workspacesTabIndicatorStatus && (
                                            <View
                                                style={[
                                                    styles.navigationTabBarStatusIndicator,
                                                    styles.statusIndicatorColor(workspacesTabIndicatorColor),
                                                    hovered && {borderColor: theme.sidebarHover},
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        numberOfLines={preferredLocale === CONST.LOCALES.DE || preferredLocale === CONST.LOCALES.NL ? 1 : 2}
                                        style={[
                                            styles.textSmall,
                                            styles.textAlignCenter,
                                            styles.mt1Half,
                                            selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                                            styles.navigationTabBarLabel,
                                        ]}
                                    >
                                        {translate('common.workspacesTabTitle')}
                                    </Text>
                                </>
                            )}
                        </PressableWithFeedback>
                        <NavigationTabBarAvatar
                            style={styles.leftNavigationTabBarItem}
                            isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                            onPress={navigateToSettings}
                        />
                    </View>
                    <View style={styles.leftNavigationTabBarFAB}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            {!!isDebugModeEnabled && (
                <DebugTabView
                    selectedTab={selectedTab}
                    chatTabBrickRoad={chatTabBrickRoad}
                />
            )}
            <View style={styles.navigationTabBarContainer}>
                <PressableWithFeedback
                    onPress={navigateToChats}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.inbox')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={expensifyIcons.Inbox}
                            fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                        {!!chatTabBrickRoad && (
                            <View
                                style={[
                                    styles.navigationTabBarStatusIndicator,
                                    styles.statusIndicatorColor(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger),
                                ]}
                            />
                        )}
                    </View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.inbox')}
                    </Text>
                </PressableWithFeedback>
                <PressableWithFeedback
                    onPress={navigateToSearch}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.reports')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={expensifyIcons.MoneySearch}
                            fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.reports')}
                    </Text>
                </PressableWithFeedback>
                <View style={[styles.flex1, styles.navigationTabBarItem]}>
                    <NavigationTabBarFloatingActionButton />
                </View>
                <PressableWithFeedback
                    onPress={showWorkspaces}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.workspacesTabTitle')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={expensifyIcons.Buildings}
                            fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                        {!!workspacesTabIndicatorStatus && <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(workspacesTabIndicatorColor)]} />}
                    </View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.WORKSPACES ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.workspacesTabTitle')}
                    </Text>
                </PressableWithFeedback>
                <NavigationTabBarAvatar
                    style={styles.navigationTabBarItem}
                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                    onPress={navigateToSettings}
                />
            </View>
        </>
    );
}

NavigationTabBar.displayName = 'NavigationTabBar';

export default memo(NavigationTabBar);
