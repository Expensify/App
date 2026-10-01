import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/** How long the marker takes to travel between rows. Short enough to feel like a response to the pointer. */
const MARKER_TRAVEL_DURATION_MS = 150;

/** Vertical inset that centres the 12px marker box in a row. */
const MARKER_TOP_OFFSET = (variables.flatNavigationBarItemHeight - 12) / 2;

type FlatNavSubItemHoverContextValue = {
    onSubItemHoverIn: (index: number) => void;
    onSubItemHoverOut: (index: number) => void;
};

const FlatNavSubItemHoverContext = createContext<FlatNavSubItemHoverContextValue | undefined>(undefined);

function useFlatNavSubItemHover() {
    return useContext(FlatNavSubItemHoverContext);
}

type FlatNavSubItemListProps = {
    /** Row the marker rests on, or -1 when none of the rows is the current search */
    selectedIndex: number;

    /** The group's sub-rows */
    children: React.ReactNode;
};

/**
 * Wraps a group's sub-rows and owns the single marker that slides along their shared rule. One marker that moves
 * reads as the rule tracking the pointer; a marker per row would pop in and out instead.
 */
function FlatNavSubItemList({selectedIndex, children}: FlatNavSubItemListProps) {
    const styles = useThemeStyles();
    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

    const targetIndex = hoveredIndex ?? selectedIndex;
    const hasTarget = targetIndex >= 0;

    const offset = useSharedValue(Math.max(targetIndex, 0) * variables.flatNavigationBarItemHeight);
    const opacity = useSharedValue(hasTarget ? 1 : 0);

    useEffect(() => {
        if (!hasTarget) {
            opacity.set(withTiming(0, {duration: MARKER_TRAVEL_DURATION_MS}));
            return;
        }

        // Jump rather than slide when the marker is appearing, so it does not travel from a row it was never on.
        if (opacity.get() === 0) {
            offset.set(targetIndex * variables.flatNavigationBarItemHeight);
        } else {
            offset.set(withTiming(targetIndex * variables.flatNavigationBarItemHeight, {duration: MARKER_TRAVEL_DURATION_MS, easing: Easing.inOut(Easing.ease)}));
        }
        opacity.set(withTiming(1, {duration: MARKER_TRAVEL_DURATION_MS}));
    }, [hasTarget, targetIndex, offset, opacity]);

    const markerStyle = useAnimatedStyle(() => ({opacity: opacity.get(), transform: [{translateY: offset.get()}]}));

    const hoverContextValue = useMemo(
        () => ({
            onSubItemHoverIn: (index: number) => setHoveredIndex(index),
            // Only clear when the row leaving is the one being tracked, so entering the next row wins the race.
            onSubItemHoverOut: (index: number) => setHoveredIndex((current) => (current === index ? undefined : current)),
        }),
        [],
    );

    return (
        <View style={styles.pRelative}>
            <FlatNavSubItemHoverContext.Provider value={hoverContextValue}>{children}</FlatNavSubItemHoverContext.Provider>
            <Animated.View
                style={[styles.flatNavigationBarSubItemMarker, {top: MARKER_TOP_OFFSET}, markerStyle]}
                pointerEvents="none"
            />
        </View>
    );
}

export default FlatNavSubItemList;
export {useFlatNavSubItemHover};
