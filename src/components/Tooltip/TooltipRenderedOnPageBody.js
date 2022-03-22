import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Animated, View} from 'react-native';
import ReactDOM from 'react-dom';
import getTooltipStyles from '../../styles/getTooltipStyles';
import Text from '../Text';
import variables from '../../styles/variables';
import styles from '../../styles/styles';

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

    /** Maximun amount of words the tooltip should show */
    maximumWords: PropTypes.number.isRequired,
};

const defaultProps = {};

class TooltipRenderedOnPageBody extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltipTextWidth: variables.sideBarWidth,
        };

        this.textRef = null;
        this.getCorrectWidth = this.getCorrectWidth.bind(this);
    }

    componentDidMount() {
        this.setState({
            tooltipTextWidth: this.getCorrectWidth(this.textRef.offsetWidth),
        });
    }

    getCorrectWidth(textWidth) {
        const maxWidth = variables.sideBarWidth;
        if (textWidth >= maxWidth) {
            return maxWidth;
        }
        const maxWidthDiffTextWidth = maxWidth - textWidth;

        // This operation will serve us to avoid adding more width than maxwidth
        // Get padding of tooltipWrapper and sum the right and left
        const leftRighPadding = styles.p2.padding * 2;
        if (leftRighPadding > maxWidthDiffTextWidth) {
            return textWidth + maxWidthDiffTextWidth;
        }
        return textWidth + leftRighPadding;
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
            this.props.tooltipWidth,
            this.props.tooltipHeight,
            this.props.shiftHorizontal,
            this.props.shiftVertical,
            this.state.tooltipTextWidth,
        );
        const maximumWords = this.props.maximumWords;
        const wordsProvided = this.props.text.split(' ');

        // Only show the amount words we want to see no matter the amount of lines needed to fit them
        // This will give us an accurate width of visible text using ref.offsetWidth
        // offsetWidth is accurate to visible text width if there no height overflow,
        // otherwise will give us a longer width if there's longer line hidden in overflow
        const wordsToShow = wordsProvided.slice(0, maximumWords);

        return ReactDOM.createPortal(
            <Animated.View
                ref={this.props.setTooltipRef}
                onLayout={this.props.measureTooltip}
                style={[tooltipWrapperStyle, animationStyle]}
            >
                <Text style={tooltipTextStyle}>
                    <Text style={tooltipTextStyle} ref={ref => this.textRef = ref}>{wordsToShow.join(' ')}</Text>
                    {maximumWords < wordsProvided.length ? <Text style={tooltipTextStyle}>...</Text> : '' }
                </Text>
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
TooltipRenderedOnPageBody.displayName = 'TooltipRenderedOnPageBody';

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// Its good to memorize this one.
export default memo(TooltipRenderedOnPageBody);
