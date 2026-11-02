import {heightTransitionStyle} from '@components/Navigation/SearchSidebarCollapseStore';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/** How long the marker takes to travel between rows, when the current search changes to another in the group. */
const MARKER_TRAVEL_DURATION_MS = 150;

/** Vertical inset that centres the marker in a row. */
const MARKER_TOP_OFFSET = (variables.flatNavigationBarItemHeight - variables.flatNavigationBarSubItemMarkerHeight) / 2;

type FlatNavSubItemListProps = {
    /** Row the marker rests on, or -1 when none of the rows is the current search */
    selectedIndex: number;

    /** Whether the rows are showing. A collapsed bar has no room for them, so the list closes rather than unmounting. */
    isExpanded?: boolean;

    /** The group's sub-rows */
    children: React.ReactNode;
};

/**
 * Wraps a group's sub-rows and owns the single marker that marks the current one along their shared rule.
 */
function FlatNavSubItemList({selectedIndex, isExpanded = true, children}: FlatNavSubItemListProps) {
    const styles = useThemeStyles();

    const hasTarget = selectedIndex >= 0;
    const offset = useSharedValue(Math.max(selectedIndex, 0) * variables.flatNavigationBarItemHeight);
    const opacity = useSharedValue(hasTarget ? 1 : 0);

    useEffect(() => {
        if (!hasTarget) {
            opacity.set(withTiming(0, {duration: MARKER_TRAVEL_DURATION_MS}));
            return;
        }

        // Jump rather than slide when the marker is appearing, so it does not travel from a row it was never on.
        if (opacity.get() === 0) {
            offset.set(selectedIndex * variables.flatNavigationBarItemHeight);
        } else {
            offset.set(withTiming(selectedIndex * variables.flatNavigationBarItemHeight, {duration: MARKER_TRAVEL_DURATION_MS, easing: Easing.inOut(Easing.ease)}));
        }
        opacity.set(withTiming(1, {duration: MARKER_TRAVEL_DURATION_MS}));
    }, [hasTarget, selectedIndex, offset, opacity]);

    const markerStyle = useAnimatedStyle(() => ({opacity: opacity.get(), transform: [{translateY: offset.get()}]}));

    // Every sub-row is the same fixed height, so the open height is known without measuring and the list can
    // animate from the first frame it is asked to open.
    const expandedHeight = React.Children.count(children) * variables.flatNavigationBarItemHeight;

    return (
        <View style={[styles.pRelative, styles.overflowHidden, heightTransitionStyle, {height: isExpanded ? expandedHeight : 0}]}>
            {children}
            <Animated.View
                style={[styles.flatNavigationBarSubItemMarker, {top: MARKER_TOP_OFFSET}, markerStyle]}
                pointerEvents="none"
            />
        </View>
    );
}

export default FlatNavSubItemList;
