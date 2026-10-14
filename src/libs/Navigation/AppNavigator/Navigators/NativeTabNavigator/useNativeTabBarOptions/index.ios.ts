import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {NativeTabItemKind} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {TabIconLayout} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import type NativeTabBarOptionsParams from './types';

/** UITabBar sits above the home indicator inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.iosNativeTabBarFloatingButtonsBottom + bottomInset;

const TAB_ICON_LAYOUT: TabIconLayout = {
    glyphSize: variables.iconNativeTabBarIOS,
    avatarSize: variables.avatarNativeTabBarIOS,
};

/**
 * iOS 26 never applies the inactive icon color or the title color from `UITabBarItemAppearance`, and paints every badge
 * in the color of the selected tab, so each icon is drawn with its own colors, its status dot and its label. Both
 * selection states are images, because RNScreens rejects a tab whose icon and selectedIcon differ in type.
 */
function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const barItemCount = Object.keys(tabLabels).length;
    // Whole points, so a resize that barely changes the slot reuses the drawn icons.
    const labelMaxWidth = Math.floor((windowWidth - 2 * variables.iosNativeTabBarHorizontalInset) / barItemCount - variables.iosNativeTabBarLabelInset);

    const screenOptions: NativeBottomTabNavigationOptions = {
        // The labels are drawn into the icons.
        tabBarLabel: '',
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // The background only lands on iOS 18 and below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.appBG},
        tabBarControllerMode: 'tabBar',
        // The bar stays put while the content scrolls, instead of collapsing the way iOS 26 does by default.
        tabBarMinimizeBehavior: 'none',
    };

    // Wide layouts use the JS side bar and never show the native one, so its icons are not drawn there.
    const getTabOptions = (name: NativeTabItemKind): NativeBottomTabNavigationOptions =>
        !shouldUseNarrowLayout
            ? {}
            : {
                  tabBarIcon: getTabBarIcon(TAB_ICON_LAYOUT, (isSelected) => ({
                      name,
                      color: isSelected ? theme.iconMenu : theme.icon,
                      dotColor: dotColors[name],
                      label: {
                          text: tabLabels[name],
                          color: isSelected ? theme.text : theme.textSupporting,
                          isBold: isSelected,
                          fontSize: fontScale.micro,
                          gap: variables.nativeTabIconLabelGap,
                          maxWidth: labelMaxWidth,
                      },
                  })),
                  // The label is drawn into the icon, so VoiceOver reads it from here.
                  tabBarAccessibilityLabel: tabLabels[name],
              };

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};
