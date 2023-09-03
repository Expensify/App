import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';

const propTypes = {
    shouldAnimate: PropTypes.bool,
};

const defaultProps = {
    shouldAnimate: true,
};

function MoneyRequestSkeletonView(props) {
    return (
        <View style={[styles.flex1, styles.overflowHidden]}>
            <SkeletonViewContentLoader
                animate={props.shouldAnimate}
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

MoneyRequestSkeletonView.propTypes = propTypes;
MoneyRequestSkeletonView.defaultProps = defaultProps;
MoneyRequestSkeletonView.displayName = 'MoneyRequestSkeletonView';
export default MoneyRequestSkeletonView;
