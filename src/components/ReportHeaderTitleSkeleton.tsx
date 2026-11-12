import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {Circle} from 'react-native-svg';

import SkeletonRect from './SkeletonRect';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type ReportHeaderTitleSkeletonProps = {
    shouldAnimate?: boolean;
};

/** Report header avatar and title placeholder, shown while the report name is loading */
function ReportHeaderTitleSkeleton({shouldAnimate = true}: ReportHeaderTitleSkeletonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {contentHeaderHeight: height} = useContentHeaderHeight();
    const radius = 20;
    const circleY = height / 2;
    const circleTopY = circleY - radius;
    const circleBottomY = circleY + radius;

    return (
        <SkeletonViewContentLoader
            animate={shouldAnimate}
            width={styles.w100.width}
            height={height}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Circle
                cx="20"
                cy={circleY}
                r={radius}
            />
            <SkeletonRect
                transform={[{translateX: 55}, {translateY: circleTopY + 8}]}
                width="30%"
                height="8"
            />
            <SkeletonRect
                transform={[{translateX: 55}, {translateY: circleBottomY - 12}]}
                width="40%"
                height="8"
            />
        </SkeletonViewContentLoader>
    );
}

export default ReportHeaderTitleSkeleton;
