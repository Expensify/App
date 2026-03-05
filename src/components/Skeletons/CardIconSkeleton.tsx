import React from 'react';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

type CardIconSkeletonProps = {
    width: number;
    height: number;
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function CardIconSkeleton({width, height, reasonAttributes}: CardIconSkeletonProps) {
    const theme = useTheme();
    useSkeletonSpan('CardIconSkeleton', reasonAttributes);

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
