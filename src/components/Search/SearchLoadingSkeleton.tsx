import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useThemeStyles from '@hooks/useThemeStyles';
import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

type SearchLoadingSkeletonProps = {
    containerStyle?: StyleProp<ViewStyle>;
};

function SearchLoadingSkeleton({containerStyle}: SearchLoadingSkeletonProps) {
    const styles = useThemeStyles();

    return (
        <Animated.View
            entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
            exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
            style={[styles.flex1]}
            onLayout={() => {
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
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
