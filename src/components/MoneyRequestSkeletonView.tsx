import React from 'react';
import {Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function MoneyRequestSkeletonView() {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <SkeletonViewContentLoader
            testID={MoneyRequestSkeletonView.displayName}
            animate
            width={styles.w100.width}
            height={variables.moneyRequestSkeletonHeight}
            backgroundColor={theme.skeletonLHNIn}
            foregroundColor={theme.skeletonLHNOut}
        >
            <Rect
                x="16"
                y="20"
                width="40"
                height="8"
            />
            <Rect
                x="16"
                y="46"
                width="120"
                height="20"
            />
            <Rect
                x="16"
                y="78"
                width="80"
                height="8"
            />
        </SkeletonViewContentLoader>
    );
}

MoneyRequestSkeletonView.displayName = 'MoneyRequestSkeletonView';
export default MoneyRequestSkeletonView;
