import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Enable support for the absolute positioned native(View|Text) children. It will only work for single native child  */
    absolute: PropTypes.bool,

    /** The text to display in the tooltip. */
    text: PropTypes.string,

    /** Styles to be assigned to the Tooltip wrapper views */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,

    /** Props inherited from withWindowDimensions */
    ...windowDimensionsPropTypes,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

    /** number of pixels to set max-width on tooltip  */
    maxWidth: PropTypes.number,

    /** maximum number of lines to set on tooltip */
    numberOfLines: PropTypes.number,

};

const defaultProps = {
    absolute: false,
    shiftHorizontal: 0,
    shiftVertical: 0,
    containerStyles: [],
    text: '',
};

export {
    propTypes,
    defaultProps,
};
