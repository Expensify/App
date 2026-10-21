import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';
import {Circle} from 'react-native-svg';

const ICON_RADIUS = variables.iconSizeXLarge / 2;
const BAR_HEIGHT = 8;

function ReportHistoryItemSkeleton() {
    const theme = useTheme();

    return (
        <SkeletonViewContentLoader
            animate
            height={variables.iconSizeXLarge}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Circle
                cx={ICON_RADIUS}
                cy={ICON_RADIUS}
                r={ICON_RADIUS}
            />
            <SkeletonRect
                transform={[{translateX: variables.iconSizeXLarge + 12}, {translateY: ICON_RADIUS - BAR_HEIGHT / 2}]}
                width={160}
                height={BAR_HEIGHT}
            />
        </SkeletonViewContentLoader>
    );
}

export default ReportHistoryItemSkeleton;
