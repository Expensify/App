import {useNavigationState} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import Navigation from '@libs/Navigation/Navigation';
import {RootStackParamList} from '@libs/Navigation/types';
import BottomTabBarFloatingActionButton from '@pages/home/sidebar/BottomTabBarFloatingActionButton';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function BottomTabBar() {
    const styles = useThemeStyles();

    // Parent navigator of the bottom tab bar is the root navigator.
    const currentTabName = useNavigationState<RootStackParamList, string>((state) => getTopmostBottomTabRoute(state).name);

    return (
        <View style={styles.bottomTabBarContainer}>
            <PressableWithFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.HOME);
                }}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel="Chats"
            >
                <Icon
                    src={Expensicons.ChatBubble}
                    fill={currentTabName === SCREENS.HOME ? 'white' : undefined}
                />
            </PressableWithFeedback>
            <BottomTabBarFloatingActionButton />
            <PressableWithFeedback
                onPress={() => {
                    Navigation.navigate(ROUTES.ALL_SETTINGS);
                }}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel="Settings"
            >
                <Icon
                    src={Expensicons.Gear}
                    fill={currentTabName === SCREENS.ALL_SETTINGS || currentTabName === SCREENS.WORKSPACE.INITIAL ? 'white' : undefined}
                />
            </PressableWithFeedback>
        </View>
    );
}

BottomTabBar.displayName = 'BottomTabBar';

export default BottomTabBar;
