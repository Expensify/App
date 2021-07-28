import React from 'react';
import {
    View,
} from 'react-native';
import lodashGet from 'lodash/get';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {participantPropTypes} from '../sidebar/optionPropTypes';
import ExpensiText from '../../../components/Text';
import Timers from '../../../libs/Timers';

const propTypes = {
    /** Personal details of the participant */
    participant: participantPropTypes.isRequired,

    ...withLocalizePropTypes,
};

class ParticipantLocalTime extends React.Component {
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
        clearInterval(this.readyTimer);
    }

    getParticipantLocalTime() {
        const reportRecipientTimezone = lodashGet(this.props.participant, 'timezone', {});
        const reportRecipientDay = moment().tz(reportRecipientTimezone.selected).format('dddd');
        const currentUserDay = moment().tz(this.props.currentUserTimezone.selected).format('dddd');

        if (reportRecipientDay !== currentUserDay) {
            return `${moment().tz(reportRecipientTimezone.selected).format('LT')} ${reportRecipientDay}`;
        }
        return `${moment().tz(reportRecipientTimezone.selected).format('LT')}`;
    }

    render() {
        // Moment.format does not return AM or PM values immediately.
        // So we have to wait until we are ready before showing the time to the user
        const isReportRecipientLocalTimeReady = this.state.localTime.toString().match(/(A|P)M/ig);
        const reportRecipientDisplayName = this.props.participant.firstName
            || (Str.isSMSLogin(this.props.participant.login)
                ? this.props.toLocalPhone(this.props.participant.displayName)
                : this.props.participant.displayName);

        return (
            isReportRecipientLocalTimeReady ? (
                <View style={[styles.chatItemComposeSecondaryRow]}>
                    <View style={[
                        styles.chatItemComposeSecondaryRowOffset,
                        styles.flexRow,
                        styles.alignItemsCenter]}
                    >
                        <ExpensiText style={[styles.chatItemComposeSecondaryRowSubText, styles.mr1]}>
                            {this.props.translate('common.timePrefix')}
                        </ExpensiText>
                        <ExpensiText style={[styles.textMicroSupportingBold, styles.mr1]}>
                            {this.state.localTime}
                        </ExpensiText>
                        <ExpensiText style={[styles.chatItemComposeSecondaryRowSubText, styles.mr1]}>
                            {this.props.translate('common.conjunctionFor')}
                        </ExpensiText>
                        <ExpensiText style={[styles.textMicroSupportingBold]}>
                            {reportRecipientDisplayName}
                        </ExpensiText>
                    </View>
                </View>
            )
                : <View style={[styles.chatItemComposeSecondaryRow]} />
        );
    }
}

ParticipantLocalTime.propTypes = propTypes;

export default withLocalize(ParticipantLocalTime);
