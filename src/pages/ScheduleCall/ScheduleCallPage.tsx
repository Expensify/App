import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getGuideCallAvailabilitySchedule, saveBookingDraft} from '@libs/actions/ScheduleCall';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import AvailableBookingDay from './AvailableBookingDay';

type TimeSlot = {
    guideAccountID: number;
    guideEmail: string;
    startTime: string;
    scheduleUrl: string;
};

function ScheduleCallPage() {
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone: Timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

    const today = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, {initialValue: {date: today}});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [adminReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${account?.adminsRoomReportID}`);
    const [adminRoomsReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${account?.adminsRoomReportID}`);

    const [containerWidth, setContainerWidth] = useState(0);
    const slotWidthStyle = styleUtils.getRowChildWidth(2, 8, containerWidth);

    const timeSlotDateMap: Record<string, TimeSlot[]> = useMemo(() => {
        if (!adminReportNameValuePairs?.calendlySchedule) {
            return {};
        }
        const guides = Object.keys(adminReportNameValuePairs?.calendlySchedule);

        const allTimeSlots = guides?.reduce((allSlots, guideAccountID) => {
            const guideSchedule = adminReportNameValuePairs?.calendlySchedule?.[guideAccountID];
            guideSchedule?.timeSlots.forEach((timeSlot) => {
                allSlots.push({
                    guideAccountID: Number(guideAccountID),
                    guideEmail: guideSchedule.guideEmail,
                    startTime: timeSlot.start_time,
                    scheduleUrl: timeSlot.scheduling_url,
                });
            });
            return allSlots;
        }, [] as TimeSlot[]);

        const timeSlotMap: Record<string, TimeSlot[]> = {};
        allTimeSlots.forEach(timeSlot => {
            const timeSlotDate = format(new Date(timeSlot?.startTime), CONST.DATE.FNS_FORMAT_STRING);
            if(!timeSlotMap[timeSlotDate]){
                timeSlotMap[timeSlotDate] = [];
            }
            timeSlotMap[timeSlotDate].push(timeSlot);
        });
        return timeSlotMap;
    }, [adminReportNameValuePairs?.calendlySchedule]);

    useEffect(() => {
        if (!account?.adminsRoomReportID) {
            return;
        }
        getGuideCallAvailabilitySchedule(adminRoomsReport?.policyID, account?.adminsRoomReportID, currentUserPersonalDetails.accountID, 2);
    }, [account?.adminsRoomReportID, adminRoomsReport?.policyID, currentUserPersonalDetails.accountID]);

    const loadTimeSlotsAndSaveDate = useCallback((date: string) => {
        saveBookingDraft({date});
    }, []);

    const timeSlotsForSelectedData =  scheduleCallDraft?.date ? timeSlotDateMap?.[scheduleCallDraft?.date] ?? [] : [];

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ScheduleCallPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('schdeuledCall.book.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={styles.flexGrow1}>
                <View style={styles.ph5}>
                    <Text style={styles.mb5}>{translate('schdeuledCall.book.description')}</Text>
                    <View
                        style={[styles.datePickerPopover, styles.border]}
                        collapsable={false}
                    >
                        <CalendarPicker
                            value={scheduleCallDraft?.date}
                            selectedableDates={Object.keys(timeSlotDateMap)}
                            DayComponent={AvailableBookingDay}
                            onSelected={loadTimeSlotsAndSaveDate}
                        />
                    </View>
                </View>
                <MenuItemWithTopDescription
                    title={timezone.selected}
                    description={translate('timezonePage.timezone')}
                    style={[styles.mt3, styles.mb3]}
                />
                {!!scheduleCallDraft?.date && (
                    <View style={styles.ph5}>
                        <Text style={[styles.mb5]}>{translate('schdeuledCall.book.slots', {date: format(scheduleCallDraft.date, CONST.DATE.MONTH_DAY_YEAR_FORMAT)})}</Text>
                        <View
                            style={[styles.flexRow, styles.flexWrap, styles.justifyContentStart, styles.gap2]}
                            onLayout={({
                                nativeEvent: {
                                    layout: {width},
                                },
                            }) => {
                                setContainerWidth(width);
                            }}
                        >
                            {timeSlotsForSelectedData.map((timeSlot: TimeSlot) => (
                                <Button
                                    key={`time-slot-${timeSlot.startTime}`}
                                    large
                                    success={scheduleCallDraft?.slotTime === timeSlot?.startTime}
                                    onPress={() => {
                                        saveBookingDraft({
                                            slotTime: timeSlot.startTime,
                                            guide: {
                                                scheduleUrl: timeSlot.scheduleUrl,
                                                accountID: timeSlot.guideAccountID,
                                                email: timeSlot.guideEmail,
                                            },
                                            reportID: account?.adminsRoomReportID
                                        });
                                        Navigation.navigate(ROUTES.SCHEDULE_CALL_CONFIRMATON);
                                    }}
                                    shouldEnableHapticFeedback
                                    style={[slotWidthStyle]}
                                    text={format(timeSlot.startTime, 'p')}
                                />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

ScheduleCallPage.displayName = 'ScheduleCallPage';

export default ScheduleCallPage;
