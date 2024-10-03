import {addMonths, endOfDay, endOfMonth, format, getYear, isSameDay, parseISO, setDate, setYear, startOfDay, startOfMonth, subMonths} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import ArrowIcon from './ArrowIcon';
import generateMonthMatrix from './generateMonthMatrix';
import type CalendarPickerListItem from './types';
import YearPickerModal from './YearPickerModal';

type CalendarPickerProps = {
    /** An initial value of date string */
    value?: Date | string;

    /** A minimum date (oldest) allowed to select */
    minDate?: Date;

    /** A maximum date (earliest) allowed to select */
    maxDate?: Date;

    /** A function called when the date is selected */
    onSelected?: (selectedDate: string) => void;
};

function getInitialCurrentDateView(value: Date | string, minDate: Date, maxDate: Date) {
    let initialCurrentDateView = typeof value === 'string' ? parseISO(value) : new Date(value);

    if (maxDate < initialCurrentDateView) {
        initialCurrentDateView = maxDate;
    } else if (minDate > initialCurrentDateView) {
        initialCurrentDateView = minDate;
    }

    return initialCurrentDateView;
}

function CalendarPicker({
    value = new Date(),
    minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    onSelected,
}: CalendarPickerProps) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {preferredLocale, translate} = useLocalize();

    const [currentDateView, setCurrentDateView] = useState(getInitialCurrentDateView(value, minDate, maxDate));

    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);

    const minYear = getYear(new Date(minDate));
    const maxYear = getYear(new Date(maxDate));

    const [years, setYears] = useState<CalendarPickerListItem[]>(
        Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear).map((year) => ({
            text: year.toString(),
            value: year,
            keyForList: year.toString(),
            isSelected: year === currentDateView.getFullYear(),
        })),
    );

    const onYearSelected = (year: number) => {
        setIsYearPickerVisible(false);
        setCurrentDateView((prev) => {
            const newCurrentDateView = setYear(new Date(prev), year);
            setYears((prevYears) =>
                prevYears.map((item) => ({
                    ...item,
                    isSelected: item.value === newCurrentDateView.getFullYear(),
                })),
            );
            return newCurrentDateView;
        });
    };

    /**
     * Calls the onSelected function with the selected date.
     * @param day - The day of the month that was selected.
     */
    const onDayPressed = (day: number) => {
        setCurrentDateView((prev) => {
            const newCurrentDateView = setDate(new Date(prev), day);
            onSelected?.(format(new Date(newCurrentDateView), CONST.DATE.FNS_FORMAT_STRING));
            return newCurrentDateView;
        });
    };

    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    const moveToPrevMonth = () => {
        setCurrentDateView((prev) => {
            const prevMonth = subMonths(new Date(prev), 1);
            // if year is subtracted, we need to update the years list
            if (prevMonth.getFullYear() < prev.getFullYear()) {
                setYears((prevYears) =>
                    prevYears.map((item) => ({
                        ...item,
                        isSelected: item.value === prevMonth.getFullYear(),
                    })),
                );
            }
            return prevMonth;
        });
    };

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    const moveToNextMonth = () => {
        setCurrentDateView((prev) => {
            const nextMonth = addMonths(new Date(prev), 1);
            // if year is added, we need to update the years list
            if (nextMonth.getFullYear() > prev.getFullYear()) {
                setYears((prevYears) =>
                    prevYears.map((item) => ({
                        ...item,
                        isSelected: item.value === nextMonth.getFullYear(),
                    })),
                );
            }

            return nextMonth;
        });
    };

    const monthNames = DateUtils.getMonthNames(preferredLocale).map((month) => Str.recapitalize(month));
    const daysOfWeek = DateUtils.getDaysOfWeek(preferredLocale).map((day) => day.toUpperCase());
    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
    const hasAvailableDatesNextMonth = startOfDay(new Date(maxDate)) > endOfMonth(new Date(currentDateView));
    const hasAvailableDatesPrevMonth = endOfDay(new Date(minDate)) < startOfMonth(new Date(currentDateView));

    return (
        <View>
            <View
                style={[themeStyles.calendarHeader, themeStyles.flexRow, themeStyles.justifyContentBetween, themeStyles.alignItemsCenter, themeStyles.ph4, themeStyles.pr1]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <PressableWithFeedback
                    onPress={() => setIsYearPickerVisible(true)}
                    style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentStart]}
                    wrapperStyle={[themeStyles.alignItemsCenter]}
                    hoverDimmingValue={1}
                    testID="currentYearButton"
                    accessibilityLabel={translate('common.currentYear')}
                >
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentYearText"
                        accessibilityLabel={translate('common.currentYear')}
                    >
                        {currentYearView}
                    </Text>
                    <ArrowIcon />
                </PressableWithFeedback>
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentEnd]}>
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentMonthText"
                        accessibilityLabel={translate('common.currentMonth')}
                    >
                        {monthNames.at(currentMonthView)}
                    </Text>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-month-arrow"
                        disabled={!hasAvailableDatesPrevMonth}
                        onPress={moveToPrevMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.previous')}
                    >
                        <ArrowIcon
                            disabled={!hasAvailableDatesPrevMonth}
                            direction={CONST.DIRECTION.LEFT}
                        />
                    </PressableWithFeedback>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="next-month-arrow"
                        disabled={!hasAvailableDatesNextMonth}
                        onPress={moveToNextMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.next')}
                    >
                        <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                    </PressableWithFeedback>
                </View>
            </View>
            <View style={themeStyles.flexRow}>
                {daysOfWeek.map((dayOfWeek) => (
                    <View
                        key={dayOfWeek}
                        style={[themeStyles.calendarDayRoot, themeStyles.flex1, themeStyles.justifyContentCenter, themeStyles.alignItemsCenter]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        <Text style={themeStyles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                    </View>
                ))}
            </View>
            {calendarDaysMatrix?.map((week) => (
                <View
                    key={`week-${week.toString()}`}
                    style={themeStyles.flexRow}
                >
                    {week.map((day, index) => {
                        const currentDate = new Date(currentYearView, currentMonthView, day);
                        const isBeforeMinDate = currentDate < startOfDay(new Date(minDate));
                        const isAfterMaxDate = currentDate > startOfDay(new Date(maxDate));
                        const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;
                        const isSelected = !!day && isSameDay(parseISO(value.toString()), new Date(currentYearView, currentMonthView, day));
                        const handleOnPress = () => {
                            if (!day) {
                                return;
                            }

                            onDayPressed(day);
                        };
                        const key = `${index}_day-${day}`;
                        return (
                            <PressableWithoutFeedback
                                key={key}
                                disabled={isDisabled}
                                onPress={handleOnPress}
                                style={themeStyles.calendarDayRoot}
                                accessibilityLabel={day?.toString() ?? ''}
                                tabIndex={day ? 0 : -1}
                                accessible={!!day}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >
                                {({hovered, pressed}) => (
                                    <View
                                        style={[
                                            themeStyles.calendarDayContainer,
                                            isSelected ? themeStyles.buttonDefaultBG : {},
                                            !isDisabled ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)) : {},
                                        ]}
                                    >
                                        <Text style={isDisabled ? themeStyles.buttonOpacityDisabled : {}}>{day}</Text>
                                    </View>
                                )}
                            </PressableWithoutFeedback>
                        );
                    })}
                </View>
            ))}
            <YearPickerModal
                isVisible={isYearPickerVisible}
                years={years}
                currentYear={currentYearView}
                onYearChange={onYearSelected}
                onClose={() => setIsYearPickerVisible(false)}
            />
        </View>
    );
}

export default CalendarPicker;
