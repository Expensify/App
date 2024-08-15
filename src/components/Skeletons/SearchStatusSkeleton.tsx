import React from 'react';
import {View} from 'react-native';
import {Path, Rect} from 'react-native-svg';
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
                <Path d="M0 20C0 8.95431 8.95431 0 20 0H48C59.0457 0 68 8.95431 68 20C68 31.0457 59.0457 40 48 40H20C8.9543 40 0 31.0457 0 20Z" />
                <Rect
                    x={12}
                    y={14}
                    width={12}
                    height={12}
                    fill={theme.hoverComponentBG}
                />
                <Rect
                    x={32}
                    y={16}
                    width={24}
                    height={8}
                    fill={theme.hoverComponentBG}
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
        </View>
    );
}

SearchStatusSkeleton.displayName = 'SearchStatusSkeleton';

export default SearchStatusSkeleton;
