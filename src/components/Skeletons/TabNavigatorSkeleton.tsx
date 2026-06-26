import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

import React from 'react';
import {View} from 'react-native';

type TabNavigatorSkeletonProps = {
    reasonAttributes: SkeletonSpanReasonAttributes;
};

function TabNavigatorSkeleton({reasonAttributes}: TabNavigatorSkeletonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('TabNavigatorSkeleton', reasonAttributes);

    return (
        <View style={[styles.flexRow, styles.w100, styles.justifyContentBetween, styles.h10]}>
            <View style={[styles.flex1, styles.ml4, styles.button, styles.highlightBG, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <SkeletonViewContentLoader
                    animate
                    width="60%"
                    height="35%"
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                >
                    <SkeletonRect
                        width="100%"
                        height="100%"
                    />
                </SkeletonViewContentLoader>
            </View>
            <View style={[styles.flex1, styles.mr4, styles.button, styles.appBG, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <SkeletonViewContentLoader
                    animate
                    width="60%"
                    height="35%"
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                >
                    <SkeletonRect
                        width="100%"
                        height="100%"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

export default TabNavigatorSkeleton;
