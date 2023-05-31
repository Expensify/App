import React, {useLayoutEffect, useEffect, useState, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {Animated, View} from 'react-native';
import ReactDOM from 'react-dom';
import getTooltipStyles from '../../styles/getTooltipStyles';
import Text from '../Text';
import Log from '../../libs/Log';

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

    /** The width of the tooltip's target */
    targetWidth: PropTypes.number.isRequired,

    /** The height of the tooltip's target */
    targetHeight: PropTypes.number.isRequired,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.number,

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: PropTypes.number,

    /** Text to be shown in the tooltip */
    text: PropTypes.string.isRequired,

    /** Maximum number of lines to show in tooltip */
    numberOfLines: PropTypes.number.isRequired,

    /** Number of pixels to set max-width on tooltip  */
    maxWidth: PropTypes.number,

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent: PropTypes.func,
};

const defaultProps = {
    shiftHorizontal: 0,
    shiftVertical: 0,
    renderTooltipContent: undefined,
    maxWidth: 0,
};

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memoize this one.
const TooltipRenderedOnPageBody = (props) => {
    // The width and height of tooltip's inner content. Has to be undefined in the beginning
    // as a width/height of 0 will cause the content to be rendered of a width/height of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState(undefined);
    const [contentMeasuredHeight, setContentMeasuredHeight] = useState(undefined);
    const contentRef = useRef();
    const rootWrapper = useRef();

    useEffect(() => {
        if (!props.renderTooltipContent || !props.text) {
            return;
        }
        Log.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
    }, [props.text, props.renderTooltipContent]);

    useLayoutEffect(() => {
        // Calculate the tooltip width and height before the browser repaints the screen to prevent flicker
        // because of the late update of the width and the height from onLayout.
        const rect = contentRef.current.getBoundingClientRect();
        setContentMeasuredWidth(rect.width);
        setContentMeasuredHeight(rect.height);
    }, []);

    const {animationStyle, rootWrapperStyle, textStyle, pointerWrapperStyle, pointerStyle} = useMemo(
        () =>
            getTooltipStyles(
                props.animation,
                props.windowWidth,
                props.xOffset,
                props.yOffset,
                props.targetWidth,
                props.targetHeight,
                props.maxWidth,
                contentMeasuredWidth,
                contentMeasuredHeight,
                props.shiftHorizontal,
                props.shiftVertical,
                rootWrapper.current,
            ),
        [
            props.animation,
            props.windowWidth,
            props.xOffset,
            props.yOffset,
            props.targetWidth,
            props.targetHeight,
            props.maxWidth,
            contentMeasuredWidth,
            contentMeasuredHeight,
            props.shiftHorizontal,
            props.shiftVertical,
        ],
    );

    let content;
    if (props.renderTooltipContent) {
        content = <View ref={contentRef}>{props.renderTooltipContent()}</View>;
    } else {
        content = (
            <Text
                numberOfLines={props.numberOfLines}
                style={textStyle}
            >
                <Text
                    style={textStyle}
                    ref={contentRef}
                >
                    {props.text}
                </Text>
            </Text>
        );
    }

    return ReactDOM.createPortal(
        <Animated.View
            ref={rootWrapper}
            style={[rootWrapperStyle, animationStyle]}
        >
            {content}
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

export default React.memo(TooltipRenderedOnPageBody);
