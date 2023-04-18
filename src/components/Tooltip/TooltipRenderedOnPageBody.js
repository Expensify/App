import React from 'react';
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

    /** The width of the tooltip wrapper */
    wrapperWidth: PropTypes.number.isRequired,

    /** The Height of the tooltip wrapper */
    wrapperHeight: PropTypes.number.isRequired,

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
// It's good to memorize this one.
class TooltipRenderedOnPageBody extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // The width of tooltip's inner content. Has to be undefined in the beginning
            // as a width of 0 will cause the content to be rendered of a width of 0,
            // which prevents us from measuring it correctly.
            tooltipContentWidth: undefined,

            // The width and height of the tooltip itself
            tooltipWidth: 0,
            tooltipHeight: 0,
        };

        if (props.renderTooltipContent && props.text) {
            Log.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
        }

        this.measureTooltip = this.measureTooltip.bind(this);
        this.updateTooltipContentWidth = this.updateTooltipContentWidth.bind(this);
    }

    componentDidMount() {
        this.updateTooltipContentWidth();
    }

    componentDidUpdate(prevProps) {
        // We need to re-calculate the tooltipContentWidth if it is greater than maxWidth.
        // So that the wrapperWidth still be updated again with correct value
        if (this.state.tooltipContentWidth > prevProps.maxWidth) {
            this.updateTooltipContentWidth();
        }

        if (prevProps.text === this.props.text && prevProps.renderTooltipContent === this.props.renderTooltipContent) {
            return;
        }

        // Reset the tooltip text width to 0 so that we can measure it again.
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({tooltipContentWidth: undefined}, this.updateTooltipContentWidth);
    }

    updateTooltipContentWidth() {
        if (!this.contentRef) {
            return;
        }

        this.setState({
            tooltipContentWidth: this.contentRef.offsetWidth,
        });
    }

    /**
     * Measure the size of the tooltip itself.
     *
     * @param {Object} nativeEvent
     */
    measureTooltip({nativeEvent}) {
        this.setState({
            tooltipWidth: nativeEvent.layout.width,
            tooltipHeight: nativeEvent.layout.height,
        });
    }

    render() {
        const {
            animationStyle,
            tooltipWrapperStyle,
            tooltipTextStyle,
            pointerWrapperStyle,
            pointerStyle,
        } = getTooltipStyles(
            this.props.animation,
            this.props.windowWidth,
            this.props.xOffset,
            this.props.yOffset,
            this.props.wrapperWidth,
            this.props.wrapperHeight,
            this.props.maxWidth,
            this.state.tooltipWidth,
            this.state.tooltipHeight,
            this.state.tooltipContentWidth,
            this.props.shiftHorizontal,
            this.props.shiftVertical,
        );

        const contentRef = (ref) => {
            // Once the content for the tooltip first renders, update the width of the tooltip dynamically to fit the width of the content.
            // Note that we can't have this code in componentDidMount because the ref for the content won't be set until after the first render
            if (this.contentRef) {
                return;
            }

            this.contentRef = ref;
            this.updateTooltipContentWidth();
        };

        let content;
        if (this.props.renderTooltipContent) {
            content = (
                <View ref={contentRef}>
                    {this.props.renderTooltipContent()}
                </View>
            );
        } else {
            content = (
                <Text numberOfLines={this.props.numberOfLines} style={tooltipTextStyle}>
                    <Text style={tooltipTextStyle} ref={contentRef}>
                        {this.props.text}
                    </Text>
                </Text>
            );
        }

        return ReactDOM.createPortal(
            <Animated.View
                onLayout={this.measureTooltip}
                style={[tooltipWrapperStyle, animationStyle]}
            >
                {content}
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </Animated.View>,
            document.querySelector('body'),
        );
    }
}

TooltipRenderedOnPageBody.propTypes = propTypes;
TooltipRenderedOnPageBody.defaultProps = defaultProps;

export default TooltipRenderedOnPageBody;
