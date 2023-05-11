import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import variables from '../../styles/variables';
import CONST from '../../CONST';

const propTypes = {
    /** Enable support for the absolute positioned native(View|Text) children. It will only work for single native child  */
    absolute: PropTypes.bool,

    /** The text to display in the tooltip. */
    text: PropTypes.string,

    /** Maximum number of lines to show in tooltip */
    numberOfLines: PropTypes.number,

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

    /** Number of pixels to set max-width on tooltip  */
    maxWidth: PropTypes.number,

    /** Accessibility prop. Sets the tabindex to 0 if true. Default is true. */
    focusable: PropTypes.bool,

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent: PropTypes.func,

    /** Unique key of renderTooltipContent to rerender the tooltip when one of the key changes */
    renderTooltipContentKey: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    absolute: false,
    shiftHorizontal: 0,
    shiftVertical: 0,
    containerStyles: [],
    text: '',
    maxWidth: variables.sideBarWidth,
    numberOfLines: CONST.TOOLTIP_MAX_LINES,
    renderTooltipContent: undefined,
    renderTooltipContentKey: [],
    focusable: true,
};

export {propTypes, defaultProps};
