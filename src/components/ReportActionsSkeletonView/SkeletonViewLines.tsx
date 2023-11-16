import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
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
            style={styles.mr5}
        >
            <Circle
                cx="40"
                cy="26"
                r="20"
            />
            <Rect
                x="72"
                y="11"
                width="20%"
                height="8"
            />
            <Rect
                x="72"
                y="31"
                width="100%"
                height="8"
            />
            {numberOfRows > 1 && (
                <Rect
                    x="72"
                    y="51"
                    width="50%"
                    height="8"
                />
            )}
            {numberOfRows > 2 && (
                <Rect
                    x="72"
                    y="71"
                    width="50%"
                    height="8"
                />
            )}
        </SkeletonViewContentLoader>
    );
}

SkeletonViewLines.displayName = 'SkeletonViewLines';
export default SkeletonViewLines;
