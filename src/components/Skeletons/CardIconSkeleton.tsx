import React from 'react';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';

type CardIconSkeletonProps = {
    width: number;
    height: number;
};

function CardIconSkeleton({width, height}: CardIconSkeletonProps) {
    const theme = useTheme();
    useSkeletonSpan('CardIconSkeleton');

    return (
        <SkeletonViewContentLoader
            animate
            height={height}
            width={width}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Rect
                width={width}
                height={height}
                rx="4"
            />
        </SkeletonViewContentLoader>
    );
}

export default CardIconSkeleton;
