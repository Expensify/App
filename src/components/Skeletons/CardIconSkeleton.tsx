import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import React from 'react';

type CardIconSkeletonProps = {
    width: number;
    height: number;
};

function CardIconSkeleton({width, height}: CardIconSkeletonProps) {
    const theme = useTheme();

    return (
        <SkeletonViewContentLoader
            animate
            height={height}
            width={width}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonRect
                width={width}
                height={height}
            />
        </SkeletonViewContentLoader>
    );
}

export default CardIconSkeleton;
