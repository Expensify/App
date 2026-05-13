import React from 'react';
import {View} from 'react-native';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

type TableSkeletonProps = {
    /** The number of skeleton rows to render */
    rowCount?: number;

    /** The reason attributes for the skeleton */
    reasonAttributes: SkeletonSpanReasonAttributes;

    /** The skeleton elements to render within the table row as a skeleton */
    renderSkeletonItem: () => React.ReactNode;
};

export default function TableSkeleton({renderSkeletonItem, reasonAttributes, rowCount = 5}: TableSkeletonProps) {
    useSkeletonSpan('TableSkeleton', reasonAttributes);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const isSmallView = isMediumScreenWidth || shouldUseNarrowLayout;

    const tableSkeletonRowStyles = [
        styles.flexRow,
        styles.overflowHidden,
        styles.alignItemsCenter,
        isSmallView ? styles.ph4 : styles.ph3,
        isSmallView ? styles.tableRowHeightCompact : styles.tableRowHeight,
    ];

    const rows = new Array(rowCount).fill(null).map((_, index) => (
        <View
            // We use an index since this is a loading state w/ no other data
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={[tableSkeletonRowStyles, index !== rowCount - 1 && styles.borderBottom]}
        >
            <SkeletonViewContentLoader
                height={32}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {renderSkeletonItem()}
            </SkeletonViewContentLoader>
        </View>
    ));

    return <View style={[styles.m5, styles.tableBottomRadius, styles.overflowHidden, styles.tableTopRadius, styles.highlightBG]}>{rows}</View>;
}
