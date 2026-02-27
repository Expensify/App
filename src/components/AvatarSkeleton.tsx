import React from 'react';
import {Circle} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type AvatarSkeletonProps = {
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;
    reasonAttributes?: SkeletonSpanReasonAttributes;
};

function AvatarSkeleton({size = CONST.AVATAR_SIZE.SMALL, reasonAttributes}: AvatarSkeletonProps) {
    const theme = useTheme();
    useSkeletonSpan('AvatarSkeleton', reasonAttributes);
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    const skeletonCircleRadius = avatarSize / 2;

    return (
        <SkeletonViewContentLoader
            animate
            height={avatarSize}
            width={avatarSize}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Circle
                cx={skeletonCircleRadius}
                cy={skeletonCircleRadius}
                r={skeletonCircleRadius}
            />
        </SkeletonViewContentLoader>
    );
}

export default AvatarSkeleton;
