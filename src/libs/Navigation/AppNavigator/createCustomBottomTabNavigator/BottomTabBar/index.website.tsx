import {useNavigation, useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import Navigation from '@libs/Navigation/Navigation';
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

type PurposeForUsingExpensifyModalOnyxProps = {
    isLoadingApp: OnyxEntry<boolean>;
};
type PurposeForUsingExpensifyModalProps = PurposeForUsingExpensifyModalOnyxProps;

function BottomTabBar({isLoadingApp = false}: PurposeForUsingExpensifyModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const {activeWorkspaceID: contextActiveWorkspaceID} = useActiveWorkspace();
    const activeWorkspaceID = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.ACTIVE_WORKSPACE_ID) ?? contextActiveWorkspaceID;

    useEffect(() => {
        const navigationState = navigation.getState() as State<RootStackParamList> | undefined;
        const routes = navigationState?.routes;
        const currentRoute = routes?.[navigationState?.index ?? 0];
        // When we are redirected to the Settings tab from the OldDot, we don't want to call the Welcome.show() method.
        // To prevent this, the value of the bottomTabRoute?.name is checked here
        if (!!(currentRoute && currentRoute.name !== NAVIGATORS.BOTTOM_TAB_NAVIGATOR && !isCentralPaneName(currentRoute.name)) || Session.isAnonymousUser()) {
            return;
        }

        Welcome.isOnboardingFlowCompleted({onNotCompleted: () => Navigation.navigate(ROUTES.ONBOARDING_ROOT)});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingApp]);

    // Parent navigator of the bottom tab bar is the root navigator.
    const currentTabName = useNavigationState<RootStackParamList, string | undefined>((state) => {
        const topmostCentralPaneRoute = getTopmostCentralPaneRoute(state);

        if (topmostCentralPaneRoute && topmostCentralPaneRoute.name === SCREENS.SEARCH.CENTRAL_PANE) {
            return SCREENS.SEARCH.CENTRAL_PANE;
        }

        const topmostBottomTabRoute = getTopmostBottomTabRoute(state);
        return topmostBottomTabRoute?.name ?? SCREENS.HOME;
    });

    const chatTabBrickRoad = getChatTabBrickRoad(activeWorkspaceID);

    const navigateToChats = useCallback(() => {
        if (currentTabName === SCREENS.HOME) {
            return;
        }
        const route = activeWorkspaceID ? (`/w/${activeWorkspaceID}/home` as Route) : ROUTES.HOME;
        Navigation.navigate(route);
    }, [activeWorkspaceID, currentTabName]);

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
                            fill={currentTabName === SCREENS.HOME ? theme.iconMenu : theme.icon}
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
                        if (currentTabName === SCREENS.SEARCH.BOTTOM_TAB || currentTabName === SCREENS.SEARCH.CENTRAL_PANE) {
                            return;
                        }
                        interceptAnonymousUser(() => Navigation.navigate(ROUTES.SEARCH.getRoute(CONST.SEARCH.TAB.ALL)));
                    }}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.search')}
                    wrapperStyle={styles.flex1}
                    style={styles.bottomTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.MoneySearch}
                            fill={currentTabName === SCREENS.SEARCH.BOTTOM_TAB || currentTabName === SCREENS.SEARCH.CENTRAL_PANE ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                </PressableWithFeedback>
            </Tooltip>
            <BottomTabAvatar isSelected={currentTabName === SCREENS.SETTINGS.ROOT} />
            <View style={[styles.flex1, styles.bottomTabBarItem]}>
                <BottomTabBarFloatingActionButton />
            </View>
        </View>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default withOnyx<PurposeForUsingExpensifyModalProps, PurposeForUsingExpensifyModalOnyxProps>({
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(BottomTabBar);
