import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {addMonths, addYears, clamp, isSameDay, isValid, setMonth, setYear, startOfDay, startOfMonth, subMonths, subYears} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import ArrowIcon from './ArrowIcon';
import Day from './Day';
import generateMonthMatrix from './generateMonthMatrix';
import MonthPickerModal from './MonthPickerModal';
import YearPickerModal from './YearPickerModal';

type CalendarPickerProps = {
    /** The selected date. Without it, no day is selected and the calendar opens on defaultMonth, or on today. When the date it opens on is outside minDate and maxDate, it opens on the nearest one. */
    value?: Date;

    /** The month the calendar opens on when there is no value. Without it, the calendar opens on today. */
    defaultMonth?: Date;

    /** A minimum date (oldest) allowed to select. The calendar can't move to a month before it. Without a valid one, it is today's date in CONST.CALENDAR_PICKER.MIN_YEAR. */
    minDate?: Date;

    /** A maximum date (latest) allowed to select. The calendar can't move to a month after it. Without a valid one, it is today's date in CONST.CALENDAR_PICKER.MAX_YEAR. */
    maxDate?: Date;

    /** Whether a day between minDate and maxDate can be selected. Unlike the bounds, it doesn't limit which months and years can be shown. */
    isDateSelectable?: (date: Date) => boolean;

    /** Day component to render for dates */
    DayComponent?: typeof Day;

    /** Called with the picked day at local midnight */
    onSelected?: (selectedDate: Date) => void;

    /** Optional style override for the header container */
    headerContainerStyle?: StyleProp<ViewStyle>;

    /** Optional additional style for the outermost container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether Month/Year right-docked picker modals should keep backdrop in narrow pane context */
    shouldEnableMonthYearBackdropInNarrowPane?: boolean;
};

/** A bound can be built from data, such as a time zone or a stored date, so an invalid one falls back to the default like a missing one, instead of making every date invalid. */
function getBound(date: Date | undefined, defaultYear: number): Date {
    return date && isValid(date) ? date : setYear(new Date(), defaultYear);
}

