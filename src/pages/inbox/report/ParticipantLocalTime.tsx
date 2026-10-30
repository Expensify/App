import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import Timers from '@libs/Timers';

import type {LocaleContextProps} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type ParticipantLocalTimeProps = {
    participant: PersonalDetails;
};

function getParticipantLocalTime(participant: PersonalDetails, getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'], dateFnsLocale: LocaleContextProps['dateFnsLocale']) {
    const reportRecipientTimezone = participant.timezone ?? CONST.DEFAULT_TIME_ZONE;
    const reportTimezone = getLocalDateFromDatetime(undefined, reportRecipientTimezone.selected);
    const currentTimezone = getLocalDateFromDatetime();
    const reportRecipientDay = DateUtils.formatToDayOfWeek(reportTimezone, dateFnsLocale);
    const currentUserDay = DateUtils.formatToDayOfWeek(currentTimezone, dateFnsLocale);
    if (reportRecipientDay !== currentUserDay) {
        return `${DateUtils.formatToLocalTime(reportTimezone, dateFnsLocale)} ${reportRecipientDay}`;
    }
    return `${DateUtils.formatToLocalTime(reportTimezone, dateFnsLocale)}`;
}

function ParticipantLocalTime({participant}: ParticipantLocalTimeProps) {
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const styles = useThemeStyles();

    const [localTime, setLocalTime] = useState(() => getParticipantLocalTime(participant, getLocalDateFromDatetime, dateFnsLocale));
    useEffect(() => {
        const timer = Timers.register(
            setInterval(() => {
                setLocalTime(getParticipantLocalTime(participant, getLocalDateFromDatetime, dateFnsLocale));
            }, 1000),
        );
        return () => {
            clearInterval(timer);
        };
    }, [participant, getLocalDateFromDatetime, dateFnsLocale]);

    const reportRecipientDisplayName = participant.firstName || participant.displayName;

    if (!reportRecipientDisplayName) {
        return null;
    }

    return (
        <View style={[styles.chatItemComposeSecondaryRow]}>
            <Text
                style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset, styles.pre]}
                numberOfLines={1}
            >
                {translate('reportActionCompose.localTime', reportRecipientDisplayName, localTime)}
            </Text>
        </View>
    );
}

export default ParticipantLocalTime;
