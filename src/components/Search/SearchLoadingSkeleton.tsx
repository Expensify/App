import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

type SearchLoadingSkeletonProps = {
    /** Whether the query still has no results. Turning false fades this out over the results behind it. */
    isLoading: boolean;

    containerStyle?: StyleProp<ViewStyle>;
};

function SearchLoadingSkeleton({isLoading, containerStyle}: SearchLoadingSkeletonProps) {
    const opacity = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));

    useEffect(() => {
        if (isLoading) {
            opacity.set(1);
            return;
        }

        opacity.set(withTiming(0, {duration: CONST.SEARCH.ANIMATION.FADE_DURATION}));
    }, [isLoading, opacity]);

    return (
        // Absolutely filled so it never shares the parent's column layout with the incoming results, which would
        // halve both heights for a frame. Not hit-testable, so the results underneath stay usable as it fades.
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, animatedStyle]}
            onLayout={() => {
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
                endNavigateToReportsFirstPaint(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.COLD);
            }}
        >
            <SearchRowSkeleton
                shouldAnimate={isLoading}
                containerStyle={containerStyle}
            />
        </Animated.View>
    );
}

export default SearchLoadingSkeleton;
