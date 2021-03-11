/* eslint-disable react/forbid-prop-types */
import _ from 'underscore';
import React, {Fragment, PureComponent} from 'react';
import {
    Text,
    View,
} from 'react-native';
import propTypes from './OptionRowTitleProps';
import styles from '../../../../styles/styles';
import Tooltip from '../../../../components/Tooltip';
import hasEllipsis from '../../../../libs/hasEllipsis';

const defaultProps = {
    style: null,
    tooltipEnabled: false,
};
class OptionRowTitle extends PureComponent {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.cRefs = [];
        this.state = {
            isEllipsisActive: false,
            containerLayout: null,
        };
        this.setContainerLayout = this.setContainerLayout.bind(this);
        this.getTooltipShiftX = this.getTooltipShiftX.bind(this);
    }

    componentDidMount() {
        this.setState({
            isEllipsisActive: this.ref.current && hasEllipsis(this.ref.current),
        });
        this.cRefs = this.props.option.participantsList.map(() => React.createRef());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.option !== this.props.option) {
            this.cRefs = this.props.option.participantsList.map(() => React.createRef());
        }
    }

    setContainerLayout({nativeEvent}) {
        this.setState({
            containerLayout: nativeEvent.layout,
        });
    }

    getTooltipShiftX(index) {
        const {containerLayout} = this.state;

        // only shift when containerLayout or Refs to text node is available .
        if (!containerLayout || !this.cRefs[index] || !this.cRefs[index].current) {
            return;
        }
        const {width: cWidth, left: cLeft} = containerLayout;

        // we have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: tWidth, left: tLeft} = this.cRefs[index].current.getBoundingClientRect();
        const toolX = (tWidth / 2) + tLeft;
        const cRight = cWidth + cLeft;
        const tRight = tWidth + tLeft;
        const newToolX = tLeft + ((cRight - tLeft) / 2);

        // when text right end is beyond the Container Right end
        return tRight > cRight ? -(toolX - newToolX) : 0;
    }


    render() {
        const {option, style, tooltipEnabled} = this.props;
        const {isEllipsisActive} = this.state;

        if (tooltipEnabled) {
            return (
                <Text
                    style={
                        [styles.optionDisplayName, style,
                            styles.flexRow, styles.optionDisplayNameTooltipWrapper]
                    }
                    onLayout={this.setContainerLayout}
                    numberOfLines={1}
                    ref={this.ref}
                >
                    {_.map(option.participantsList, (participant, index) => {
                        const ref = this.cRefs[index] ? this.cRefs[index] : (this.cRefs[index] = React.createRef());
                        return (
                            <Fragment key={index}>
                                <Tooltip
                                    key={index}
                                    text={participant.login}
                                    containerStyle={styles.dInline}
                                    shiftHorizontal={() => this.getTooltipShiftX(index)}
                                >
                                    <Text ref={ref}>
                                        {participant.displayName}
                                    </Text>
                                </Tooltip>
                                {index < option.participantsList.length - 1 ? <Text>,&nbsp;</Text> : null}
                            </Fragment>
                        );
                    })}
                    {
                        isEllipsisActive
                            ? (
                                <View style={styles.optionDisplayNameTooltipEllipsis}>
                                    <Tooltip text={option.tooltipText}>
                                        <Text>...</Text>
                                    </Tooltip>
                                </View>
                            ) : null
                    }
                </Text>
            );
        }

        return <Text style={[styles.optionDisplayName, style]} numberOfLines={1}>{option.text}</Text>;
    }
}
OptionRowTitle.propTypes = propTypes;
OptionRowTitle.defaultProps = defaultProps;
OptionRowTitle.displayName = 'OptionRowTitle';

export default OptionRowTitle;
