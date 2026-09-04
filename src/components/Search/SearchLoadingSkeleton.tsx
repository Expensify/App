import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import useThemeStyles from '@hooks/useThemeStyles';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {FadeOut} from 'react-native-reanimated';

type SearchLoadingSkeletonProps = {
    containerStyle?: StyleProp<ViewStyle>;
};

function SearchLoadingSkeleton({containerStyle}: SearchLoadingSkeletonProps) {
    const styles = useThemeStyles();

    return (
        // The skeleton is absolutely filled so that its exit fade overlays the incoming results instead of
        // sharing the parent's column layout with them, which would halve both heights for the fade duration.
        <Animated.View
            exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
            style={[styles.flex1, StyleSheet.absoluteFill]}
            onLayout={() => {
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
                endNavigateToReportsFirstPaint(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.COLD);
            }}
        >
            <SearchRowSkeleton
                shouldAnimate
                containerStyle={containerStyle}
            />
        </Animated.View>
    );
}

export default SearchLoadingSkeleton;
