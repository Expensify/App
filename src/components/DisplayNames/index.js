import _ from 'underscore';
import React, {Fragment, PureComponent} from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import styles from '../../styles/styles';
import Tooltip from '../Tooltip';
import Text from '../Text';

class DisplayNames extends PureComponent {
    constructor(props) {
        super(props);
        this.containerRef = null;
        this.childRefs = [];
        this.state = {
            isEllipsisActive: false,
        };
        this.setContainerLayout = this.setContainerLayout.bind(this);
        this.getTooltipShiftX = this.getTooltipShiftX.bind(this);
    }

    componentDidMount() {
        this.setState({
            isEllipsisActive: this.containerRef
                && this.containerRef.offsetWidth
                && this.containerRef.scrollWidth
                && this.containerRef.offsetWidth < this.containerRef.scrollWidth,
        });
    }

    /**
     * Set the container layout for post calculations
     *
     * @param {*} {nativeEvent}
     */
    setContainerLayout({nativeEvent}) {
        this.containerLayout = nativeEvent.layout;
    }

    /**
     * We may need to shift the Tooltip horizontally as some of the inline text wraps well with ellipsis,
     * but their container node overflows the parent view which causes the tooltip to be misplaced.
     *
     * So we shift it by calculating it as follows:
     * 1. We get the container layout and take the Child inline text node.
     * 2. Now we get the tooltip original position.
     * 3. If inline node's right edge is overflowing the container's right edge, we set the tooltip to the center
     * of the distance between the left edge of the inline node and right edge of the container.
     * @param {Number} index Used to get the Ref to the node at the current index
     * @returns {Number} Distance to shift the tooltip horizontally
     */
    getTooltipShiftX(index) {
        // Only shift the tooltip in case the containerLayout or Refs to the text node are available
        if (!this.containerLayout || !this.childRefs[index]) {
            return;
        }
        const {width: containerWidth, left: containerLeft} = this.containerLayout;

        // We have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: textNodeWidth, left: textNodeLeft} = this.childRefs[index].getBoundingClientRect();
        const tooltipX = (textNodeWidth / 2) + textNodeLeft;
        const containerRight = containerWidth + containerLeft;
        const textNodeRight = textNodeWidth + textNodeLeft;
        const newToolX = textNodeLeft + ((containerRight - textNodeLeft) / 2);

        // When text right end is beyond the Container right end
        return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
    }

    render() {
        if (!this.props.tooltipEnabled) {
            // No need for any complex text-splitting, just return a simple Text component
            return (
                <Text
                    style={this.props.textStyles}
                    numberOfLines={this.props.numberOfLines}
                >
                    {this.props.fullTitle}
                </Text>
            );
        }

        return (

            // Tokenization of string only support 1 numberOfLines on Web
            <Text
                style={[...this.props.textStyles, styles.pRelative]}
                onLayout={this.setContainerLayout}
                numberOfLines={1}
                ref={el => this.containerRef = el}
            >
                {this.props.shouldUseFullTitle
                    ? this.props.fullTitle
                    : _.map(this.props.displayNamesWithTooltips, ({displayName, tooltip}, index) => (
                        <Fragment key={index}>
                            <Tooltip
                                key={index}
                                text={tooltip}
                                containerStyles={[styles.dInline]}
                                shiftHorizontal={() => this.getTooltipShiftX(index)}
                            >
                                {/*  // We need to get the refs to all the names which will be used to correct
                                    the horizontal position of the tooltip */}
                                <Text ref={el => this.childRefs[index] = el} style={this.props.textStyles}>
                                    {displayName}
                                </Text>
                            </Tooltip>
                            {index < this.props.displayNamesWithTooltips.length - 1 && <Text style={this.props.textStyles}>,&nbsp;</Text>}
                        </Fragment>
                    ))}
                {this.props.displayNamesWithTooltips.length > 1 && this.state.isEllipsisActive
                    && (
                        <View style={styles.displayNameTooltipEllipsis}>
                            <Tooltip text={this.props.fullTitle}>
                                {/* There is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                                <Text>....</Text>
                            </Tooltip>
                        </View>
                    )}
            </Text>
        );
    }
}
DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;

export default DisplayNames;
