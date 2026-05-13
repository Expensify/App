import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import InitialSettingsPage from '@pages/settings/InitialSettingsPage';
import variables from '@styles/variables';
import {collapseProgress, endPeek, peekProgress, startPeek} from './SidebarCollapseStore';

const SIDEBAR_WIDTH = variables.sideBarWithLHBWidth;
const COLLAPSED_WIDTH = variables.searchSidebarCollapsedWidth;

/**
 * Wide-layout Settings/Account sidebar with collapse + hover-peek.
 *
 * Rendered as a sibling of the SplitNavigator (outside it), so it doesn't fight React
 * Navigation's static cardStyle. The outer Animated.View is a "layout spacer" that
 * occupies the flex row alongside the navigator — its animated `width` (280 ↔ 76) is
 * what shifts the central content. The inner Animated.View is the visible overlay
 * (absolutely positioned), whose width can exceed the spacer during peek to overlay
 * the content area.
 *
 * The toggle button itself lives inside `InitialSettingsPage`'s TopBar (so it inherits
 * the bar's vertical centering) and slides horizontally via reanimated to land at the
 * collapsed sidebar's center.
 *
 * On narrow layouts this returns null; the navigator's sidebar screen renders
 * `InitialSettingsPage` normally there.
 */
function SettingsSidebar() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const layoutSpacerStyle = useAnimatedStyle(() => ({
        width: SIDEBAR_WIDTH + (COLLAPSED_WIDTH - SIDEBAR_WIDTH) * collapseProgress.get(),
    }));

    const overlayAnimatedStyle = useAnimatedStyle(() => {
        const cp = collapseProgress.get();
        const pp = peekProgress.get();
        const visualExpansion = 1 - cp * (1 - pp);
        return {
            width: COLLAPSED_WIDTH + (SIDEBAR_WIDTH - COLLAPSED_WIDTH) * visualExpansion,
        };
    });

    if (shouldUseNarrowLayout) {
        return null;
    }

    return (
        // position: 'relative' so the absolute-positioned overlay below anchors to this
        // spacer (its bounds = the visible-sidebar slot). zIndex: 1 so the peek overlay
        // renders above the navigator content (which is a later flex-row sibling) when
        // it grows past the spacer's right edge.
        <Animated.View style={[{height: '100%', overflow: 'visible', position: 'relative', zIndex: 1}, layoutSpacerStyle]}>
            <Hoverable
                onHoverIn={startPeek}
                onHoverOut={endPeek}
            >
                <Animated.View
                    style={[
                        styles.searchSidebar,
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            zIndex: 1,
                        },
                        overlayAnimatedStyle,
                    ]}
                >
                    <View style={{width: SIDEBAR_WIDTH, height: '100%'}}>
                        <InitialSettingsPage />
                    </View>
                </Animated.View>
            </Hoverable>
        </Animated.View>
    );
}

export default SettingsSidebar;
