import React, {memo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchQueryString} from '@components/Search/types';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList, RootStackParamList, State} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SearchUtils from '@libs/SearchUtils';
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
    const queryJSON = SearchUtils.buildSearchQueryJSON(query);
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

    return SearchUtils.buildSearchQueryString(queryJSON);
}

function BottomTabBar({selectedTab}: BottomTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();
    const reports = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const reportActions = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const transactionViolations = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(getChatTabBrickRoad(activeWorkspaceID));

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(activeWorkspaceID));
    }, [activeWorkspaceID, transactionViolations, reports, reportActions]);

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

            const defaultCannedQuery = SearchUtils.buildCannedSearchQuery();
            // when navigating to search we might have an activePolicyID set from workspace switcher
            const query = activeWorkspaceID ? `${defaultCannedQuery} ${CONST.SEARCH.SYNTAX_ROOT_KEYS.POLICY_ID}:${activeWorkspaceID}` : defaultCannedQuery;
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));
        });
    }, [activeWorkspaceID, selectedTab]);

    return (
        <>
            <DebugTabView
                selectedTab={selectedTab}
                chatTabBrickRoad={chatTabBrickRoad}
                activeWorkspaceID={activeWorkspaceID}
            />
            <View style={styles.bottomTabBarContainer}>
                <Tooltip text={translate('common.inbox')}>
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
                            {chatTabBrickRoad && (
                                <View style={styles.bottomTabStatusIndicator(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger)} />
                            )}
                        </View>
                    </PressableWithFeedback>
                </Tooltip>
                <Tooltip text={translate('common.search')}>
                    <PressableWithFeedback
                        onPress={navigateToSearch}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.search')}
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
                    </PressableWithFeedback>
                </Tooltip>
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
