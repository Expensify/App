import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchStatusSkeletonProps = {
    shouldAnimate?: boolean;
};

function SearchStatusSkeleton({shouldAnimate = true}: SearchStatusSkeletonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.mh5, styles.mb5]}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                height={40}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                <Rect
                    x={0}
                    y={0}
                    rx={20}
                    ry={20}
                    width={68}
                    height={40}
                />
                <Rect
                    x={80}
                    y={14}
                    width={12}
                    height={12}
                />
                <Rect
                    x={100}
                    y={16}
                    width={40}
                    height={8}
                />
                <Rect
                    x={164}
                    y={14}
                    width={12}
                    height={12}
                />
                <Rect
                    x={184}
                    y={16}
                    width={52}
                    height={8}
                />
                <Rect
                    x={260}
                    y={14}
                    width={12}
                    height={12}
                />
                <Rect
                    x={280}
                    y={16}
                    width={40}
                    height={8}
                />
            </SkeletonViewContentLoader>
            <View style={[styles.pAbsolute, styles.w100]}>
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    height={40}
                    backgroundColor={theme.hoverComponentBG}
                    foregroundColor={theme.buttonHoveredBG}
                >
                    <Rect
                        x={12}
                        y={14}
                        width={12}
                        height={12}
                    />
                    <Rect
                        x={32}
                        y={16}
                        width={24}
                        height={8}
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

SearchStatusSkeleton.displayName = 'SearchStatusSkeleton';

export default SearchStatusSkeleton;
