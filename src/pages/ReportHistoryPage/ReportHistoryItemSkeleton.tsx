import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';
import {Circle} from 'react-native-svg';

const ICON_CENTER = variables.iconSizeXLarge / 2;
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
                cx={ICON_CENTER}
                cy={ICON_CENTER}
                r={variables.iconSizeSemiSmall / 2}
            />
            <SkeletonRect
                transform={[{translateX: variables.iconSizeXLarge + 12}, {translateY: ICON_CENTER - BAR_HEIGHT / 2}]}
                width={160}
                height={BAR_HEIGHT}
            />
        </SkeletonViewContentLoader>
    );
}

export default ReportHistoryItemSkeleton;
