import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
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

function getParticipantLocalTime(participant, preferredLocale) {
    const reportRecipientTimezone = lodashGet(participant, 'timezone', CONST.DEFAULT_TIME_ZONE);
    const reportTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale, null, reportRecipientTimezone.selected);
    const currentTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale);
    const reportRecipientDay = DateUtils.formatToDayOfWeek(reportTimezone);
    const currentUserDay = DateUtils.formatToDayOfWeek(currentTimezone);
    if (reportRecipientDay !== currentUserDay) {
        return `${DateUtils.formatToLocalTime(reportTimezone)} ${reportRecipientDay}`;
    }
    return `${DateUtils.formatToLocalTime(reportTimezone)}`;
}

function ParticipantLocalTime(props) {
    const {participant, preferredLocale, translate} = props;

    const [localTime, setLocalTime] = useState(() => getParticipantLocalTime(participant, preferredLocale));
    useEffect(() => {
        const timer = Timers.register(
            setInterval(() => {
                setLocalTime(getParticipantLocalTime(participant, preferredLocale));
            }, 1000),
        );
        return () => {
            clearInterval(timer);
        };
    }, [participant, preferredLocale]);

    const reportRecipientDisplayName = lodashGet(props, 'participant.firstName') || lodashGet(props, 'participant.displayName');

    return (
        <View style={[styles.chatItemComposeSecondaryRow]}>
            <Text
                style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset, styles.pre]}
                numberOfLines={1}
            >
                {translate('reportActionCompose.localTime', {
                    user: reportRecipientDisplayName,
                    time: localTime,
                })}
            </Text>
        </View>
    );
}

ParticipantLocalTime.propTypes = propTypes;
ParticipantLocalTime.displayName = 'ParticipantLocalTime';

export default withLocalize(ParticipantLocalTime);
