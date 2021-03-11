import _ from 'underscore';
import React, {Fragment, PureComponent} from 'react';
import {
    Text,
    View,
} from 'react-native';
import {propTypes, defaultProps} from './OptionRowTitleProps';
import styles from '../../../../styles/styles';
import Tooltip from '../../../../components/Tooltip';
import hasEllipsis from '../../../../libs/hasEllipsis';

class OptionRowTitle extends PureComponent {
    constructor(props) {
        super(props);
        this.ref = null;
        this.cRefs = [];
        this.setContainerRef = (ref) => {
            this.ref = ref;
        };
        this.setOptionChildRef = index => (ref) => {
            this.cRefs[index] = ref;
        };
        this.state = {
            isEllipsisActive: false,
            containerLayout: null,
        };
        this.setContainerLayout = this.setContainerLayout.bind(this);
        this.getTooltipShiftX = this.getTooltipShiftX.bind(this);
    }

    componentDidMount() {
        this.setState({
            isEllipsisActive: this.ref && hasEllipsis(this.ref),
        });
    }

    setContainerLayout({nativeEvent}) {
        this.setState({
            containerLayout: nativeEvent.layout,
        });
    }

    getTooltipShiftX(index) {
        const {containerLayout} = this.state;

        // only shift when containerLayout or Refs to text node is available .
        if (!containerLayout || !this.cRefs[index]) {
            return;
        }
        const {width: cWidth, left: cLeft} = containerLayout;

        // we have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: tWidth, left: tLeft} = this.cRefs[index].getBoundingClientRect();
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
                    ref={this.setContainerRef}
                >
                    {_.map(option.participantsList, (participant, index) => {
                        const setChildRef = this.setOptionChildRef(index);
                        return (
                            <Fragment key={index}>
                                <Tooltip
                                    key={index}
                                    text={participant.login}
                                    containerStyle={styles.dInline}
                                    shiftHorizontal={() => this.getTooltipShiftX(index)}
                                >
                                    <Text ref={setChildRef}>
                                        {participant.displayName}
                                    </Text>
                                </Tooltip>
                                {index < option.participantsList.length - 1 ? <Text>,&nbsp;</Text> : null}
                            </Fragment>
                        );
                    })}
                    {
                        option.participantsList.length > 1 && isEllipsisActive
                            ? (
                                <View style={styles.optionDisplayNameTooltipEllipsis}>
                                    <Tooltip text={option.tooltipText}>
                                        {/* there is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                                        <Text>....</Text>
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
