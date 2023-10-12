/* eslint-disable es/no-optional-chaining */
import React from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import Animated from 'react-native-reanimated';
import styles from '../../../../styles/styles';

const imageWrapperPropTypes = {
    children: PropTypes.node.isRequired,
};

function ImageWrapper({children}) {
    return (
        <Animated.View
            collapsable={false}
            style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}
        >
            {children}
        </Animated.View>
    );
}
ImageWrapper.propTypes = imageWrapperPropTypes;

export default ImageWrapper;
