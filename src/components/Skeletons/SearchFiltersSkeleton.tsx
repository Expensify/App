import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

type SearchFiltersSkeletonProps = {
    shouldAnimate?: boolean;
};

function SearchFiltersSkeleton({shouldAnimate = true}: SearchFiltersSkeletonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    useSkeletonSpan('SearchFiltersSkeleton');

    const skeletonCount = new Array(5).fill(0);

    return (
        <View style={[styles.mh5, styles.mb4, styles.mt2]}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                height={28}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
            >
                {skeletonCount.map((_, index) => (
                    <Rect
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        transform={[{translateX: index * 90}]}
                        rx={14}
                        ry={14}
                        width={84}
                        height={28}
                    />
                ))}
            </SkeletonViewContentLoader>

            <View style={[styles.pAbsolute, styles.w100]}>
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    height={40}
                    backgroundColor={theme.hoverComponentBG}
                    foregroundColor={theme.buttonHoveredBG}
                >
                    {skeletonCount.map((_, index) => (
                        <Rect
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            transform={[{translateX: 12 + index * 90}, {translateY: 10}]}
                            width={60}
                            height={8}
                        />
                    ))}
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

SearchFiltersSkeleton.displayName = 'SearchStatusSkeleton';

export default SearchFiltersSkeleton;
