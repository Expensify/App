import React from 'react';
import {Rect} from 'react-native-svg';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

function MoneyRequestSkeletonView() {
    return (
        <SkeletonViewContentLoader
            animate
            width={styles.w100.width}
            height={variables.moneyRequestSkeletonHeight}
            backgroundColor={themeColors.borderLighter}
            foregroundColor={themeColors.border}
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
