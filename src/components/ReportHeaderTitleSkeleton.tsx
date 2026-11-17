import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useHeaderAvatarSize from '@hooks/useHeaderAvatarSize';
import useStyleUtils from '@hooks/useStyleUtils';
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
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(useHeaderAvatarSize());
    const radius = avatarSize / 2;
    const circleY = height / 2;
    const titleOffsetX = avatarSize + 15;
    return (
        <SkeletonViewContentLoader
            animate={shouldAnimate}
            width={styles.w100.width}
            height={height}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Circle
                cx={radius}
                cy={circleY}
                r={radius}
            />
            <SkeletonRect
                transform={[{translateX: titleOffsetX}, {translateY: circleY - 12}]}
                width="30%"
                height="8"
            />
            <SkeletonRect
                transform={[{translateX: titleOffsetX}, {translateY: circleY + 8}]}
                width="40%"
                height="8"
            />
        </SkeletonViewContentLoader>
    );
}

export default ReportHeaderTitleSkeleton;
