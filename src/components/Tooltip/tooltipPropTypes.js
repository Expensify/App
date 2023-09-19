import PropTypes from 'prop-types';
import variables from '../../styles/variables';
import CONST from '../../CONST';

const propTypes = {
    /** The text to display in the tooltip. If text is ommitted, only children will be rendered. */
    text: PropTypes.string,

    /** Maximum number of lines to show in tooltip */
    numberOfLines: PropTypes.number,

    /** Children to wrap with Tooltip. */
    children: PropTypes.node.isRequired,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),

    /** Number of pixels to set max-width on tooltip  */
    maxWidth: PropTypes.number,

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent: PropTypes.func,

    /** Unique key of renderTooltipContent to rerender the tooltip when one of the key changes */
    renderTooltipContentKey: PropTypes.arrayOf(PropTypes.string),

    /** passes this down to Hoverable component to decide whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll: PropTypes.bool,

    /**
     * Whether to use a different algorithm for positioning the tooltip.
     *
     * If true, when the user hovers over an element, we check whether that
     * has multiple bounding boxes (i.e. it is text that has wrapped onto two
     * lines). If it does, we select the correct bounding box to use for the
     * tooltip.
     *
     * If false, the tooltip is positioned relative to the center of the
     * target element. This is more performant, because it does not need to
     * do any extra work inside the onmouseenter handler.
     *
     * Defaults to false. Set this to true if your tooltip target could wrap
     * onto multiple lines.
     */
    shouldUseMultilinePositioning: PropTypes.bool,
};

const defaultProps = {
    shiftHorizontal: 0,
    shiftVertical: 0,
    text: '',
    maxWidth: variables.sideBarWidth,
    numberOfLines: CONST.TOOLTIP_MAX_LINES,
    renderTooltipContent: undefined,
    renderTooltipContentKey: [],
    shouldHandleScroll: false,
    shouldUseMultilinePositioning: false,
};

export {propTypes, defaultProps};
