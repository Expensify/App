import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    shouldAnimate: PropTypes.bool,
};

const defaultProps = {
    shouldAnimate: true,
};

function IOUSkeletonView(props) {
    return (
      <View
      style={[styles.flex1, styles.overflowHidden]}>
            <SkeletonViewContentLoader
                animate={props.shouldAnimate}
                width={107}
                height={variables.contentHeaderHeight}
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
                        width="120"
                        height="20"
                    />
                </SkeletonViewContentLoader>
        </View>
    );
}

IOUSkeletonView.propTypes = propTypes;
IOUSkeletonView.defaultProps = defaultProps;
IOUSkeletonView.displayName = 'IOUSkeletonView';
export default compose(withWindowDimensions, withLocalize)(IOUSkeletonView);
