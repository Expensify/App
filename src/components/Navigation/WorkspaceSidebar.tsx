import {useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import WorkspaceInitialPage from '@pages/workspace/WorkspaceInitialPage';
import variables from '@styles/variables';
import type SCREENS from '@src/SCREENS';
import {collapseProgress, endPeek, peekProgress, startPeek} from './SidebarCollapseStore';

const SIDEBAR_WIDTH = variables.sideBarWithLHBWidth;
const COLLAPSED_WIDTH = variables.searchSidebarCollapsedWidth;

type WorkspaceSidebarRoute = RouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

type WorkspaceSidebarProps = {
    /** Synthetic route giving WorkspaceInitialPage the policyID/backTo it needs. */
    route: WorkspaceSidebarRoute;
};

/**
 * Wide-layout Workspace sidebar with collapse + hover-peek.
 *
 * Mirrors `SettingsSidebar`: rendered as a sibling of the SplitNavigator so it doesn't
 * fight React Navigation's static cardStyle. The outer Animated.View is a "layout spacer"
 * occupying the flex row alongside the navigator — its animated `width` (280 ↔ 76) shifts
 * the central content. The inner Animated.View is the visible overlay (absolutely
 * positioned), whose width can exceed the spacer during peek to overlay the content area.
 *
 * The toggle button itself lives inside `WorkspaceInitialPage`'s header (so it inherits
 * the bar's vertical centering) and slides horizontally via reanimated to land at the
 * collapsed sidebar's center.
 *
 * `WorkspaceInitialPage` is decorated with `withPolicyAndFullscreenLoading`, which reads
 * `route.params.policyID`. The synthetic route prop comes from `WorkspaceSplitNavigator`,
 * which flattens its own nested `route.params` shape into the `{policyID, backTo}` shape
 * the page expects.
 */
function WorkspaceSidebar({route}: WorkspaceSidebarProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // `WorkspaceInitialPage`'s wrapped Props type requires both `route` and `navigation`
    // (from PlatformStackScreenProps). The page itself never reads `navigation` — it uses
    // the imported `Navigation` util — but we still need to satisfy the prop signature.
    const navigation = useNavigation();

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
                        <WorkspaceInitialPage
                            route={route}
                            navigation={navigation as unknown as PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>['navigation']}
                        />
                    </View>
                </Animated.View>
            </Hoverable>
        </Animated.View>
    );
}

export default WorkspaceSidebar;
