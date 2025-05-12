import {useFocusEffect, useRoute} from '@react-navigation/native';
import {compareAsc, format, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
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
    scheduleURL: string;
};

function ScheduleCallPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<ScheduleCallParamList, typeof SCREENS.SCHEDULE_CALL.BOOK>>();

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const timezone: Timezone = currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

    const [scheduleCallDraft] = useOnyx(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, {canBeMissing: true});
    const reportID = route.params?.reportID;
    const [adminReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {
        selector: (data) => ({
            calendlySchedule: data?.calendlySchedule,
        }),
        canBeMissing: true,
    });
    const calendlySchedule = adminReportNameValuePairs?.calendlySchedule;

    useEffect(() => {
        if (!reportID) {
            return;
        }
        getGuideCallAvailabilitySchedule(reportID);
    }, [reportID]);

    // Clear selected time when user comes back to the selection screen
    useFocusEffect(
        useCallback(() => {
            saveBookingDraft({timeSlot: null});
        }, []),
    );

    const loadTimeSlotsAndSaveDate = useCallback((date: string) => {
        saveBookingDraft({date});
    }, []);

    const timeSlotDateMap: Record<string, TimeSlot[]> = useMemo(() => {
        if (!calendlySchedule?.data) {
            return {};
        }
        const guides = Object.keys(calendlySchedule?.data);

        const allTimeSlots = guides?.reduce((allSlots, guideAccountID) => {
            const guideSchedule = calendlySchedule?.data?.[guideAccountID];
            guideSchedule?.timeSlots.forEach((timeSlot) => {
                allSlots.push({
                    guideAccountID: Number(guideAccountID),
                    guideEmail: guideSchedule.guideEmail,
                    startTime: timeSlot.startTime,
                    scheduleURL: timeSlot.schedulingURL,
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
    const firstDate = selectableDates.at(0);
    const lastDate = selectableDates.at(selectableDates.length - 1);
    const minDate = firstDate ? parse(firstDate, CONST.DATE.FNS_FORMAT_STRING, new Date()) : undefined;
    const maxDate = lastDate ? parse(lastDate, CONST.DATE.FNS_FORMAT_STRING, new Date()) : undefined;
    const timeSlotsForSelectedData = scheduleCallDraft?.date ? timeSlotDateMap?.[scheduleCallDraft?.date] ?? [] : [];

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (calendlySchedule?.isLoading || !firstDate || scheduleCallDraft?.date) {
            return;
        }
        saveBookingDraft({date: firstDate});
    }, [firstDate, calendlySchedule?.isLoading, scheduleCallDraft?.date]);

    // When there is only one time slot on the row, it will take full width of the row, use a hidden filler item to keep 2 columns
    const timeFillerItem = useMemo(() => {
        if (timeSlotsForSelectedData.length % 2 === 0) {
            return null;
        }

        return (
            <View
                key="time-filler-col"
                aria-hidden
                accessibilityElementsHidden
                style={[styles.twoColumnLayoutCol, styles.visibilityHidden]}
            />
        );
    }, [styles.twoColumnLayoutCol, styles.visibilityHidden, timeSlotsForSelectedData.length]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ScheduleCallPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('scheduledCall.book.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FullPageOfflineBlockingView>
                {adminReportNameValuePairs?.calendlySchedule?.isLoading ? (
                    <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <ScrollView style={styles.flexGrow1}>
                        <View style={styles.ph5}>
                            <Text style={[styles.mb5, styles.colorMuted]}>{translate('scheduledCall.book.description')}</Text>
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
                            interactive={false}
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
                                <Text style={[styles.mb5, styles.colorMuted]}>
                                    {translate('scheduledCall.book.slots')}
                                    <Text style={[styles.textStrong, styles.colorMuted]}>{format(scheduleCallDraft.date, CONST.DATE.MONTH_DAY_YEAR_FORMAT)}</Text>
                                </Text>
                                <View style={[styles.flexRow, styles.flexWrap, styles.justifyContentStart, styles.gap2]}>
                                    {timeSlotsForSelectedData.map((timeSlot: TimeSlot) => (
                                        <Button
                                            key={`time-slot-${timeSlot.startTime}`}
                                            large
                                            success={scheduleCallDraft?.timeSlot === timeSlot?.startTime}
                                            onPress={() => {
                                                saveBookingDraft({
                                                    timeSlot: timeSlot.startTime,
                                                    guide: {
                                                        scheduleURL: timeSlot.scheduleURL,
                                                        accountID: timeSlot.guideAccountID,
                                                        email: timeSlot.guideEmail,
                                                    },
                                                    reportID,
                                                });
                                                Navigation.navigate(ROUTES.SCHEDULE_CALL_CONFIRMATON.getRoute(reportID));
                                            }}
                                            shouldEnableHapticFeedback
                                            style={styles.twoColumnLayoutCol}
                                            text={format(timeSlot.startTime, 'p')}
                                        />
                                    ))}
                                    {timeFillerItem}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

ScheduleCallPage.displayName = 'ScheduleCallPage';

export default ScheduleCallPage;
