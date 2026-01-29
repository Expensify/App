import {addMonths, endOfDay, endOfMonth, format, getYear, isSameDay, parseISO, setDate, setYear, startOfDay, startOfMonth, subMonths} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ArrowIcon from './ArrowIcon';
import Day from './Day';
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

    /** Restrict selection to only specific dates */
    selectableDates?: string[];

    /** Day component to render for dates */
    DayComponent?: typeof Day;

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
    DayComponent = Day,
    selectableDates,
}: CalendarPickerProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const pressableRef = useRef<View>(null);
    const [currentDateView, setCurrentDateView] = useState(() => getInitialCurrentDateView(value, minDate, maxDate));
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
    const isFirstRender = useRef(true);

    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
    const initialHeight = (calendarDaysMatrix?.length || CONST.MAX_CALENDAR_PICKER_ROWS) * CONST.CALENDAR_PICKER_DAY_HEIGHT;
    const heightValue = useSharedValue(initialHeight);

    const minYear = getYear(new Date(minDate));
    const maxYear = getYear(new Date(maxDate));

    const [years, setYears] = useState<CalendarPickerListItem[]>(() =>
        Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear).map((year) => ({
            text: year.toString(),
            value: year,
            keyForList: year.toString(),
            isSelected: year === currentDateView.getFullYear(),
        })),
    );

    const onYearSelected = (year: number) => {
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
        requestAnimationFrame(() => setIsYearPickerVisible(false));
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

    const monthNames = DateUtils.getMonthNames().map((month) => Str.UCFirst(month));
    const daysOfWeek = DateUtils.getDaysOfWeek().map((day) => day.toUpperCase());
    const hasAvailableDatesNextMonth = startOfDay(new Date(maxDate)) > endOfMonth(new Date(currentDateView));
    const hasAvailableDatesPrevMonth = endOfDay(new Date(minDate)) < startOfMonth(new Date(currentDateView));

    useEffect(() => {
        if (isSmallScreenWidth || isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const rowCount = calendarDaysMatrix?.length || CONST.MAX_CALENDAR_PICKER_ROWS;
        const newHeight = rowCount * CONST.CALENDAR_PICKER_DAY_HEIGHT;

        heightValue.set(withTiming(newHeight, {duration: 50}));
    }, [calendarDaysMatrix?.length, heightValue, isSmallScreenWidth]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: heightValue.get(),
        };
    });

    const webOnlyMarginStyle = isSmallScreenWidth ? {} : styles.mh1;
    const calendarContainerStyle = isSmallScreenWidth ? [webOnlyMarginStyle, themeStyles.calendarBodyContainer] : [webOnlyMarginStyle, animatedStyle];

    const getAccessibilityState = useCallback((isSelected: boolean) => ({selected: isSelected}), []);

    return (
        <View style={[themeStyles.pb4]}>
            <View
                style={[themeStyles.calendarHeader, themeStyles.flexRow, themeStyles.justifyContentBetween, themeStyles.alignItemsCenter, themeStyles.ph5]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <PressableWithFeedback
                    onPress={() => {
                        pressableRef?.current?.blur();
                        setIsYearPickerVisible(true);
                    }}
                    ref={pressableRef}
                    style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentStart]}
                    wrapperStyle={[themeStyles.alignItemsCenter]}
                    hoverDimmingValue={1}
                    disabled={years.length <= 1}
                    testID="currentYearButton"
                    accessibilityLabel={`${currentYearView}, ${translate('common.currentYear')}`}
                    role={CONST.ROLE.BUTTON}
                >
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentYearText"
                    >
                        {currentYearView}
                    </Text>
                    <ArrowIcon disabled={years.length <= 1} />
                </PressableWithFeedback>
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentEnd, themeStyles.mrn2]}>
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentMonthText"
                        accessibilityLabel={`${monthNames.at(currentMonthView)}, ${translate('common.currentMonth')}`}
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
                        role={CONST.ROLE.BUTTON}
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
                        role={CONST.ROLE.BUTTON}
                    >
                        <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                    </PressableWithFeedback>
                </View>
            </View>
            <View style={[themeStyles.flexRow, webOnlyMarginStyle]}>
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
            <Animated.View style={calendarContainerStyle}>
                {calendarDaysMatrix?.map((week) => (
                    <View
                        key={`week-${week.toString()}`}
                        style={[themeStyles.flexRow, themeStyles.calendarWeekContainer]}
                    >
                        {week.map((day, index) => {
                            const currentDate = new Date(currentYearView, currentMonthView, day);
                            const isBeforeMinDate = currentDate < startOfDay(new Date(minDate));
                            const isAfterMaxDate = currentDate > startOfDay(new Date(maxDate));
                            const isSelectable = selectableDates ? selectableDates?.some((date) => isSameDay(parseISO(date), currentDate)) : true;
                            const isDisabled = !day || isBeforeMinDate || isAfterMaxDate || !isSelectable;
                            const isSelected = !!day && isSameDay(parseISO(value.toString()), new Date(currentYearView, currentMonthView, day));
                            const handleOnPress = () => {
                                if (!day || isDisabled) {
                                    return;
                                }

                                onDayPressed(day);
                            };
                            const key = `${index}_day-${day}`;
                            const fullDate = day ? new Date(currentYearView, currentMonthView, day) : null;
                            const accessibilityDateLabel = fullDate ? DateUtils.formatToLongDateWithWeekday(fullDate) : '';
                            return (
                                <PressableWithoutFeedback
                                    key={key}
                                    disabled={isDisabled}
                                    onPress={handleOnPress}
                                    style={themeStyles.calendarDayRoot}
                                    accessibilityLabel={accessibilityDateLabel}
                                    accessibilityState={getAccessibilityState(isSelected)}
                                    aria-selected={isSelected}
                                    tabIndex={day ? 0 : -1}
                                    accessible={!!day}
                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    role={CONST.ROLE.BUTTON}
                                >
                                    {({hovered, pressed}) => (
                                        <DayComponent
                                            selected={isSelected}
                                            disabled={isDisabled}
                                            hovered={hovered}
                                            pressed={pressed}
                                        >
                                            {day}
                                        </DayComponent>
                                    )}
                                </PressableWithoutFeedback>
                            );
                        })}
                    </View>
                ))}
            </Animated.View>
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
