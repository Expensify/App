import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
                <Rect
                    x={0}
                    y={12}
                    width={16}
                    height={8}
                />
                <Rect
                    x={24}
                    y={12}
                    width={120}
                    height={8}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

MoneyReportHeaderStatusBarSkeleton.displayName = 'MoneyReportHeaderStatusBarSkeleton';

export default MoneyReportHeaderStatusBarSkeleton;
