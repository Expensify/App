import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    /** this could be set to provide events */
    onPress: PropTypes.func,

    /** can be set to provide styles */
    styles: PropTypes.arrayOf(PropTypes.shape({})),

    /** Children to render. */
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
    ]).isRequired,
};

const defaultProps = {
    onPress: () => {},
    styles: [],
};

// Swipeable View is available just on Android/iOS for now. Still need to utilize events
function SwipeableView(props) {
    return (
        <Pressable style={props.styles} onPress={props.onPress}>
            {props.children}
        </Pressable>
    );
}

SwipeableView.propTypes = propTypes;
SwipeableView.defaultProps = defaultProps;

export default SwipeableView;
