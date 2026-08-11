import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const DEFAULT_CONTAINER_WIDTH = 84;
const DEFAULT_PILL_WIDTH = 60;
const PILL_WIDTH_RATIO = DEFAULT_PILL_WIDTH / DEFAULT_CONTAINER_WIDTH;

const DEFAULT_CONTAINER_HEIGHT = 28;
const DEFAULT_PILL_HEIGHT = 8;
const PILL_HEIGHT_RATIO = DEFAULT_PILL_HEIGHT / DEFAULT_CONTAINER_HEIGHT;

type SearchFiltersSkeletonProps = {
    shouldAnimate?: boolean;
    itemCount?: number;
    width?: number;
    height?: number;
};

function SearchFiltersSkeleton({shouldAnimate = true, itemCount = 5, width = 84, height = 28}: SearchFiltersSkeletonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const skeletonCount = new Array(itemCount).fill(0);

    return (
        <View>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                width={width}
                height={height}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {skeletonCount.map((_, index) => (
                    <SkeletonRect
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        transform={[{translateX: index * 90}]}
                        borderRadius={14}
                        width={width}
                        height={height}
                    />
                ))}
            </SkeletonViewContentLoader>

            <View style={[styles.pAbsolute, styles.w100]}>
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    height={28}
                    backgroundColor={theme.hoverComponentBG}
                    foregroundColor={theme.buttonHoveredBG}
                >
                    {skeletonCount.map((_, index) => (
                        <SkeletonRect
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            transform={[{translateX: 12 + index * 90}, {translateY: 10}]}
                            width={width * PILL_WIDTH_RATIO}
                            height={height * PILL_HEIGHT_RATIO}
                        />
                    ))}
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

export default SearchFiltersSkeleton;
