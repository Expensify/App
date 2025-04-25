import {useRoute} from '@react-navigation/native';
import {compareAsc, format, getMonth, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ScheduleCallParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    const route = useRoute<PlatformStackRouteProp<ScheduleCallParamList, typeof SCREENS.SCHEDULE_CALL.BOOK_CALL>>();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone: Timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`);
    const reportID = route.params?.reportID;
    const [adminReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: (data) => ({
            calendlySchedule: data?.calendlySchedule,
        }),
    });
    const [adminRoomsReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const calendlySchedule = adminReportNameValuePairs?.calendlySchedule;

    const [containerWidth, setContainerWidth] = useState(0);
    const slotWidthStyle = styleUtils.getRowChildWidth(2, 8, containerWidth);

    useEffect(() => {
        if (!reportID) {
            return;
        }
        getGuideCallAvailabilitySchedule(adminRoomsReport?.policyID, reportID, currentUserPersonalDetails.accountID);
    }, [reportID, adminRoomsReport?.policyID, currentUserPersonalDetails.accountID]);

    const loadTimeSlotsAndSaveDate = useCallback((date: string) => {
        saveBookingDraft({date});
    }, []);

    const timeSlotDateMap: Record<string, TimeSlot[]> = useMemo(() => {
        if (!calendlySchedule?.data) {
            return {};
        }
        const guides =  Object.keys(calendlySchedule?.data);

        const allTimeSlots = guides?.reduce((allSlots, guideAccountID) => {
            const guideSchedule = calendlySchedule?.data?.[guideAccountID];
            guideSchedule?.timeSlots.forEach((timeSlot) => {
                allSlots.push({
                    guideAccountID: Number(guideAccountID),
                    guideEmail: guideSchedule.guideEmail,
                    startTime: timeSlot.startTime,
                    scheduleUrl: timeSlot.schedulingURL,
                });
            });
            return allSlots;
        }, [] as TimeSlot[]);

        const timeSlotMap: Record<string, TimeSlot[]> = {};
        allTimeSlots.forEach((timeSlot) => {
            const timeSlotDate = format(new Date(timeSlot?.startTime), CONST.DATE.FNS_FORMAT_STRING);
            if (!timeSlotMap[timeSlotDate]) {
                timeSlotMap[timeSlotDate] = [];
            }
            timeSlotMap[timeSlotDate].push(timeSlot);
        });
        return timeSlotMap;
    }, [calendlySchedule]);

    const selectableDates = Object.keys(timeSlotDateMap).sort(compareAsc);
    const firstDate =  selectableDates.at(0);
    const lastDate =  selectableDates.at(selectableDates.length - 1);
    const minDate = firstDate ? parse(firstDate,  CONST.DATE.FNS_FORMAT_STRING, new Date()): undefined;
    const maxDate = lastDate ? parse(lastDate, CONST.DATE.FNS_FORMAT_STRING, new Date()) : undefined;
    const timeSlotsForSelectedData = scheduleCallDraft?.date ? timeSlotDateMap?.[scheduleCallDraft?.date] ?? [] : [];

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (calendlySchedule?.isLoading || !firstDate || scheduleCallDraft?.date) {
            return;
        }
        saveBookingDraft({date: firstDate});
    }, [firstDate, calendlySchedule?.isLoading, scheduleCallDraft?.date]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ScheduleCallPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('schdeuledCall.book.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {adminReportNameValuePairs?.calendlySchedule?.isLoading ? (
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <ScrollView style={styles.flexGrow1}>
                    <View style={styles.ph5}>
                        <Text style={styles.mb5}>{translate('schdeuledCall.book.description')}</Text>
                        <View
                            style={[styles.datePickerPopover, styles.border]}
                            collapsable={false}
                        >
                            <CalendarPicker
                                value={scheduleCallDraft?.date}
                                minDate={minDate}
                                maxDate={maxDate}
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
                    {!isEmptyObject(adminReportNameValuePairs?.calendlySchedule?.errors) && (
                        <DotIndicatorMessage
                            type="error"
                            style={[styles.mt6, styles.flex0]}
                            messages={getLatestError(adminReportNameValuePairs?.calendlySchedule?.errors)}
                        />
                    )}
                    {!!scheduleCallDraft?.date && (
                        <View style={[styles.ph5, styles.mb5]}>
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
                                                reportID,
                                            });
                                            Navigation.navigate(ROUTES.SCHEDULE_CALL_CONFIRMATON.getRoute(reportID));
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
            )}
        </ScreenWrapper>
    );
}

ScheduleCallPage.displayName = 'ScheduleCallPage';

export default ScheduleCallPage;
