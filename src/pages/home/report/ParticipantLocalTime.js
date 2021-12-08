import React, {PureComponent} from 'react';
import {
    View,
} from 'react-native';
import lodashGet from 'lodash/get';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {participantPropTypes} from '../sidebar/optionPropTypes';
import ExpensifyText from '../../../components/ExpensifyText';
import Timers from '../../../libs/Timers';
import CONST from '../../../CONST';

const propTypes = {
    /** Personal details of the participant */
    participant: participantPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class ParticipantLocalTime extends PureComponent {
    constructor(props) {
        super(props);
        this.getParticipantLocalTime = this.getParticipantLocalTime.bind(this);
        this.state = {
            localTime: this.getParticipantLocalTime(),
        };
    }

    componentDidMount() {
        this.timer = Timers.register(setInterval(() => {
            this.setState({
                localTime: this.getParticipantLocalTime(),
            });
        }, 1000));
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    getParticipantLocalTime() {
        const reportRecipientTimezone = lodashGet(this.props.participant, 'timezone', CONST.DEFAULT_TIME_ZONE);
        moment.locale(this.props.preferredLocale);
        const reportRecipientDay = moment().tz(reportRecipientTimezone.selected).format('dddd');
        const currentUserDay = moment().tz(this.props.currentUserTimezone.selected).format('dddd');

        if (reportRecipientDay !== currentUserDay) {
            return `${moment().tz(reportRecipientTimezone.selected).format('LT')} ${reportRecipientDay}`;
        }
        return `${moment().tz(reportRecipientTimezone.selected).format('LT')}`;
    }

    render() {
        const reportRecipientDisplayName = this.props.participant.firstName
            || (Str.isSMSLogin(this.props.participant.login)
                ? this.props.toLocalPhone(this.props.participant.displayName)
                : this.props.participant.displayName);

        return (
            <View style={[styles.chatItemComposeSecondaryRow]}>
                <ExpensifyText
                    style={[
                        styles.chatItemComposeSecondaryRowSubText,
                        styles.chatItemComposeSecondaryRowOffset,
                    ]}
                    numberOfLines={1}
                >
                    {this.props.translate(
                        'reportActionCompose.localTime',
                        {
                            user: reportRecipientDisplayName,
                            time: this.state.localTime,
                        },
                    )}
                </ExpensifyText>
            </View>
        );
    }
}

ParticipantLocalTime.propTypes = propTypes;

export default withLocalize(ParticipantLocalTime);
