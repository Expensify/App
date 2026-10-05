import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {NativeTabName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import getTabIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {TabIconLayout} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import useTabAvatarImage from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useTabAvatarImage';

import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

/** An empty badge value makes Material draw its small dot badge instead of a number. */
const STATUS_DOT_BADGE = '';

/** Material's bar sits above the system gesture inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.androidNativeTabBarFloatingButtonsBottom + bottomInset;

/** Material draws each icon in its fixed icon slot, with the label and the status badge of its own. */
const TAB_ICON_LAYOUT: TabIconLayout = {
    glyphSize: variables.iconBottomBar,
    avatarSize: variables.iconBottomBar,
    dotRadius: 0,
    labelGap: 0,
    labelFontSize: 0,
};

function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const avatar = useTabAvatarImage();

    // The tint only reaches the labels, since the icons arrive already recolored (react-native-screens patch 003).
    const screenOptions: NativeBottomTabNavigationOptions = {
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSupporting,
        tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontSize: styles.textSmall.fontSize},
        tabBarActiveIndicatorColor: theme.androidTabBarActiveIndicatorBG,
        tabBarLabelVisibilityMode: 'labeled',
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.appBG},
    };

    const getTabOptions = (name: NativeTabName): NativeBottomTabNavigationOptions => {
        // The active indicator pill marks the selected tab, so the avatar is the same image in both selection states.
        const tabAvatar = name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR ? avatar : undefined;
        const inactiveIcon = getTabIcon(TAB_ICON_LAYOUT, {name, color: theme.icon, avatar: tabAvatar});
        const activeIcon = getTabIcon(TAB_ICON_LAYOUT, {name, color: theme.iconMenu, avatar: tabAvatar});
        const dotColor = dotColors[name];
        return {
            tabBarLabel: tabLabels[name],
            // A function, because React Navigation derives the selected icon only from a function.
            tabBarIcon: inactiveIcon && activeIcon ? ({focused}) => (focused ? activeIcon : inactiveIcon) : undefined,
            ...(dotColor ? {tabBarBadge: STATUS_DOT_BADGE, tabBarBadgeStyle: {backgroundColor: dotColor}} : {tabBarBadge: undefined}),
        };
    };

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};
