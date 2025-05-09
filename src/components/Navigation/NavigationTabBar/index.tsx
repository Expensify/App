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
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReportIDs} from '@hooks/useSidebarOrderedReportIDs';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import getPlatform from '@libs/getPlatform';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {getLastVisitedSettingsPath, getLastVisitedWorkspaceScreen, getSettingsTabStateFromSessionStorage} from '@libs/Navigation/helpers/getLastVisitedWorkspace';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import {isFullScreenName, isSettingsTabScreenName} from '@navigation/helpers/isNavigatorName';
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
    const {activeWorkspaceID} = useActiveWorkspace();
    const {orderedReportIDs} = useSidebarOrderedReportIDs();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const [reports = []] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (values) => orderedReportIDs.map((reportID) => values?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]),
        canBeMissing: true,
    });
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
        setChatTabBrickRoad(getChatTabBrickRoad(activeWorkspaceID, reports));
        // We need to get a new brick road state when report actions are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportActions is added as a dependency here
    }, [activeWorkspaceID, reports, reportActions]);

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

    /**
     * The settings tab is related to SettingsSplitNavigator and WorkspaceSplitNavigator.
     * If the user opens this tab from another tab, it is necessary to check whether it has not been opened before.
     * If so, all previously opened screens have be pushed to the navigation stack to maintain the order of screens within the tab.
     * If the user clicks on the settings tab while on this tab, this button should go back to the previous screen within the tab.
     */
    const showSettingsPage = useCallback(() => {
        const rootState = navigationRef.getRootState();
        const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
        if (!topmostFullScreenRoute) {
            return;
        }

        const lastRouteOfTopmostFullScreenRoute = 'state' in topmostFullScreenRoute ? topmostFullScreenRoute.state?.routes.at(-1) : undefined;

        if (lastRouteOfTopmostFullScreenRoute && lastRouteOfTopmostFullScreenRoute.name === SCREENS.SETTINGS.WORKSPACES && shouldUseNarrowLayout) {
            Navigation.goBack(ROUTES.SETTINGS);
            return;
        }

        if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            Navigation.goBack(ROUTES.SETTINGS);
            return;
        }

        interceptAnonymousUser(() => {
            const state = getSettingsTabStateFromSessionStorage() ?? rootState;
            const lastSettingsOrWorkspaceNavigatorRoute = state.routes.findLast((route) => isSettingsTabScreenName(route.name));
            // If there is no settings or workspace navigator route, then we should open the settings navigator.
            if (!lastSettingsOrWorkspaceNavigatorRoute) {
                Navigation.navigate(ROUTES.SETTINGS);
                return;
            }

            let settingsTabState = lastSettingsOrWorkspaceNavigatorRoute.state;
            if (!settingsTabState && lastSettingsOrWorkspaceNavigatorRoute.key) {
                settingsTabState = getPreservedNavigatorState(lastSettingsOrWorkspaceNavigatorRoute.key);
            }

            // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
            if (lastSettingsOrWorkspaceNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                const params = settingsTabState?.routes.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
                // Screens of this navigator should always have policyID
                if (params.policyID) {
                    const workspaceScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceScreen() : SCREENS.WORKSPACE.INITIAL;
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

            // If the path stored in the session storage leads to a settings screen, we just navigate to it on a wide layout.
            // On a small screen, we want to go to the page containing the bottom tab bar (ROUTES.SETTINGS or ROUTES.SETTINGS_WORKSPACES) when changing tabs
            if (settingsTabState && !shouldUseNarrowLayout) {
                const lastVisitedSettingsRoute = getLastVisitedSettingsPath(settingsTabState);
                if (lastVisitedSettingsRoute) {
                    Navigation.navigate(lastVisitedSettingsRoute);
                    return;
                }
            }
            // If there is settings workspace screen in the settings navigator, then we should open the settings workspaces as it should be "remembered".
            if (settingsTabState?.routes?.at(-1)?.name === SCREENS.SETTINGS.WORKSPACES) {
                Navigation.navigate(ROUTES.SETTINGS_WORKSPACES.route);
                return;
            }

            // Otherwise we should simply open the settings navigator.
            Navigation.navigate(ROUTES.SETTINGS);
        });
    }, [shouldUseNarrowLayout]);

    if (!shouldUseNarrowLayout) {
        return (
            <>
                {shouldRenderDebugTabViewOnWideLayout && (
                    <DebugTabView
                        selectedTab={selectedTab}
                        chatTabBrickRoad={chatTabBrickRoad}
                        activeWorkspaceID={activeWorkspaceID}
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
                        <NavigationTabBarAvatar
                            style={styles.leftNavigationTabBarItem}
                            isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                            onPress={showSettingsPage}
                            isWebOrDesktop={isWebOrDesktop}
                            isTooltipAllowed={isTooltipAllowed}
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
                    activeWorkspaceID={activeWorkspaceID}
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
                <NavigationTabBarAvatar
                    style={styles.navigationTabBarItem}
                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                    onPress={showSettingsPage}
                    isWebOrDesktop={isWebOrDesktop}
                    isTooltipAllowed={isTooltipAllowed}
                />
                <View style={[styles.flex1, styles.navigationTabBarItem]}>
                    <NavigationTabBarFloatingActionButton isTooltipAllowed={isTooltipAllowed} />
                </View>
            </View>
        </>
    );
}

NavigationTabBar.displayName = 'NavigationTabBar';

export default memo(NavigationTabBar);
