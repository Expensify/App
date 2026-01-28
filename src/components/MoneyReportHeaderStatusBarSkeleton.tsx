import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function MoneyReportHeaderStatusBarSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('MoneyReportHeaderStatusBarSkeleton');

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.overflowHidden, styles.w100, {height: 28}]}>
            <SkeletonViewContentLoader
                height={28}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <Rect
                    transform={[{translateY: 12}]}
                    width={16}
                    height={8}
                />
                <Rect
                    transform={[{translateX: 24}, {translateY: 12}]}
                    width={120}
                    height={8}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default MoneyReportHeaderStatusBarSkeleton;