function CalendarPicker({
    value,
    defaultMonth,
    minDate: minDateProp,
    maxDate: maxDateProp,
    onSelected,
    DayComponent = Day,
    isDateSelectable,
    headerContainerStyle,
    containerStyle,
    shouldEnableMonthYearBackdropInNarrowPane = false,
}: CalendarPickerProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const themeStyles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const pressableRef = useRef<ComponentRef<typeof View>>(null);
    const monthPressableRef = useRef<ComponentRef<typeof View>>(null);
    const minDate = getBound(minDateProp, CONST.CALENDAR_PICKER.MIN_YEAR);
    const maxDate = getBound(maxDateProp, CONST.CALENDAR_PICKER.MAX_YEAR);
    const [dateView, setDateView] = useState(value ?? defaultMonth ?? new Date());
    const currentDateView = clamp(dateView, {start: minDate, end: maxDate});
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
    const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
    const isFirstRender = useRef(true);

    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
    const initialHeight = (calendarDaysMatrix?.length || CONST.MAX_CALENDAR_PICKER_ROWS) * CONST.CALENDAR_PICKER_DAY_HEIGHT;
    const heightValue = useSharedValue(initialHeight);

    const minYear = minDate.getFullYear();
    const maxYear = maxDate.getFullYear();
    const minDay = startOfDay(minDate);
    const maxDay = startOfDay(maxDate);
    const minMonthStart = startOfMonth(minDate);
    const maxMonthStart = startOfMonth(maxDate);
    const currentMonthStart = startOfMonth(currentDateView);

    const onYearSelected = (year: number) => {
        setDateView(addYears(currentDateView, year - currentYearView));
        requestAnimationFrame(() => setIsYearPickerVisible(false));
    };

    const onMonthSelected = (month: number) => {
        setDateView(setMonth(currentDateView, month));
        requestAnimationFrame(() => setIsMonthPickerVisible(false));
    };

    /**
     * Calls the onSelected function with the selected date.
     * @param date - The day that was selected, at local midnight.
     */
    const onDayPressed = (date: Date) => {
        setDateView(date);
        onSelected?.(date);
    };

    const isAtMinBoundary = currentMonthStart <= minMonthStart;
    const isAtMaxBoundary = currentMonthStart >= maxMonthStart;
    const isAtMinYear = currentYearView <= minYear;
    const isAtMaxYear = currentYearView >= maxYear;

    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    const moveToPrevMonth = () => {
        setDateView(subMonths(currentDateView, 1));
    };

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    const moveToNextMonth = () => {
        setDateView(addMonths(currentDateView, 1));
    };

    const moveToPrevYear = () => {
        setDateView(subYears(currentDateView, 1));
    };

    const moveToNextYear = () => {
        setDateView(addYears(currentDateView, 1));
    };

    const monthNames = DateUtils.getMonthNames(dateFnsLocale).map((month) => Str.UCFirst(month));
    const minMonth = currentYearView === minYear ? minDate.getMonth() : 0;
    const maxMonth = currentYearView === maxYear ? maxDate.getMonth() : monthNames.length - 1;
    const daysOfWeek = DateUtils.getDaysOfWeek(dateFnsLocale).map((day) => day.toUpperCase());
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
        <View style={[themeStyles.pb4, themeStyles.pt1, containerStyle]}>
            <View
                style={[themeStyles.calendarHeader, themeStyles.flexRow, themeStyles.justifyContentBetween, themeStyles.alignItemsCenter, themeStyles.gap3, headerPaddingStyle]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, {flex: 3}]}>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-month-arrow"
                        disabled={isAtMinBoundary}
                        onPress={moveToPrevMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.previousMonth')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.PREV_MONTH}
                    >
                        <ArrowIcon
                            disabled={isAtMinBoundary}
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
                            disabled={maxMonth <= minMonth}
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
                        disabled={isAtMaxBoundary}
                        onPress={moveToNextMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.nextMonth')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.NEXT_MONTH}
                    >
                        <ArrowIcon disabled={isAtMaxBoundary} />
                    </PressableWithFeedback>
                </View>
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, {flex: 2}]}>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-year-arrow"
                        disabled={isAtMinYear}
                        onPress={moveToPrevYear}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.previousYear')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.PREV_YEAR}
                    >
                        <ArrowIcon
                            disabled={isAtMinYear}
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
                            disabled={maxYear <= minYear}
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
                        disabled={isAtMaxYear}
                        onPress={moveToNextYear}
                        hoverDimmingValue={1}
                        accessibilityLabel={translate('common.nextYear')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.CALENDAR_PICKER.NEXT_YEAR}
                    >
                        <ArrowIcon disabled={isAtMaxYear} />
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
                            const currentDate = day ? new Date(currentYearView, currentMonthView, day) : undefined;
                            const isDisabled = !currentDate || currentDate < minDay || currentDate > maxDay || !(isDateSelectable?.(currentDate) ?? true);
                            const isSelected = !!currentDate && !!value && isSameDay(value, currentDate);
                            const handleOnPress = () => {
                                if (!currentDate || isDisabled) {
                                    return;
                                }

                                onDayPressed(currentDate);
                            };
                            const key = `${index}_day-${day}`;
                            const accessibilityDateLabel = currentDate ? DateUtils.formatToLongDateWithWeekday(currentDate, dateFnsLocale) : '';
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
                minYear={minYear}
                maxYear={maxYear}
                currentYear={currentYearView}
                onYearChange={onYearSelected}
                onClose={() => setIsYearPickerVisible(false)}
                shouldEnableBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
            />
            <MonthPickerModal
                isVisible={isMonthPickerVisible}
                currentMonth={currentMonthView}
                minMonth={minMonth}
                maxMonth={maxMonth}
                onMonthChange={onMonthSelected}
                onClose={() => setIsMonthPickerVisible(false)}
                shouldEnableBackdropInNarrowPane={shouldEnableMonthYearBackdropInNarrowPane}
            />
        </View>
    );
}

export default CalendarPicker;
