import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import type {NativeTabName} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/NATIVE_TAB_GLYPHS';
import getTabBarIcon from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';
import type {TabIconLayout} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabIconRasterizer';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';

import {Platform} from 'react-native';

import type NativeTabBarOptionsParams from './types';

/** First iOS version with the liquid glass tab bar. */
const LIQUID_GLASS_IOS_VERSION = 26;

/** UITabBar sits above the home indicator inset, so the floating buttons clear both. */
const getFloatingButtonsBottom = (bottomInset: number) => variables.iosNativeTabBarFloatingButtonsBottom + bottomInset;

const TAB_ICON_LAYOUT: TabIconLayout = {
    glyphSize: variables.iconNativeTabBarIOS,
    iconBoxSize: variables.nativeTabIconBoxIOS,
    direction: 'stacked',
};

/** A phone in landscape gives the bar too little height for a stacked tab, so UIKit lays its own tabs out this way. */
const LANDSCAPE_TAB_ICON_LAYOUT: TabIconLayout = {
    glyphSize: variables.iconNativeTabBarIOSLandscape,
    iconBoxSize: variables.nativeTabIconBoxIOSLandscape,
    direction: 'inline',
};

/**
 * iOS 26 never applies the inactive icon color or the title color from `UITabBarItemAppearance`, and paints every badge
 * in the color of the selected tab, so each icon is drawn with its own colors, its status dot and its label. Both
 * selection states are images, because RNScreens rejects a tab whose icon and selectedIcon differ in type.
 */
function useNativeTabBarOptions({shouldShowNativeTabBar, dotColors, tabLabels}: NativeTabBarOptionsParams) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();
    // Only the iOS 26 bar ignores the title colors, so only it gets the labels drawn into the icons. The classic bar of
    // iOS 18 and below squeezes every tab image into a small slot in landscape, which would shrink a drawn label.
    const shouldDrawLabels = Number.parseInt(String(Platform.Version), 10) >= LIQUID_GLASS_IOS_VERSION;
    const tabIconLayout = isInLandscapeMode ? LANDSCAPE_TAB_ICON_LAYOUT : TAB_ICON_LAYOUT;
    const barItemCount = Object.keys(tabLabels).length;
    const itemWidth = (windowWidth - 2 * variables.iosNativeTabBarHorizontalInset) / barItemCount - variables.iosNativeTabBarLabelInset;
    // In landscape the label shares the item's width with the glyph's box beside it.
    const labelMaxWidth = isInLandscapeMode ? itemWidth - tabIconLayout.iconBoxSize - variables.nativeTabIconLabelGap : itemWidth;

    const screenOptions: NativeBottomTabNavigationOptions = {
        ...(shouldDrawLabels
            ? {
                  // The labels are drawn into the icons.
                  tabBarLabel: '',
                  tabBarActiveTintColor: theme.iconMenu,
                  tabBarInactiveTintColor: theme.icon,
              }
            : {
                  // The tint only reaches the labels, since the icons arrive already colored.
                  tabBarActiveTintColor: theme.text,
                  tabBarInactiveTintColor: theme.textSupporting,
                  tabBarLabelStyle: {fontFamily: styles.textSmall.fontFamily, fontWeight: styles.textSmall.fontWeight, fontSize: styles.textSmall.fontSize},
              }),
        // Every tab shares one style, so the bar reads the current visibility in the same render that changed it.
        // The background only lands on iOS 18 and below; iOS 26 keeps its own glass material.
        tabBarStyle: {display: shouldShowNativeTabBar ? 'flex' : 'none', backgroundColor: theme.appBG},
        tabBarControllerMode: 'tabBar',
        // The bar stays put while the content scrolls, instead of collapsing the way iOS 26 does by default.
        tabBarMinimizeBehavior: 'none',
    };

    const getTabOptions = (name: NativeTabName): NativeBottomTabNavigationOptions => ({
        ...(!shouldDrawLabels && {tabBarLabel: tabLabels[name]}),
        tabBarIcon: getTabBarIcon(tabIconLayout, (isSelected) => ({
            name,
            color: isSelected ? theme.iconMenu : theme.icon,
            dotColor: dotColors[name],
            label: shouldDrawLabels
                ? {
                      text: tabLabels[name],
                      color: isSelected ? theme.text : theme.textSupporting,
                      isBold: isSelected,
                      fontSize: fontScale.micro,
                      gap: variables.nativeTabIconLabelGap,
                      maxWidth: labelMaxWidth,
                  }
                : undefined,
        })),
        // On iOS 26 the label is drawn into the icon, so VoiceOver reads it from here.
        tabBarAccessibilityLabel: tabLabels[name],
    });

    return {screenOptions, getTabOptions};
}

export default useNativeTabBarOptions;
export {getFloatingButtonsBottom};
