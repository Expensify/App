import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseSidebarScreen from '@pages/inbox/sidebar/BaseSidebarScreen';
import variables from '@styles/variables';
import {collapseProgress, endPeek, peekProgress, startPeek} from './SidebarCollapseStore';

const SIDEBAR_WIDTH = variables.inboxSidebarWidth;
const COLLAPSED_WIDTH = variables.searchSidebarCollapsedWidth;

/**
 * Wide-layout Inbox / LHN sidebar with collapse + hover-peek.
 *
 * Mirrors `SettingsSidebar` / `WorkspaceSidebar`: rendered as a sibling of
 * `ReportsSplitNavigator`'s `Split.Navigator` so it doesn't fight React Navigation's
 * static cardStyle. The outer Animated.View is a "layout spacer" occupying the flex row
 * alongside the navigator — its animated `width` (320 ↔ 76) shifts the central report
 * content. The inner Animated.View is the visible overlay (absolutely positioned), whose
 * width can exceed the spacer during peek to overlay the content area.
 *
 * On narrow layouts this returns null; the navigator's sidebar screen renders
 * `BaseSidebarScreen` normally there.
 */
function InboxSidebar() {
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
                        <BaseSidebarScreen />
                    </View>
                </Animated.View>
            </Hoverable>
        </Animated.View>
    );
}

export default InboxSidebar;
