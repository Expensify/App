import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNow from '@hooks/useNow';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import type {LocaleContextProps} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Locale} from '@src/CONST/LOCALES';
import type {PersonalDetails} from '@src/types/onyx';

type ParticipantLocalTimeProps = {
    /** Personal details of the participant */
    participant: PersonalDetails;
};

function getParticipantLocalTime(participant: PersonalDetails, getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'], locale: Locale, now: Date) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    const reportRecipientTimezone = participant.timezone || CONST.DEFAULT_TIME_ZONE;
    const nowIso = now.toISOString();
    const reportTimezone = getLocalDateFromDatetime(nowIso, reportRecipientTimezone.selected);
    const currentTimezone = getLocalDateFromDatetime(nowIso);
    const reportRecipientDay = DateUtils.formatToDayOfWeek(reportTimezone, locale);
    const currentUserDay = DateUtils.formatToDayOfWeek(currentTimezone, locale);
    if (reportRecipientDay !== currentUserDay) {
        return `${DateUtils.formatToLocalTime(reportTimezone, locale)} ${reportRecipientDay}`;
    }
    return `${DateUtils.formatToLocalTime(reportTimezone, locale)}`;
}

function ParticipantLocalTime({participant}: ParticipantLocalTimeProps) {
    const {translate, getLocalDateFromDatetime, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const now = useNow();

    const localTime = getParticipantLocalTime(participant, getLocalDateFromDatetime, preferredLocale, now);

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
                {translate('reportActionCompose.localTime', reportRecipientDisplayName, localTime)}
            </Text>
        </View>
    );
}

export default ParticipantLocalTime;
