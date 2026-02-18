import React from 'react';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SkeletonRect from './SkeletonRect';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function MoneyRequestSkeletonView() {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <SkeletonViewContentLoader
            testID="MoneyRequestSkeletonView"
            animate
            width={styles.w100.width}
            height={variables.moneyRequestSkeletonHeight}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <SkeletonRect
                transform={[{translateX: 16}, {translateY: 20}]}
                width="40"
                height="8"
            />
            <SkeletonRect
                transform={[{translateX: 16}, {translateY: 46}]}
                width="120"
                height="20"
            />
            <SkeletonRect
                transform={[{translateX: 16}, {translateY: 78}]}
                width="80"
                height="8"
            />
        </SkeletonViewContentLoader>
    );
}

export default MoneyRequestSkeletonView;
