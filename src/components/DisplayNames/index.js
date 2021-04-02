import _ from 'underscore';
import React, {Fragment, PureComponent} from 'react';
import {Text, View} from 'react-native';
import {propTypes, defaultProps} from './DisplayNamesPropTypes';
import styles from '../../styles/styles';
import Tooltip from '../Tooltip';
import hasEllipsis from '../../libs/hasEllipsis';

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
            isEllipsisActive: this.containerRef && hasEllipsis(this.containerRef),
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
     * We may need to shit the Tooltip horizontally as the some of the inline text wraps well with ellipsis
     * .But their container node overflows the parent view which causes the tooltip to be misplaced.
     *
     * So we shift it by calculating it as follows:
     * 1. We get the container layout and take the Child inline text node.
     * 2. Now we get the tooltip original position.
     * 3. If inline node's right edge is overflowing the container's right edge, we set the tooltip to the center
     * of the distance between the left edge of the inline node and right edge of the container.
     * @param {Number} index Used to get the Ref to the node at the current index.
     * @returns {Number} Distance to shift the tooltip horizontally
     */
    getTooltipShiftX(index) {
        // Only shift when containerLayout or Refs to text node is available .
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

        // When text right end is beyond the Container Right end
        return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
    }


    render() {
        if (!this.props.tooltipEnabled) {
            // No need for any complex text-splitting, just return a simple text component
            return (
                <Text
                    style={this.props.textStyle}
                    numberOfLines={this.props.numberOfLines}
                >
                    {this.props.fullTitle}
                </Text>
            );
        }

        const displayNames = _.keys(this.props.displayNameToTooltipMap);
        const lastDisplayName = _.last(displayNames);

        return (

            // Tokenization of string only support 1 numberOfLines on Web
            <Text
                style={[this.props.textStyle, styles.optionDisplayNameTooltipWrapper]}
                onLayout={this.setContainerLayout}
                numberOfLines={1}
                ref={el => this.containerRef = el}
            >
                {_.mapObject(this.props.displayNameToTooltipMap, (displayName, tooltipText) => (
                    <Fragment key={tooltipText}>
                        <Tooltip
                            key={tooltipText}
                            text={tooltipText}
                            containerStyle={styles.dInline}
                            shiftHorizontal={() => this.getTooltipShiftX(tooltipText)}
                        >
                            {/*  // We need to get the refs to all the names which will be used to correct
                                 the horizontal position of the tooltip */}
                            <Text ref={el => this.childRefs[tooltipText] = el}>
                                {displayName}
                            </Text>
                        </Tooltip>
                        {displayName !== lastDisplayName && <Text>,&nbsp;</Text>}
                    </Fragment>
                ))}
                {displayNames.length > 1 && this.state.isEllipsisActive
                && (
                    <View style={styles.optionDisplayNameTooltipEllipsis}>
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
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
