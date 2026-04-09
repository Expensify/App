import {
    addMonths,
    addYears,
    endOfDay,
    endOfMonth,
    endOfYear,
    format,
    getYear,
    isSameDay,
    parseISO,
    setDate,
    setMonth,
    setYear,
    startOfDay,
    startOfMonth,
    startOfYear,
    subMonths,
    subYears,
} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
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
import MonthPickerModal from './MonthPickerModal';
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

    /** Optional style override for the header container */
    headerContainerStyle?: StyleProp<ViewStyle>;
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
    headerContainerStyle,
}: CalendarPickerProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const pressableRef = useRef<View>(null);
    const monthPressableRef = useRef<View>(null);
    const [currentDateView, setCurrentDateView] = useState(() => getInitialCurrentDateView(value, minDate, maxDate));
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
    const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
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

    const onMonthSelected = (month: number) => {
        setCurrentDateView((prev) => setMonth(new Date(prev), month));
        requestAnimationFrame(() => setIsMonthPickerVisible(false));
    };

    /**
     * Calls the onSelected function with the selected date.
     * @param day - The day of the month that was selected.
     */
    const onDayPressed = (day: number) => {
        const newCurrentDateView = setDate(new Date(currentDateView), day);
        setCurrentDateView(newCurrentDateView);
        onSelected?.(format(newCurrentDateView, CONST.DATE.FNS_FORMAT_STRING));
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

    const moveToPrevYear = () => {
        setCurrentDateView((prev) => {
            let prevYear = subYears(new Date(prev), 1);
            if (prevYear < new Date(minDate)) {
                prevYear = new Date(minDate);
            }
            setYears((prevYears) => prevYears.map((item) => ({...item, isSelected: item.value === prevYear.getFullYear()})));
            return prevYear;
        });
    };

    const moveToNextYear = () => {
        setCurrentDateView((prev) => {
            let nextYear = addYears(new Date(prev), 1);
            if (nextYear > new Date(maxDate)) {
                nextYear = new Date(maxDate);
            }
            setYears((prevYears) => prevYears.map((item) => ({...item, isSelected: item.value === nextYear.getFullYear()})));
            return nextYear;
        });
    };

    const monthNames = DateUtils.getMonthNames().map((month) => Str.UCFirst(month));
    const daysOfWeek = DateUtils.getDaysOfWeek().map((day) => day.toUpperCase());
    const hasAvailableDatesNextMonth = startOfDay(new Date(maxDate)) > endOfMonth(new Date(currentDateView));
    const hasAvailableDatesPrevMonth = endOfDay(new Date(minDate)) < startOfMonth(new Date(currentDateView));
    const hasAvailableDatesNextYear = startOfDay(new Date(maxDate)) > endOfYear(new Date(currentDateView));
    const hasAvailableDatesPrevYear = endOfDay(new Date(minDate)) < startOfYear(new Date(currentDateView));

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
    const headerPaddingStyle = headerContainerStyle ?? themeStyles.ph3;
    // On mobile (isSmallScreenWidth is always true on native), the height animation is skipped
    // so using Animated.View is unnecessary. Using a plain View with collapsable={false} avoids
    // activating Reanimated's Fabric commit hook, which on Android can interfere with React's
    // reconciliation of child view styles and prevent day-selection background changes from painting.
    const CalendarBody = isSmallScreenWidth ? View : Animated.View;

    const getAccessibilityState = useCallback((isSelected: boolean) => ({selected: isSelected}), []);

    return (
        <View style={[themeStyles.pb4, themeStyles.pt1]}>
            <View
                style={[themeStyles.calendarHeader, themeStyles.flexRow, themeStyles.justifyContentBetween, themeStyles.alignItemsCenter, themeStyles.gap3, headerPaddingStyle]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, {flex: 3}]}>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-month-arrow"
                        disabled={!hasAvailableDatesPrevMonth}
                        onPress={moveToPrevMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.previousMonth')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.PREV_MONTH}
                    >
                        <ArrowIcon
                            disabled={!hasAvailableDatesPrevMonth}
                            direction={CONST.DIRECTION.LEFT}
                        />
                    </PressableWithFeedback>
                    <View style={[themeStyles.flex1, themeStyles.alignItemsCenter]}>
                        <PressableWithFeedback
                            onPress={() => {
                                monthPressableRef?.current?.blur();
                                setIsMonthPickerVisible(true);
                            }}
                            ref={monthPressableRef}
                            style={[themeStyles.alignItemsCenter]}
                            wrapperStyle={[themeStyles.alignItemsCenter]}
                            hoverDimmingValue={1}
                            testID="currentMonthButton"
                            accessibilityLabel={`${monthNames.at(currentMonthView)}, ${translate('common.currentMonth')}`}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.MONTH_PICKER}
                        >
                            <Text
                                style={themeStyles.sidebarLinkTextBold}
                                testID="currentMonthText"
                                numberOfLines={1}
                            >
                                {monthNames.at(currentMonthView)}
                            </Text>
                        </PressableWithFeedback>
                    </View>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="next-month-arrow"
                        disabled={!hasAvailableDatesNextMonth}
                        onPress={moveToNextMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.nextMonth')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.NEXT_MONTH}
                    >
                        <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                    </PressableWithFeedback>
                </View>
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, {flex: 2}]}>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-year-arrow"
                        disabled={!hasAvailableDatesPrevYear}
                        onPress={moveToPrevYear}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.previousYear')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.PREV_YEAR}
                    >
                        <ArrowIcon
                            disabled={!hasAvailableDatesPrevYear}
                            direction={CONST.DIRECTION.LEFT}
                        />
                    </PressableWithFeedback>
                    <View style={[themeStyles.flex1, themeStyles.alignItemsCenter]}>
                        <PressableWithFeedback
                            onPress={() => {
                                pressableRef?.current?.blur();
                                setIsYearPickerVisible(true);
                            }}
                            ref={pressableRef}
                            style={[themeStyles.alignItemsCenter]}
                            wrapperStyle={[themeStyles.alignItemsCenter]}
                            hoverDimmingValue={1}
                            disabled={years.length <= 1}
                            testID="currentYearButton"
                            accessibilityLabel={`${currentYearView}, ${translate('common.currentYear')}`}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.YEAR_PICKER}
                        >
                            <Text
                                style={themeStyles.sidebarLinkTextBold}
                                testID="currentYearText"
                            >
                                {currentYearView}
                            </Text>
                        </PressableWithFeedback>
                    </View>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="next-year-arrow"
                        disabled={!hasAvailableDatesNextYear}
                        onPress={moveToNextYear}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.nextYear')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.NEXT_YEAR}
                    >
                        <ArrowIcon disabled={!hasAvailableDatesNextYear} />
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
            <CalendarBody
                collapsable={false}
                style={calendarContainerStyle}
            >
                {calendarDaysMatrix?.map((week) => (
                    <View
                        key={`week-${week.toString()}`}
                        collapsable={false}
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
                                    accessibilityHint=""
                                    accessibilityState={getAccessibilityState(isSelected)}
                                    aria-selected={isSelected}
                                    tabIndex={day ? 0 : -1}
                                    accessible={!!day}
                                    accessibilityElementsHidden={!day}
                                    importantForAccessibility={day ? 'auto' : 'no-hide-descendants'}
                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    role={CONST.ROLE.BUTTON}
                                    sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.DAY}
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
            </CalendarBody>
            <YearPickerModal
                isVisible={isYearPickerVisible}
                years={years}
                currentYear={currentYearView}
                onYearChange={onYearSelected}
                onClose={() => setIsYearPickerVisible(false)}
            />
            <MonthPickerModal
                isVisible={isMonthPickerVisible}
                currentMonth={currentMonthView}
                currentYear={currentYearView}
                minDate={minDate}
                maxDate={maxDate}
                onMonthChange={onMonthSelected}
                onClose={() => setIsMonthPickerVisible(false)}
            />
        </View>
    );
}

export default CalendarPicker;
