import {useRoute} from '@react-navigation/native';
import {addMinutes, format} from 'date-fns';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmBooking} from '@libs/actions/ScheduleCall';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ScheduleCallParamList} from '@libs/Navigation/types';
import {getDefaultAvatarURL} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';

function ScheduleCallConfirmationPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const userTimezone = currentUserPersonalDetails?.timezone?.selected ? currentUserPersonalDetails?.timezone.selected : CONST.DEFAULT_TIME_ZONE.selected;

    const personalDetails = usePersonalDetails();
    const route = useRoute<PlatformStackRouteProp<ScheduleCallParamList, typeof SCREENS.SCHEDULE_CALL.CONFIRMATION>>();

    const confirm = useCallback(() => {
        if (!scheduleCallDraft?.timeSlot || !scheduleCallDraft?.date || !scheduleCallDraft.guide || !scheduleCallDraft.reportID) {
            return;
        }
        confirmBooking(
            {
                date: scheduleCallDraft.date,
                timeSlot: scheduleCallDraft.timeSlot,
                guide: scheduleCallDraft.guide,
                reportID: scheduleCallDraft.reportID,
            },
            currentUserPersonalDetails,
            userTimezone,
        );
    }, [currentUserPersonalDetails, scheduleCallDraft, userTimezone]);

    const guideDetails: PersonalDetails | null = useMemo(
        () =>
            scheduleCallDraft?.guide?.accountID
                ? (personalDetails?.[scheduleCallDraft.guide.accountID] ?? {
                      accountID: scheduleCallDraft.guide.accountID,
                      login: scheduleCallDraft.guide.email,
                      displayName: scheduleCallDraft.guide.email,
                      avatar: getDefaultAvatarURL(scheduleCallDraft.guide.accountID),
                  })
                : null,
        [personalDetails, scheduleCallDraft?.guide?.accountID, scheduleCallDraft?.guide?.email],
    );

    const dateTimeString = useMemo(() => {
        if (!scheduleCallDraft?.timeSlot || !scheduleCallDraft.date) {
            return '';
        }
        const dateString = format(scheduleCallDraft.date, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
        const timeString = `${DateUtils.formatInTimeZoneWithFallback(scheduleCallDraft?.timeSlot, userTimezone, CONST.DATE.LOCAL_TIME_FORMAT)} - ${DateUtils.formatInTimeZoneWithFallback(
            addMinutes(scheduleCallDraft?.timeSlot, 30),
            userTimezone,
            CONST.DATE.LOCAL_TIME_FORMAT,
        )}`;

        const timezoneString = DateUtils.getZoneAbbreviation(new Date(scheduleCallDraft?.timeSlot), userTimezone);

        return `${dateString} from ${timeString} ${timezoneString}`;
    }, [scheduleCallDraft?.date, scheduleCallDraft?.timeSlot, userTimezone]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ScheduleCallConfirmationPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('scheduledCall.confirmation.title')}
                onBackButtonPress={() => {
                    if (!route?.params?.reportID) {
                        return;
                    }
                    Navigation.goBack(ROUTES.SCHEDULE_CALL_BOOK.getRoute(route?.params?.reportID));
                }}
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <Text style={[styles.mb5, styles.ph5, styles.colorMuted]}>{translate('scheduledCall.confirmation.description')}</Text>
                    <MenuItem
                        style={styles.mb3}
                        title={guideDetails?.displayName}
                        description={guideDetails?.login}
                        label={translate('scheduledCall.confirmation.setupSpecialist')}
                        interactive={false}
                        icon={[
                            {
                                id: guideDetails?.accountID,
                                source: guideDetails?.avatarThumbnail ?? guideDetails?.avatar ?? guideDetails?.fallbackIcon ?? FallbackAvatar,
                                name: guideDetails?.login,
                                type: CONST.ICON_TYPE_AVATAR,
                            },
                        ]}
                    />
                    <MenuItemWithTopDescription
                        title={dateTimeString}
                        description={translate('scheduledCall.confirmation.dateTime')}
                        shouldTruncateTitle={false}
                        numberOfLinesTitle={2}
                        shouldShowRightIcon
                        style={styles.mb3}
                        onPress={() => {
                            if (!route?.params?.reportID) {
                                return;
                            }
                            Navigation.goBack(ROUTES.SCHEDULE_CALL_BOOK.getRoute(route?.params?.reportID));
                        }}
                    />
                    <MenuItemWithTopDescription
                        title={translate('scheduledCall.confirmation.minutes')}
                        description={translate('scheduledCall.confirmation.meetingLength')}
                        interactive={false}
                        style={styles.mb3}
                    />
                </ScrollView>
                <FixedFooter>
                    <Button
                        success
                        large
                        text={translate('scheduledCall.confirmation.title')}
                        onPress={confirm}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

ScheduleCallConfirmationPage.displayName = 'ScheduleCallConfirmationPage';

export default ScheduleCallConfirmationPage;
