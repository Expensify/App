import React, {useCallback, useMemo} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import { useOnyx } from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import { confirmBooking } from '@libs/actions/ScheduleCall';
import { usePersonalDetails } from '@components/OnyxProvider';
import { addMinutes, format } from 'date-fns';
import DateUtils from '@libs/DateUtils';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import type { Timezone } from '@src/types/onyx/PersonalDetails';

function ScheduleCallConfirmationPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone: Timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;
    const personalDetails = usePersonalDetails();

    const confirm = useCallback(() => {
        if(!scheduleCallDraft?.slotTime){
            return;
        }
        confirmBooking(scheduleCallDraft, currentUserPersonalDetails);
    }, [currentUserPersonalDetails, scheduleCallDraft]);

    const guideDetails = useMemo(() => scheduleCallDraft?.guide?.accountID ? personalDetails?.[scheduleCallDraft?.guide?.accountID]: null, [personalDetails, scheduleCallDraft?.guide?.accountID]);


    const dateTimeString = useMemo(() => {
        if(!scheduleCallDraft?.slotTime || !scheduleCallDraft.date){
            return '';
        }
        const dateString = format(scheduleCallDraft.date, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
        const timeString =  `${DateUtils.formatToLocalTime(scheduleCallDraft?.slotTime)} - ${DateUtils.formatToLocalTime(addMinutes(scheduleCallDraft?.slotTime, 30))}`;

        const timeZoneStirng = timezone.selected;

        return `${dateString} from ${timeString} ${timeZoneStirng}`;


    }, [scheduleCallDraft?.date, scheduleCallDraft?.slotTime, timezone.selected]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ScheduleCallConfirmationPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('schdeuledCall.confirmation.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                <Text style={[styles.mb5, styles.ph5]}>{translate('schdeuledCall.confirmation.description')}</Text>
                <MenuItem
                    style={styles.mb3}
                    title={guideDetails?.displayName}
                    description={guideDetails?.login}
                    label={translate('schdeuledCall.confirmation.setupSpecialist')}
                    interactive={false}
                    icon={[
                        {
                            id: guideDetails?.accountID,
                            source: guideDetails?.avatarThumbnail ?? guideDetails?.fallbackIcon ?? FallbackAvatar,
                            name: guideDetails?.login,
                            type: CONST.ICON_TYPE_AVATAR,
                        },
                    ]}
                />
                <MenuItemWithTopDescription
                    title={dateTimeString}
                    description={translate('schdeuledCall.confirmation.dateTime')}
                    shouldShowRightIcon
                    style={styles.mb3}
                    onPress={() => Navigation.goBack(ROUTES.SCHEDULE_CALL_BOOK)}
                />
                <MenuItemWithTopDescription
                    title="30 Minutes"
                    description={translate('schdeuledCall.confirmation.meetingLength')}
                    interactive={false}
                    style={styles.mb3}
                />
            </ScrollView>
            <FixedFooter>
                <Button
                    success
                    large
                    text={translate('schdeuledCall.confirmation.title')}
                    onPress={confirm}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ScheduleCallConfirmationPage.displayName = 'ScheduleCallConfirmationPage';

export default ScheduleCallConfirmationPage;
