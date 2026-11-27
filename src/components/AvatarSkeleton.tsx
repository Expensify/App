import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

import SkeletonLoader, {SkeletonViewRect} from './SkeletonLoader';

type AvatarSkeletonProps = {
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function AvatarSkeleton({size = CONST.AVATAR_SIZE.SMALL}: AvatarSkeletonProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    const skeletonCircleRadius = avatarSize / 2;

    return (
        <SkeletonLoader
            animate
            height={avatarSize}
            width={avatarSize}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonViewRect
                width={avatarSize}
                height={avatarSize}
                borderRadius={skeletonCircleRadius}
            />
        </SkeletonLoader>
    );
}

export default AvatarSkeleton;
