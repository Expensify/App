import React, {memo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import type {SearchQueryString} from '@components/Search/types';
import Text from '@components/Text';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useBottomTabIsFocused from '@hooks/useBottomTabIsFocused';
import useCurrentReportID from '@hooks/useCurrentReportID';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList, RootStackParamList, State} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import navigationRef from '@navigation/navigationRef';
import BottomTabAvatar from '@pages/home/sidebar/BottomTabAvatar';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import DebugTabView from './DebugTabView';

type BottomTabBarProps = {
    selectedTab: string | undefined;
};

/**
 * Returns SearchQueryString that has policyID correctly set.
 *
 * When we're coming back to Search Screen we might have pre-existing policyID inside SearchQuery.
 * There are 2 cases when we might want to remove this `policyID`:
 *  - if Policy was removed in another screen
 *  - if WorkspaceSwitcher was used to globally unset a policyID
 * Otherwise policyID will be inserted into query
 */
function handleQueryWithPolicyID(query: SearchQueryString, activePolicyID?: string): SearchQueryString {
    const queryJSON = SearchQueryUtils.buildSearchQueryJSON(query);
    if (!queryJSON) {
        return query;
    }

    const policyID = activePolicyID ?? queryJSON.policyID;
    const policy = PolicyUtils.getPolicy(policyID);

    // In case policy is missing or there is no policy currently selected via WorkspaceSwitcher we remove it
    if (!activePolicyID || !policy) {
        delete queryJSON.policyID;
    } else {
        queryJSON.policyID = policyID;
    }

    return SearchQueryUtils.buildSearchQueryString(queryJSON);
}

function BottomTabBar({selectedTab}: BottomTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {currentReportID} = useCurrentReportID() ?? {currentReportID: null};
    const [user] = useOnyx(ONYXKEYS.USER);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(() =>
        getChatTabBrickRoad(activeWorkspaceID, currentReportID, reports, betas, policies, priorityMode, transactionViolations),
    );
    const isFocused = useBottomTabIsFocused();
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.BOTTOM_NAV_INBOX_TOOLTIP,
        selectedTab !== SCREENS.HOME && isFocused,
    );
    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(activeWorkspaceID, currentReportID, reports, betas, policies, priorityMode, transactionViolations));
        // We need to get a new brick road state when report actions are updated, otherwise we'll be showing an outdated brick road.
        // That's why reportActions is added as a dependency here
    }, [activeWorkspaceID, transactionViolations, reports, reportActions, betas, policies, priorityMode, currentReportID]);

    const navigateToChats = useCallback(() => {
        if (selectedTab === SCREENS.HOME) {
            return;
        }
        const route = activeWorkspaceID ? (`/w/${activeWorkspaceID}/${ROUTES.HOME}` as Route) : ROUTES.HOME;
        Navigation.navigate(route);
    }, [activeWorkspaceID, selectedTab]);

    const navigateToSearch = useCallback(() => {
        if (selectedTab === SCREENS.SEARCH.BOTTOM_TAB) {
            return;
        }
        interceptAnonymousUser(() => {
            const rootState = navigationRef.getRootState() as State<RootStackParamList>;
            const lastSearchRoute = rootState.routes.filter((route) => route.name === SCREENS.SEARCH.CENTRAL_PANE).at(-1);

            if (lastSearchRoute) {
                const {q, ...rest} = lastSearchRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
                const cleanedQuery = handleQueryWithPolicyID(q, activeWorkspaceID);

                Navigation.navigate(
                    ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                        query: cleanedQuery,
                        ...rest,
                    }),
                );
                return;
            }

            const defaultCannedQuery = SearchQueryUtils.buildCannedSearchQuery();
            // when navigating to search we might have an activePolicyID set from workspace switcher
            const query = activeWorkspaceID ? `${defaultCannedQuery} ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${activeWorkspaceID}` : defaultCannedQuery;
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));
        });
    }, [activeWorkspaceID, selectedTab]);

    return (
        <>
            {!!user?.isDebugModeEnabled && (
                <DebugTabView
                    selectedTab={selectedTab}
                    chatTabBrickRoad={chatTabBrickRoad}
                    activeWorkspaceID={activeWorkspaceID}
                    reports={reports}
                    currentReportID={currentReportID}
                    betas={betas}
                    policies={policies}
                    transactionViolations={transactionViolations}
                    priorityMode={priorityMode}
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
                    shouldUseOverlay
                    renderTooltipContent={renderProductTrainingTooltip}
                    wrapperStyle={styles.productTrainingTooltipWrapper}
                    onHideTooltip={hideProductTrainingTooltip}
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
                                fill={selectedTab === SCREENS.HOME ? theme.iconMenu : theme.icon}
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
                                selectedTab === SCREENS.HOME ? styles.textBold : styles.textSupporting,
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
                            fill={selectedTab === SCREENS.SEARCH.BOTTOM_TAB ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === SCREENS.SEARCH.BOTTOM_TAB ? styles.textBold : styles.textSupporting,
                            styles.bottomTabBarLabel,
                        ]}
                    >
                        {translate('common.reports')}
                    </Text>
                </PressableWithFeedback>
                <BottomTabAvatar isSelected={selectedTab === SCREENS.SETTINGS.ROOT} />
                <View style={[styles.flex1, styles.bottomTabBarItem]}>
                    <BottomTabBarFloatingActionButton />
                </View>
            </View>
        </>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default memo(BottomTabBar);
