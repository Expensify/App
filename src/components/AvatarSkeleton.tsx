import React from 'react';
import {Circle} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function AvatarSkeleton() {
    const theme = useTheme();
    const skeletonCircleRadius = variables.sidebarAvatarSize / 2;

    return (
        <SkeletonViewContentLoader
            animate
            height={variables.sidebarAvatarSize}
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
