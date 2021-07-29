import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
// render the View which is not present on the Mobile.
const propTypes = {
    /** Styles to be assigned to the Tooltip wrapper views */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    containerStyles: [],
};

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const Tooltip = props => (
    <View style={props.containerStyles}>
        {props.children}
    </View>
);

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
Tooltip.displayName = 'Tooltip';
export default Tooltip;
