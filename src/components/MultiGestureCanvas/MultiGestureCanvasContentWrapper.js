import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import useThemeStyles from '@styles/useThemeStyles';

const imageWrapperPropTypes = {
    children: PropTypes.node.isRequired,
};

function MultiGestureCanvasContentWrapper({children}) {
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

MultiGestureCanvasContentWrapper.propTypes = imageWrapperPropTypes;
MultiGestureCanvasContentWrapper.displayName = 'MultiGestureCanvasContentWrapper';

export default MultiGestureCanvasContentWrapper;
