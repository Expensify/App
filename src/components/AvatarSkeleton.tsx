import React from 'react';
import {Circle} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function AvatarSkeleton({size = CONST.AVATAR_SIZE.SMALL}: {size?: ValueOf<typeof CONST.AVATAR_SIZE>}) {
    const theme = useTheme();

    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    const skeletonCircleRadius = avatarSize / 2;

    return (
        <SkeletonViewContentLoader
            animate
            height={avatarSize}
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

AvatarSkeleton.displayName = 'AvatarSkeleton';
export default AvatarSkeleton;
