import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import useThemeStyles from '@styles/useThemeStyles';

const imageWrapperPropTypes = {
    children: PropTypes.node.isRequired,
};

function ImageWrapper({children}) {
    const styles = useThemeStyles();
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
ImageWrapper.displayName = 'ImageWrapper';

export default ImageWrapper;
