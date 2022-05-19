import React, {PureComponent} from 'react';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import participantPropTypes from '../../../components/participantPropTypes';
import Text from '../../../components/Text';
import Timers from '../../../libs/Timers';
import CONST from '../../../CONST';
import DateUtils from '../../../libs/DateUtils';

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
        const reportTimezone = DateUtils.getLocalMomentFromTimestamp(this.props.preferredLocale, null, reportRecipientTimezone.selected);
        const currentTimezone = DateUtils.getLocalMomentFromTimestamp(this.props.preferredLocale);
        const reportRecipientDay = reportTimezone.format('dddd');
        const currentUserDay = currentTimezone.format('dddd');

        if (reportRecipientDay !== currentUserDay) {
            return `${reportTimezone.format('LT')} ${reportRecipientDay}`;
        }
        return `${reportTimezone.format('LT')}`;
    }

    render() {
        const reportRecipientDisplayName = this.props.participant.firstName
            || (Str.isSMSLogin(this.props.participant.login)
                ? this.props.toLocalPhone(this.props.participant.displayName)
                : this.props.participant.displayName);

        return (
            <Text
                style={[styles.chatItemComposeSecondaryRowSubText]}
                numberOfLines={1}
            >
                {this.props.translate(
                    'reportActionCompose.localTime',
                    {
                        user: reportRecipientDisplayName,
                        time: this.state.localTime,
                    },
                )}
            </Text>
        );
    }
}

ParticipantLocalTime.propTypes = propTypes;

export default withLocalize(ParticipantLocalTime);
