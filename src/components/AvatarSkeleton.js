import React from 'react';
import {Circle} from 'react-native-svg';
import useTheme from '@styles/themes/useTheme';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function AvatarSkeleton() {
    const theme = useTheme();
    return (
        <SkeletonViewContentLoader
            animate
            height={40}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Circle
                cx={20}
                cy={20}
                r={20}
            />
        </SkeletonViewContentLoader>
    );
}

AvatarSkeleton.displayName = 'AvatarSkeleton';
export default AvatarSkeleton;
