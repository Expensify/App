import React from 'react';
import {Circle} from 'react-native-svg';
import themeColors from '@styles/themes/default';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function AvatarSkeleton() {
    return (
        <SkeletonViewContentLoader
            animate
            height={40}
            backgroundColor={themeColors.skeletonLHNIn}
            foregroundColor={themeColors.skeletonLHNOut}
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
