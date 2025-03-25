import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function TabNavigatorSkeleton() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.w100, styles.justifyContentBetween, {height: 40}]}>
            <SkeletonViewContentLoader
                animate
                height={40}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                style={[styles.flex1, styles.ml4, styles.button, styles.highlightBG]}
            >
                <Rect
                    x="20%"
                    y={13}
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
                    x="20%"
                    y={13}
                    width="60%"
                    height={14}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

TabNavigatorSkeleton.displayName = 'TabNavigatorSkeleton';

export default TabNavigatorSkeleton;
