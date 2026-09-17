import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import SkeletonRect from './SkeletonRect';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function MoneyReportHeaderStatusBarSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

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
