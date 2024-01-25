import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Timers from '@libs/Timers';
import type {Locale} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type ParticipantLocalTimeProps = {
    /** Personal details of the participant */
    participant: PersonalDetails;

    preferredLocale?: Locale;
};

function getParticipantLocalTime(participant: PersonalDetails, preferredLocale: Locale | undefined) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportRecipientTimezone = participant.timezone || CONST.DEFAULT_TIME_ZONE;
    const reportTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale ?? CONST.LOCALES.DEFAULT, undefined, reportRecipientTimezone.selected);
    const currentTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale ?? CONST.LOCALES.DEFAULT);
    const reportRecipientDay = DateUtils.formatToDayOfWeek(reportTimezone.toDateString());
    const currentUserDay = DateUtils.formatToDayOfWeek(currentTimezone.toDateString());
    if (reportRecipientDay !== currentUserDay) {
        return `${DateUtils.formatToLocalTime(reportTimezone)} ${reportRecipientDay}`;
    }
    return `${DateUtils.formatToLocalTime(reportTimezone)}`;
}

function ParticipantLocalTime({participant, preferredLocale}: ParticipantLocalTimeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
                {translate('reportActionCompose.localTime', {
                    user: reportRecipientDisplayName,
                    time: localTime,
                })}
            </Text>
        </View>
    );
}

ParticipantLocalTime.displayName = 'ParticipantLocalTime';

export default ParticipantLocalTime;
