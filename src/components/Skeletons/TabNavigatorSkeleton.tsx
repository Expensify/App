import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

function TabNavigatorSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    useSkeletonSpan('TabNavigatorSkeleton');

    return (
        <View style={[styles.flexRow, styles.w100, styles.justifyContentBetween, styles.h10]}>
            <SkeletonViewContentLoader
                animate
                height={40}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flex1, styles.ml4, styles.button, styles.highlightBG]}
            >
                <Rect
                    transform={[{translateX: '20%'}, {translateY: 13}]}
                    width="60%"
                    height={14}
                />
            </SkeletonViewContentLoader>
            <SkeletonViewContentLoader
                animate
                height={40}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flex1, styles.mr4, styles.button, styles.appBG]}
            >
                <Rect
                    transform={[{translateX: '20%'}, {translateY: 13}]}
                    width="60%"
                    height={14}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default TabNavigatorSkeleton;
