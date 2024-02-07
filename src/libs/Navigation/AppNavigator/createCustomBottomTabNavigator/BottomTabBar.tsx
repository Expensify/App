import {useNavigationState} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import PurposeForUsingExpensifyModal from '@components/PurposeForUsingExpensifyModal';
import Tooltip from '@components/Tooltip';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {RootStackParamList} from '@libs/Navigation/types';
import {checkIfWorkspaceSettingsTabHasRBR, getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function BottomTabBar() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();

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
            <PurposeForUsingExpensifyModal />
        </View>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default BottomTabBar;
