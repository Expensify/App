import {useNavigation} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {NativeModules, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchQueryString} from '@components/Search/types';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@libs/actions/Session';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList, RootStackParamList, State} from '@libs/Navigation/types';
import {isCentralPaneName} from '@libs/NavigationUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SearchUtils from '@libs/SearchUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import navigationRef from '@navigation/navigationRef';
import BottomTabAvatar from '@pages/home/sidebar/BottomTabAvatar';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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
    const navigation = useNavigation();
    const {activeWorkspaceID} = useActiveWorkspace();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const transactionViolations = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(getChatTabBrickRoad(activeWorkspaceID));

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(activeWorkspaceID));
    }, [activeWorkspaceID, transactionViolations]);

    useEffect(() => {
        const navigationState = navigation.getState() as State<RootStackParamList> | undefined;
        const routes = navigationState?.routes;
        const currentRoute = routes?.[navigationState?.index ?? 0];
        // When we are redirected to the Settings tab from the OldDot, we don't want to call the Welcome.show() method.
        // To prevent this, the value of the bottomTabRoute?.name is checked here
        if (!!(currentRoute && currentRoute.name !== NAVIGATORS.BOTTOM_TAB_NAVIGATOR && !isCentralPaneName(currentRoute.name)) || Session.isAnonymousUser()) {
            return;
        }

        // HybridApp has own entry point when we decide whether to display onboarding and explanation modal.
        if (NativeModules.HybridAppModule) {
            return;
        }

        Welcome.isOnboardingFlowCompleted({
            onNotCompleted: () => OnboardingFlow.startOnboardingFlow(),
        });

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingApp]);

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
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default memo(BottomTabBar);
