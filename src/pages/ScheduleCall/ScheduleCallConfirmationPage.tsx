import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openPublicProfilePage} from '@libs/actions/PersonalDetails';
import {confirmBooking} from '@libs/actions/ScheduleCall';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ScheduleCallParamList} from '@libs/Navigation/types';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';

import {useRoute} from '@react-navigation/native';
import {addMinutes} from 'date-fns';
import React, {useEffect} from 'react';

function ScheduleCallConfirmationPage() {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const userTimezone = currentUserPersonalDetails?.timezone?.selected ? currentUserPersonalDetails?.timezone.selected : CONST.DEFAULT_TIME_ZONE.selected;

    const personalDetails = usePersonalDetails();
    const route = useRoute<PlatformStackRouteProp<ScheduleCallParamList, typeof SCREENS.SCHEDULE_CALL.CONFIRMATION>>();

    const confirm = () => {
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
    };

    const guideDetails: PersonalDetails | null = scheduleCallDraft?.guide?.accountID
        ? (personalDetails?.[scheduleCallDraft.guide.accountID] ?? {
              accountID: scheduleCallDraft.guide.accountID,
              login: scheduleCallDraft.guide.email,
              displayName: scheduleCallDraft.guide.email,
              avatar: getDefaultAvatarURL({
                  accountID: scheduleCallDraft.guide.accountID,
                  accountEmail: scheduleCallDraft.guide.email,
              }),
          })
        : null;

    let dateTimeString = '';
    if (scheduleCallDraft?.timeSlot && scheduleCallDraft.date) {
        const dateString = DateUtils.formatInTimeZoneWithFallback(scheduleCallDraft.date, userTimezone, CONST.DATE.MONTH_DAY_YEAR_FORMAT, {locale: dateFnsLocale});
        const timeString = `${DateUtils.formatTimeInTimeZoneWithPeriod(translate, scheduleCallDraft?.timeSlot, userTimezone)} - ${DateUtils.formatTimeInTimeZoneWithPeriod(
            translate,
            addMinutes(scheduleCallDraft?.timeSlot, 30),
            userTimezone,
        )}`;

        const timezoneString = DateUtils.getZoneAbbreviation(new Date(scheduleCallDraft?.timeSlot), userTimezone);

        dateTimeString = `${dateString} from ${timeString} ${timezoneString}`;
    }

    useEffect(() => {
        const guideAccountID = scheduleCallDraft?.guide?.accountID;
        if (guideAccountID && !personalDetails?.[guideAccountID]) {
            openPublicProfilePage(guideAccountID);
        }
    }, [scheduleCallDraft?.guide?.accountID, personalDetails]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID="ScheduleCallConfirmationPage"
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
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.gap3, styles.pb3]}>
                    <Text style={[styles.mb2, styles.ph5, styles.colorMuted]}>{translate('scheduledCall.confirmation.description')}</Text>
                    <MenuItemWithLabel label={translate('scheduledCall.confirmation.setupSpecialist')}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <ReportActionAvatars
                                    singleAvatarContainerStyle={[styles.actionAvatar]}
                                    accountIDs={[guideDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID]}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                {!!guideDetails?.displayName && <MenuItem.Title>{guideDetails.displayName}</MenuItem.Title>}
                                {!!guideDetails?.login && <MenuItem.Description>{guideDetails.login}</MenuItem.Description>}
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                    <MenuItemWithTopDescription
                        title={dateTimeString}
                        description={translate('scheduledCall.confirmation.dateTime')}
                        shouldTruncateTitle={false}
                        numberOfLinesTitle={2}
                        shouldShowRightIcon
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
                    />
                </ScrollView>
                <FixedFooter>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={confirm}
                    >
                        <Button.Text>{translate('scheduledCall.confirmation.title')}</Button.Text>
                    </Button>
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default ScheduleCallConfirmationPage;
