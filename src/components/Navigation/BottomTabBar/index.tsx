import React, {memo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import {useReportIDs} from '@hooks/useReportIDs';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import getPlatform from '@libs/getPlatform';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import {isFullScreenName} from '@navigation/helpers/isNavigatorName';
import Navigation from '@navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import type {RootNavigatorParamList, SearchFullscreenNavigatorParamList, State, WorkspaceSplitNavigatorParamList} from '@navigation/types';
import BottomTabAvatar from '@pages/home/sidebar/BottomTabAvatar';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import BOTTOM_TABS from './BOTTOM_TABS';

type BottomTabBarProps = {
    selectedTab: ValueOf<typeof BOTTOM_TABS>;
    isTooltipAllowed?: boolean;
};

function BottomTabBar({selectedTab, isTooltipAllowed = false}: BottomTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {orderedReportIDs} = useReportIDs();
    const [user] = useOnyx(ONYXKEYS.USER);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.BOTTOM_NAV_INBOX_TOOLTIP,
        isTooltipAllowed && selectedTab !== BOTTOM_TABS.HOME,
    );
    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(activeWorkspaceID, orderedReportIDs));
        // We need to get a new brick road state when report actions are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportActions is added as a dependency here
    }, [activeWorkspaceID, orderedReportIDs, reportActions]);

    const navigateToChats = useCallback(() => {
        if (selectedTab === BOTTOM_TABS.HOME) {
            return;
        }

        hideProductTrainingTooltip();
        Navigation.navigate(ROUTES.HOME);
    }, [hideProductTrainingTooltip, selectedTab]);

    const navigateToSearch = useCallback(() => {
        if (selectedTab === BOTTOM_TABS.SEARCH) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const defaultCannedQuery = buildCannedSearchQuery();

            const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
            const lastSearchNavigator = rootState.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
            const lastSearchNavigatorState = lastSearchNavigator && lastSearchNavigator.key ? getPreservedNavigatorState(lastSearchNavigator?.key) : undefined;
            const lastSearchRoute = lastSearchNavigatorState?.routes.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

            if (lastSearchRoute) {
                const {q, ...rest} = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
                const queryJSON = buildSearchQueryJSON(q);
                if (queryJSON) {
                    queryJSON.policyID = activeWorkspaceID;
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
            // when navigating to search we might have an activePolicyID set from workspace switcher
            const query = activeWorkspaceID ? `${defaultCannedQuery} ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${activeWorkspaceID}` : defaultCannedQuery;
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
        });
    }, [activeWorkspaceID, selectedTab]);

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
            const lastSettingsOrWorkspaceNavigatorRoute = rootState.routes.findLast(
                (rootRoute) => rootRoute.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR || rootRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            );

            // If there is no settings or workspace navigator route, then we should open the settings navigator.
            if (!lastSettingsOrWorkspaceNavigatorRoute) {
                Navigation.navigate(ROUTES.SETTINGS);
                return;
            }

            const state = lastSettingsOrWorkspaceNavigatorRoute.state ?? getPreservedNavigatorState(lastSettingsOrWorkspaceNavigatorRoute.key);

            // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
            if (lastSettingsOrWorkspaceNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                const params = state?.routes.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];

                // Screens of this navigator should always have policyID
                if (params.policyID) {
                    // This action will put settings split under the workspace split to make sure that we can swipe back to settings split.
                    navigationRef.dispatch({
                        type: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
                        payload: {
                            policyID: params.policyID,
                        },
                    });
                }
                return;
            }

            // If there is settings workspace screen in the settings navigator, then we should open the settings workspaces as it should be "remembered".
            if (state?.routes?.at(-1)?.name === SCREENS.SETTINGS.WORKSPACES) {
                Navigation.navigate(ROUTES.SETTINGS_WORKSPACES.route);
                return;
            }

            // Otherwise we should simply open the settings navigator.
            Navigation.navigate(ROUTES.SETTINGS);
        });
    }, [shouldUseNarrowLayout]);

    return (
        <>
            {!!user?.isDebugModeEnabled && (
                <DebugTabView
                    selectedTab={selectedTab}
                    chatTabBrickRoad={chatTabBrickRoad}
                    activeWorkspaceID={activeWorkspaceID}
                />
            )}
            <View style={styles.bottomTabBarContainer}>
                <EducationalTooltip
                    shouldRender={shouldShowProductTrainingTooltip}
                    anchorAlignment={{
                        horizontal: isWebOrDesktop ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    shiftHorizontal={isWebOrDesktop ? 0 : variables.bottomTabInboxTooltipShiftHorizontal}
                    renderTooltipContent={renderProductTrainingTooltip}
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                    shouldHideOnNavigate={false}
                    onTooltipPress={navigateToChats}
                >
                    <PressableWithFeedback
                        onPress={navigateToChats}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.inbox')}
                        wrapperStyle={styles.flex1}
                        style={styles.bottomTabBarItem}
                    >
                        <View>
                            <Icon
                                src={Expensicons.Inbox}
                                fill={selectedTab === BOTTOM_TABS.HOME ? theme.iconMenu : theme.icon}
                                width={variables.iconBottomBar}
                                height={variables.iconBottomBar}
                            />
                            {!!chatTabBrickRoad && (
                                <View style={styles.bottomTabStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)} />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.textSmall,
                                styles.textAlignCenter,
                                styles.mt1Half,
                                selectedTab === BOTTOM_TABS.HOME ? styles.textBold : styles.textSupporting,
                                styles.bottomTabBarLabel,
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
                    style={styles.bottomTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.MoneySearch}
                            fill={selectedTab === BOTTOM_TABS.SEARCH ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === BOTTOM_TABS.SEARCH ? styles.textBold : styles.textSupporting,
                            styles.bottomTabBarLabel,
                        ]}
                    >
                        {translate('common.reports')}
                    </Text>
                </PressableWithFeedback>
                <BottomTabAvatar
                    isSelected={selectedTab === BOTTOM_TABS.SETTINGS}
                    onPress={showSettingsPage}
                />
                <View style={[styles.flex1, styles.bottomTabBarItem]}>
                    <BottomTabBarFloatingActionButton isTooltipAllowed={isTooltipAllowed} />
                </View>
            </View>
        </>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default memo(BottomTabBar);
