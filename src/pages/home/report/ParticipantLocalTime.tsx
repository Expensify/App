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
};

function getParticipantLocalTime(participant: PersonalDetails, preferredLocale: Locale) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    const reportRecipientTimezone = participant.timezone || CONST.DEFAULT_TIME_ZONE;
    const reportTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale, undefined, reportRecipientTimezone.selected);
    const currentTimezone = DateUtils.getLocalDateFromDatetime(preferredLocale);
    const reportRecipientDay = DateUtils.formatToDayOfWeek(reportTimezone);
    const currentUserDay = DateUtils.formatToDayOfWeek(currentTimezone);
    if (reportRecipientDay !== currentUserDay) {
        return `${DateUtils.formatToLocalTime(reportTimezone)} ${reportRecipientDay}`;
    }
    return `${DateUtils.formatToLocalTime(reportTimezone)}`;
}

function ParticipantLocalTime({participant}: ParticipantLocalTimeProps) {
    const {translate, preferredLocale} = useLocalize();
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

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
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
