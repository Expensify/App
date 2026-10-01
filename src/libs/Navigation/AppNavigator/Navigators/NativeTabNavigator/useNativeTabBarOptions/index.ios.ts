import useTheme from '@hooks/useTheme';

import type NATIVE_TAB_ICONS from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_ICONS';
import useIOSTabIcons from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useIOSTabIcons';

import variables from '@styles/variables';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

const getFloatingButtonsBottom = () => variables.iosNativeTabBarFloatingButtonsBottom;

function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const {getTabBarIcon, accountAvatarIcon, areTabIconsReady} = useIOSTabIcons(dotColors, tabLabels);

    const screenOptions: NativeBottomTabNavigationOptions = {
        headerShown: false,
        // The labels are drawn into the icons.
        tabBarLabel: '',
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // The background only lands on iOS 18 and below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar && areTabIconsReady ? 'flex' : 'none', backgroundColor: theme.appBG},
        tabBarControllerMode: 'tabBar',
        // The bar stays put while the content scrolls, instead of collapsing the way iOS 26 does by default.
        tabBarMinimizeBehavior: 'none',
    };

    const getTabOptions = (name: keyof typeof NATIVE_TAB_ICONS): NativeBottomTabNavigationOptions => ({
        tabBarIcon: name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR && accountAvatarIcon ? accountAvatarIcon : getTabBarIcon(name),
    });

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};
