import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';
import {Circle} from 'react-native-svg';

const ICON_CENTER = variables.iconSizeXLarge / 2;

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
                transform={[{translateX: variables.iconSizeXLarge + variables.reportHistoryLabelGap}, {translateY: ICON_CENTER - variables.reportHistorySkeletonLabelHeight / 2}]}
                width={variables.reportHistorySkeletonLabelWidth}
                height={variables.reportHistorySkeletonLabelHeight}
            />
        </SkeletonViewContentLoader>
    );
}

export default ReportHistoryItemSkeleton;
