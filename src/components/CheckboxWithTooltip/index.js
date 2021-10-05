import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: [],
};

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const CheckboxWithTooltip = props => (
    <View style={props.style}>
    </View>
);

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';
export default CheckboxWithTooltip;
