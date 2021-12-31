import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Animated, View} from 'react-native';
import ReactDOM from 'react-dom';
import getTooltipStyles from '../../styles/getTooltipStyles';
import Text from '../Text';

const propTypes = {
    /** Window width */
    windowWidth: PropTypes.number.isRequired,

    /** Tooltip Animation value */
    // eslint-disable-next-line react/forbid-prop-types
    animation: PropTypes.object.isRequired,

    /** The distance between the left side of the wrapper view and the left side of the window */
    xOffset: PropTypes.number.isRequired,

    /** The distance between the top of the wrapper view and the top of the window */
    yOffset: PropTypes.number.isRequired,

    /** The width of the tooltip wrapper */
    wrapperWidth: PropTypes.number.isRequired,

    /** The Height of the tooltip wrapper */
    wrapperHeight: PropTypes.number.isRequired,

    /** The width of the tooltip itself */
    tooltipWidth: PropTypes.number.isRequired,

    /** The Height of the tooltip itself */
    tooltipHeight: PropTypes.number.isRequired,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.number.isRequired,

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: PropTypes.number.isRequired,

    /** Callback to set the Ref to the Tooltip */
    setTooltipRef: PropTypes.func.isRequired,

    /** Text to be shown in the tooltip */
    text: PropTypes.string.isRequired,

    /** Callback to be used to calulate the width and height of tooltip */
    measureTooltip: PropTypes.func.isRequired,
};

const defaultProps = {};

const TooltipRenderedOnPageBody = (props) => {
    const {
        animationStyle,
        tooltipWrapperStyle,
        tooltipTextStyle,
        pointerWrapperStyle,
        pointerStyle,
    } = getTooltipStyles(
        props.animation,
        props.windowWidth,
        props.xOffset,
        props.yOffset,
        props.wrapperWidth,
        props.wrapperHeight,
        props.tooltipWidth,
        props.tooltipHeight,
        props.shiftHorizontal,
        props.shiftVertical,
    );
    return ReactDOM.createPortal(
        <Animated.View
            ref={props.setTooltipRef}
            onLayout={props.measureTooltip}
            style={[tooltipWrapperStyle, animationStyle]}
        >
            <Text style={tooltipTextStyle} numberOfLines={1}>{props.text}</Text>
            <View style={pointerWrapperStyle}>
                <View style={pointerStyle} />
            </View>
        </Animated.View>,
        document.querySelector('body'),
    );
};

TooltipRenderedOnPageBody.propTypes = propTypes;
TooltipRenderedOnPageBody.defaultProps = defaultProps;
TooltipRenderedOnPageBody.displayName = 'TooltipRenderedOnPageBody';

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// Its good to memorize this one.
export default memo(TooltipRenderedOnPageBody);
