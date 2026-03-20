import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import SkeletonRect from './SkeletonRect';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type MoneyReportHeaderStatusBarSkeletonProps = {
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function MoneyReportHeaderStatusBarSkeleton({reasonAttributes}: MoneyReportHeaderStatusBarSkeletonProps = {}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('MoneyReportHeaderStatusBarSkeleton', reasonAttributes);

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.overflowHidden, styles.w100, {height: 28}]}>
            <SkeletonViewContentLoader
                height={28}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <SkeletonRect
                    transform={[{translateY: 12}]}
                    width={16}
                    height={8}
                />
                <SkeletonRect
                    transform={[{translateX: 24}, {translateY: 12}]}
                    width={120}
                    height={8}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default MoneyReportHeaderStatusBarSkeleton;
