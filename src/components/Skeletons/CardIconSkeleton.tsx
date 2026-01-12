import React from 'react';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import SkeletonViewContentLoader from '../SkeletonViewContentLoader';

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
                x="0"
                y="0"
                width={width}
                height={height}
                rx="4"
            />
        </SkeletonViewContentLoader>
    );
}

export default CardIconSkeleton;
