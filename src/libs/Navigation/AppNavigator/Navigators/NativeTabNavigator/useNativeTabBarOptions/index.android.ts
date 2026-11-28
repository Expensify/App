import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNativeTabIconGlyphs from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/getNativeTabIconGlyphs';
import type {NativeTabRouteName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/nativeTabItemUtils';
import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {TabIconLayout} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {MoreMenuItemID} from '@libs/Navigation/MoreMenu/MORE_MENU';

import variables from '@styles/variables';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

/** Material's bar sits above the system gesture inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.androidNativeTabBarFloatingButtonsBottom + bottomInset;

/** Distance from the bottom of the window to the top edge of the bar. */
const getTabBarTop = (bottomInset: number) => variables.androidNativeTabBarHeight + bottomInset;

/**
 * Material draws each icon in its icon slot, with a label of its own. The status dot is drawn into the icon rather than
 * as a Material badge, because RNScreens paints every badge in the badge color of the selected tab. The More chevron
 * goes at the right edge of the selected pill, clear of the glyph and its dot, and RNScreens widens the slot to the icon.
 */
const TAB_ICON_LAYOUT: TabIconLayout = {
    glyphSize: variables.iconBottomBar,
    iconBoxSize: variables.iconBottomBar,
    direction: 'stacked',
    accessoryPlacement: 'pillEdge',
    pillWidth: variables.androidNativeTabBarActiveIndicatorWidth,
};

function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const styles = useThemeStyles();

    // The tint only reaches the labels, since the icons arrive already recolored (react-native-screens patch 004).
    const screenOptions: NativeBottomTabNavigationOptions = {
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSupporting,
        tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontSize: styles.textSmall.fontSize},
        tabBarActiveIndicatorColor: theme.androidTabBarActiveIndicatorBG,
        tabBarLabelVisibilityMode: 'labeled',
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.appBG},
    };

    const getTabOptions = (name: NativeTabRouteName, moreTabItemID?: MoreMenuItemID): NativeBottomTabNavigationOptions => ({
        tabBarLabel: tabLabels[name],
        tabBarIcon: getTabBarIcon(TAB_ICON_LAYOUT, (isSelected) => {
            const {name: glyphName, accessoryName, reservesAccessory} = getNativeTabIconGlyphs(name, moreTabItemID, isSelected);
            return {
                name: glyphName,
                color: isSelected ? theme.iconMenu : theme.icon,
                dotColor: dotColors[name],
                // The chevron keeps the inactive color in both states, as in the design.
                accessory: accessoryName ? {name: accessoryName, color: theme.icon} : undefined,
                reservesAccessory,
            };
        }),
    });

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom, getTabBarTop};
