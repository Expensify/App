import {useNavigation} from '@react-navigation/native';
import React, {memo, useCallback, useEffect} from 'react';
import {NativeModules, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@libs/actions/Session';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import linkingConfig from '@libs/Navigation/linkingConfig';
import getAdaptedStateFromPath from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {isCentralPaneName} from '@libs/NavigationUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import BottomTabAvatar from '@pages/home/sidebar/BottomTabAvatar';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type BottomTabBarProps = {
    selectedTab: string | undefined;
};

function BottomTabBar({selectedTab}: BottomTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const {activeWorkspaceID} = useActiveWorkspace();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

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
            onNotCompleted: () => {
                const {adaptedState} = getAdaptedStateFromPath(ROUTES.ONBOARDING_ROOT, linkingConfig.config);
                navigationRef.resetRoot(adaptedState);
            },
        });

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingApp]);

    const chatTabBrickRoad = getChatTabBrickRoad(activeWorkspaceID);
    const navigateToChats = useCallback(() => {
        if (selectedTab === SCREENS.HOME) {
            return;
        }
        const route = activeWorkspaceID ? (`/w/${activeWorkspaceID}/${ROUTES.HOME}` as Route) : ROUTES.HOME;
        Navigation.navigate(route);
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
                    onPress={() => {
                        if (selectedTab === SCREENS.SEARCH.BOTTOM_TAB) {
                            return;
                        }
                        interceptAnonymousUser(() => Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute(CONST.SEARCH.TAB.ALL)));
                    }}
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
