import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type NATIVE_TAB_ICONS from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_ICONS';
import useAndroidTabIcons from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useAndroidTabIcons';

import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

/** An empty badge value makes Material draw its small dot badge instead of a number. */
const STATUS_DOT_BADGE = '';

/** Material's bar sits above the system gesture inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.androidNativeTabBarFloatingButtonsBottom + bottomInset;

function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {getTabBarIcon, accountAvatarIcon, areTabIconsReady} = useAndroidTabIcons();

    // The tint only reaches the labels, since the icons arrive already recolored (react-native-screens patch 003).
    const screenOptions: NativeBottomTabNavigationOptions = {
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSupporting,
        tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontSize: styles.textSmall.fontSize},
        tabBarActiveIndicatorColor: theme.androidTabBarActiveIndicatorBG,
        tabBarLabelVisibilityMode: 'labeled',
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        tabBarStyle: {display: shouldShowNativeTabBar && areTabIconsReady ? 'flex' : 'none', backgroundColor: theme.highlightBG},
    };

    const getTabOptions = (name: keyof typeof NATIVE_TAB_ICONS): NativeBottomTabNavigationOptions => {
        const dotColor = dotColors[name];
        return {
            tabBarLabel: tabLabels[name],
            tabBarIcon: name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR && accountAvatarIcon ? accountAvatarIcon : getTabBarIcon(name),
            ...(dotColor ? {tabBarBadge: STATUS_DOT_BADGE, tabBarBadgeStyle: {backgroundColor: dotColor}} : {tabBarBadge: undefined}),
        };
    };

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};
