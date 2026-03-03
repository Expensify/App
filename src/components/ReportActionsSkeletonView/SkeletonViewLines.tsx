import React from 'react';
import {Circle} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SkeletonViewLinesProps = {
    /** Number of rows to show in Skeleton UI block */
    numberOfRows: 1 | 2 | 3;
    shouldAnimate?: boolean;
};

function SkeletonViewLines({numberOfRows, shouldAnimate = true}: SkeletonViewLinesProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <SkeletonViewContentLoader
            animate={shouldAnimate}
            height={CONST.CHAT_SKELETON_VIEW.HEIGHT_FOR_ROW_COUNT[numberOfRows]}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
            speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
            style={styles.mr5}
        >
            <Circle
                cx="40"
                cy="26"
                r="20"
            />
            <SkeletonRect
                transform={[{translateX: 72}, {translateY: 11}]}
                width="20%"
                height="8"
            />
            <SkeletonRect
                transform={[{translateX: 72}, {translateY: 31}]}
                width="100%"
                height="8"
            />
            {numberOfRows > 1 && (
                <SkeletonRect
                    transform={[{translateX: 72}, {translateY: 51}]}
                    width="50%"
                    height="8"
                />
            )}
            {numberOfRows > 2 && (
                <SkeletonRect
                    transform={[{translateX: 72}, {translateY: 71}]}
                    width="50%"
                    height="8"
                />
            )}
        </SkeletonViewContentLoader>
    );
}

export default SkeletonViewLines;
