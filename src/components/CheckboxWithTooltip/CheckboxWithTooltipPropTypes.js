import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Flag to determine to toggle or not the tooltip */
    toggleTooltip: PropTypes.bool,

    /** The text to display in the tooltip. */
    text: PropTypes.string.isRequired,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Props inherited from withWindowDimensions */
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    style: [],
    disabled: false,
    toggleOnPress: true,
};

export {
    propTypes,
    defaultProps,
};
