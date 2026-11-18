import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import useIsInPreloadedTab from '@hooks/useIsInPreloadedTab';
import useMarkPreloadedTabContentReady from '@hooks/useMarkPreloadedTabContentReady';
import useThemeStyles from '@hooks/useThemeStyles';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

type SearchLoadingSkeletonProps = {
    containerStyle?: StyleProp<ViewStyle>;
};

function endColdNavigateToReportsSpans() {
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: false});
    endNavigateToReportsFirstPaint(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.COLD);
}

function SearchLoadingSkeleton({containerStyle}: SearchLoadingSkeletonProps) {
    const styles = useThemeStyles();
    const isInPreloadedTab = useIsInPreloadedTab();
    const wasLaidOutInPreloadedTabRef = useRef(false);
    const markPreloadedTabContentReady = useMarkPreloadedTabContentReady();

    // A skeleton laid out in a preloaded tab gets no new layout when the tab opens, so the tap's spans end on its first focus.
    useFocusEffect(() => {
        if (!wasLaidOutInPreloadedTabRef.current) {
            return;
        }
        wasLaidOutInPreloadedTabRef.current = false;
        endColdNavigateToReportsSpans();
    });

    return (
        <View
            style={[styles.flex1, StyleSheet.absoluteFill]}
            onLayout={() => {
                wasLaidOutInPreloadedTabRef.current = isInPreloadedTab;
                if (!isInPreloadedTab) {
                    endColdNavigateToReportsSpans();
                }
                // Lets a preloaded tab freeze once its first content is on screen.
                markPreloadedTabContentReady();
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
