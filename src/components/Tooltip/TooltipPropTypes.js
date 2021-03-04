import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    // The text to display in the tooltip.
    text: PropTypes.string.isRequired,

    // Styles to be assigned to the Tooltip wrapper views
    containerStyle: PropTypes.object,

    // Children to wrap with Tooltip.
    children: PropTypes.node.isRequired,

    // Props inherited from withWindowDimensions
    ...windowDimensionsPropTypes,

    // Any additional amount to manually adjust the horizontal position of the tooltip.
    // A positive value shifts the tooltip to the right, and a negative value shifts it to the left.
    shiftHorizontal: PropTypes.number,

    // Any additional amount to manually adjust the vertical position of the tooltip.
    // A positive value shifts the tooltip down, and a negative value shifts it up.
    shiftVertical: PropTypes.number,
};

export default propTypes;
