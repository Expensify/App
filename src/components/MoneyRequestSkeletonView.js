import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import styles from '../styles/styles';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';

function MoneyRequestSkeletonView() {
    return (
        <View style={[styles.flex1, styles.overflowHidden]}>
            <SkeletonViewContentLoader
                animate
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
                    x="15"
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
        </View>
    );
}

MoneyRequestSkeletonView.displayName = 'MoneyRequestSkeletonView';
export default MoneyRequestSkeletonView;
