import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

type SearchLoadingSkeletonProps = {
    containerStyle?: StyleProp<ViewStyle>;
};

function SearchLoadingSkeleton({containerStyle}: SearchLoadingSkeletonProps) {
    return (
        // Absolutely filled so it never shares the parent's column layout with the incoming results, which would
        // halve both heights for a frame.
        <View
            style={StyleSheet.absoluteFill}
            onLayout={() => {
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
                endNavigateToReportsFirstPaint(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.COLD);
            }}
        >
            <SearchRowSkeleton
                shouldAnimate
                containerStyle={containerStyle}
            />
        </View>
    );
}

export default SearchLoadingSkeleton;
