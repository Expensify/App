import React, {memo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderGap from '@components/HeaderGap';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import getPlatform from '@libs/getPlatform';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {
    getLastVisitedTabPath,
    getLastVisitedWorkspaceTabScreen,
    getSettingsTabStateFromSessionStorage,
    getWorkspacesTabStateFromSessionStorage,
} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import {isFullScreenName, isWorkspacesTabScreenName} from '@navigation/helpers/isNavigatorName';
import Navigation from '@navigation/Navigation';
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
    isTooltipAllowed?: boolean;
    isTopLevelBar?: boolean;
};

function NavigationTabBar({selectedTab, isTooltipAllowed = false, isTopLevelBar = false}: NavigationTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {orderedReports} = useSidebarOrderedReports();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (value) => value?.reports, canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const {
        renderProductTrainingTooltip: renderInboxTooltip,
        shouldShowProductTrainingTooltip: shouldShowInboxTooltip,
        hideProductTrainingTooltip: hideInboxTooltip,
    } = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.BOTTOM_NAV_INBOX_TOOLTIP, isTooltipAllowed && selectedTab !== NAVIGATION_TABS.HOME);

    const StyleUtils = useStyleUtils();

    // On a wide layout DebugTabView should be rendered only within the navigation tab bar displayed directly on screens.
    const shouldRenderDebugTabViewOnWideLayout = !!account?.isDebugModeEnabled && !isTopLevelBar;

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(orderedReports));
        // We need to get a new brick road state when report attributes are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportAttributes is added as a dependency here
    }, [orderedReports, reportAttributes]);

    const navigateToChats = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }

        hideInboxTooltip();
        Navigation.navigate(ROUTES.HOME);
    }, [hideInboxTooltip, selectedTab]);

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

            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
        });
    }, [selectedTab]);

    const navigateToSettings = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            const settingsTabState = getSettingsTabStateFromSessionStorage();
            if (settingsTabState && !shouldUseNarrowLayout) {
                const lastVisitedSettingsRoute = getLastVisitedTabPath(settingsTabState);
                if (lastVisitedSettingsRoute) {
                    Navigation.navigate(lastVisitedSettingsRoute);
                    return;
                }
            }
            Navigation.navigate(ROUTES.SETTINGS);
        });
    }, [selectedTab, shouldUseNarrowLayout]);

    /**
     * The settings tab is related to SettingsSplitNavigator and WorkspaceSplitNavigator.
     * If the user opens this tab from another tab, it is necessary to check whether it has not been opened before.
     * If so, all previously opened screens have be pushed to the navigation stack to maintain the order of screens within the tab.
     * If the user clicks on the settings tab while on this tab, this button should go back to the previous screen within the tab.
     */
    const showWorkspaces = useCallback(() => {
        const rootState = navigationRef.getRootState();
        const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
        if (!topmostFullScreenRoute) {
            return;
        }

        if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
            return;
        }

        interceptAnonymousUser(() => {
            const state = getWorkspacesTabStateFromSessionStorage() ?? rootState;
            const lastWorkspacesTabNavigatorRoute = state.routes.findLast((route) => isWorkspacesTabScreenName(route.name));
            // If there is no settings or workspace navigator route, then we should open the settings navigator.
            if (!lastWorkspacesTabNavigatorRoute) {
                Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
                return;
            }

            let workspacesTabState = lastWorkspacesTabNavigatorRoute.state;
            if (!workspacesTabState && lastWorkspacesTabNavigatorRoute.key) {
                workspacesTabState = getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key);
            }

            // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
            if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                const params = workspacesTabState?.routes.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
                // Screens of this navigator should always have policyID
                if (params.policyID) {
                    const workspaceScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceTabScreen() : SCREENS.WORKSPACE.INITIAL;
                    // This action will put settings split under the workspace split to make sure that we can swipe back to settings split.
                    navigationRef.dispatch({
                        type: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
                        payload: {
                            policyID: params.policyID,
                            screenName: workspaceScreenName,
                        },
                    });
                }
                return;
            }

            Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
        });
    }, [shouldUseNarrowLayout]);

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
                                src={Expensicons.ExpensifyAppIcon}
                            />
                        </PressableWithFeedback>
                        <EducationalTooltip
                            shouldRender={shouldShowInboxTooltip}
                            anchorAlignment={{
                                horizontal: isWebOrDesktop ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }}
                            shiftHorizontal={isWebOrDesktop ? 0 : variables.navigationTabBarInboxTooltipShiftHorizontal}
                            renderTooltipContent={renderInboxTooltip}
                            wrapperStyle={styles.productTrainingTooltipWrapper}
                            shouldHideOnNavigate={false}
                            onTooltipPress={navigateToChats}
                        >
                            <PressableWithFeedback
                                onPress={navigateToChats}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.inbox')}
                                style={styles.leftNavigationTabBarItem}
                            >
                                <View>
                                    <Icon
                                        src={Expensicons.Inbox}
                                        fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                                        width={variables.iconBottomBar}
                                        height={variables.iconBottomBar}
                                    />
                                    {!!chatTabBrickRoad && (
                                        <View
                                            style={styles.navigationTabBarStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)}
                                        />
                                    )}
                                </View>
                                <Text
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
                        </EducationalTooltip>
                        <PressableWithFeedback
                            onPress={navigateToSearch}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.reports')}
                            style={styles.leftNavigationTabBarItem}
                        >
                            <View>
                                <Icon
                                    src={Expensicons.MoneySearch}
                                    fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                                    width={variables.iconBottomBar}
                                    height={variables.iconBottomBar}
                                />
                            </View>
                            <Text
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
                        <PressableWithFeedback
                            onPress={showWorkspaces}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.workspacesTabTitle')}
                            style={styles.leftNavigationTabBarItem}
                        >
                            <View>
                                <Icon
                                    src={Expensicons.Buildings}
                                    fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                                    width={variables.iconBottomBar}
                                    height={variables.iconBottomBar}
                                />
                                {!!workspacesTabIndicatorStatus && <View style={styles.navigationTabBarStatusIndicator(workspacesTabIndicatorColor)} />}
                            </View>
                            <Text
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
                            style={styles.leftNavigationTabBarItem}
                            isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                            onPress={navigateToSettings}
                        />
                    </View>
                    <View style={styles.leftNavigationTabBarItem}>
                        <NavigationTabBarFloatingActionButton isTooltipAllowed={isTooltipAllowed} />
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            {!!account?.isDebugModeEnabled && (
                <DebugTabView
                    selectedTab={selectedTab}
                    chatTabBrickRoad={chatTabBrickRoad}
                />
            )}
            <View style={styles.navigationTabBarContainer}>
                <EducationalTooltip
                    shouldRender={shouldShowInboxTooltip}
                    anchorAlignment={{
                        horizontal: isWebOrDesktop ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    shiftHorizontal={isWebOrDesktop ? 0 : variables.navigationTabBarInboxTooltipShiftHorizontal}
                    renderTooltipContent={renderInboxTooltip}
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                    shouldHideOnNavigate={false}
                    onTooltipPress={navigateToChats}
                >
                    <PressableWithFeedback
                        onPress={navigateToChats}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.inbox')}
                        wrapperStyle={styles.flex1}
                        style={styles.navigationTabBarItem}
                    >
                        <View>
                            <Icon
                                src={Expensicons.Inbox}
                                fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                                width={variables.iconBottomBar}
                                height={variables.iconBottomBar}
                            />
                            {!!chatTabBrickRoad && (
                                <View style={styles.navigationTabBarStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)} />
                            )}
                        </View>
                        <Text
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
                </EducationalTooltip>
                <PressableWithFeedback
                    onPress={navigateToSearch}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.reports')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.MoneySearch}
                            fill={selectedTab === NAVIGATION_TABS.SEARCH ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
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
                    <NavigationTabBarFloatingActionButton isTooltipAllowed={isTooltipAllowed} />
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
                            src={Expensicons.Buildings}
                            fill={selectedTab === NAVIGATION_TABS.WORKSPACES ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                        {!!workspacesTabIndicatorStatus && <View style={styles.navigationTabBarStatusIndicator(workspacesTabIndicatorColor)} />}
                    </View>
                    <Text
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
