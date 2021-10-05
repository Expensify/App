import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** The text to display in the tooltip. */
    text: PropTypes.string.isRequired,

    /** Container styles */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Props inherited from withWindowDimensions */
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    style: [],
};

export {
    propTypes,
    defaultProps,
};
