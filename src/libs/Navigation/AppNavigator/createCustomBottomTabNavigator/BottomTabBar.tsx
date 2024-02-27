import {useNavigation, useNavigationState} from '@react-navigation/native';
import React, {useEffect} from 'react';
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
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {checkIfWorkspaceSettingsTabHasRBR, getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const {activeWorkspaceID} = useActiveWorkspace();

    const navigation = useNavigation();

    useEffect(() => {
        const navigationState = navigation.getState() as State<RootStackParamList> | undefined;
        const routes = navigationState?.routes;
        const currentRoute = routes?.[navigationState?.index ?? 0];
        const bottomTabRoute = getTopmostBottomTabRoute(navigationState);
        if (
            // When we are redirected to the Settings tab from the OldDot, we don't want to call the Welcome.show() method.
            // To prevent this, the value of the bottomTabRoute?.name is checked here
            bottomTabRoute?.name === SCREENS.WORKSPACE.INITIAL ||
            (currentRoute && currentRoute.name !== NAVIGATORS.BOTTOM_TAB_NAVIGATOR && currentRoute.name !== NAVIGATORS.CENTRAL_PANE_NAVIGATOR)
        ) {
            return;
        }

        Welcome.show(routes, () => Navigation.navigate(ROUTES.ONBOARD));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingApp]);

    // Parent navigator of the bottom tab bar is the root navigator.
    const currentTabName = useNavigationState<RootStackParamList, string | undefined>((state) => {
        const topmostBottomTabRoute = getTopmostBottomTabRoute(state);
        return topmostBottomTabRoute?.name ?? SCREENS.HOME;
    });

    const shouldShowWorkspaceRedBrickRoad = checkIfWorkspaceSettingsTabHasRBR(activeWorkspaceID) && currentTabName === SCREENS.HOME;

    const chatTabBrickRoad = currentTabName !== SCREENS.HOME ? getChatTabBrickRoad(activeWorkspaceID) : undefined;

    return (
        <View style={styles.bottomTabBarContainer}>
            <Tooltip text={translate('common.chats')}>
                <PressableWithFeedback
                    onPress={() => {
                        Navigation.navigate(ROUTES.HOME);
                    }}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.chats')}
                    wrapperStyle={styles.flexGrow1}
                    style={styles.bottomTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.ChatBubble}
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
            <BottomTabBarFloatingActionButton />
            <Tooltip text={translate('common.settings')}>
                <PressableWithFeedback
                    onPress={() =>
                        interceptAnonymousUser(() =>
                            activeWorkspaceID ? Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(activeWorkspaceID)) : Navigation.navigate(ROUTES.ALL_SETTINGS),
                        )
                    }
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.settings')}
                    wrapperStyle={styles.flexGrow1}
                    style={styles.bottomTabBarItem}
                >
                    <View>
                        <Icon
                            src={Expensicons.Wrench}
                            fill={currentTabName === SCREENS.ALL_SETTINGS || currentTabName === SCREENS.WORKSPACE.INITIAL ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                        {shouldShowWorkspaceRedBrickRoad && <View style={styles.bottomTabStatusIndicator(theme.danger)} />}
                    </View>
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default withOnyx<PurposeForUsingExpensifyModalProps, PurposeForUsingExpensifyModalOnyxProps>({
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(BottomTabBar);
