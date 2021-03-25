import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Animated, Text, View} from 'react-native';
import ReactDOM from 'react-dom';

const propTypes = {
    // Style for Animation
    // eslint-disable-next-line react/forbid-prop-types
    animationStyle: PropTypes.object.isRequired,

    // Syle for Tooltip wrapper
    // eslint-disable-next-line react/forbid-prop-types
    tooltipWrapperStyle: PropTypes.object.isRequired,

    // Style for the text rendered inside tooltip
    // eslint-disable-next-line react/forbid-prop-types
    tooltipTextStyle: PropTypes.object.isRequired,

    // Style for the Tooltip pointer Wrapper
    // eslint-disable-next-line react/forbid-prop-types
    pointerWrapperStyle: PropTypes.object.isRequired,

    // Style for the Tooltip pointer
    // eslint-disable-next-line react/forbid-prop-types
    pointerStyle: PropTypes.object.isRequired,

    // Callback to set the Ref to the Tooltip
    setTooltipRef: PropTypes.func.isRequired,

    // Text to be shown in the tooltip
    text: PropTypes.string.isRequired,

    // Callback to be used to calulate the width and height of tooltip
    measureTooltip: PropTypes.func.isRequired,
};

const defaultProps = {};

const TooltipRenderedOnPageBody = props => ReactDOM.createPortal(
    <Animated.View
        ref={props.setTooltipRef}
        onLayout={props.measureTooltip}
        style={[props.tooltipWrapperStyle, props.animationStyle]}
    >
        <Text style={props.tooltipTextStyle} numberOfLines={1}>{props.text}</Text>
        <View style={props.pointerWrapperStyle}>
            <View style={props.pointerStyle} />
        </View>
    </Animated.View>,
    document.querySelector('body'),
);

TooltipRenderedOnPageBody.propTypes = propTypes;
TooltipRenderedOnPageBody.defaultProps = defaultProps;
TooltipRenderedOnPageBody.displayName = 'TooltipRenderedOnPageBody';

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// Its good to memorize this one.
export default memo(TooltipRenderedOnPageBody);
