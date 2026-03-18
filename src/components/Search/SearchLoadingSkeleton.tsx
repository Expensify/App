import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useThemeStyles from '@hooks/useThemeStyles';
import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';

type SearchLoadingSkeletonProps = {
    containerStyle?: StyleProp<ViewStyle>;
    reasonAttributes: SkeletonSpanReasonAttributes;
};

function SearchLoadingSkeleton({containerStyle, reasonAttributes}: SearchLoadingSkeletonProps) {
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
                reasonAttributes={reasonAttributes}
            />
        </Animated.View>
    );
}

export default SearchLoadingSkeleton;
