import {addMonths, endOfDay, endOfMonth, format, getYear, isSameDay, parseISO, setDate, setYear, startOfDay, startOfMonth, subMonths} from 'date-fns';
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withStyleUtils, {withStyleUtilsPropTypes} from '@components/withStyleUtils';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import ArrowIcon from './ArrowIcon';
import generateMonthMatrix from './generateMonthMatrix';
import YearPickerModal from './YearPickerModal';

const propTypes = {
    /** An initial value of date string */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

    /** A minimum date (oldest) allowed to select */
    minDate: PropTypes.instanceOf(Date),

    /** A maximum date (earliest) allowed to select */
    maxDate: PropTypes.instanceOf(Date),

    /** A function called when the date is selected */
    onSelected: PropTypes.func,

    ...withLocalizePropTypes,
    ...withThemeStylesPropTypes,
    ...withStyleUtilsPropTypes,
};

const defaultProps = {
    value: new Date(),
    minDate: setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
    maxDate: setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
    onSelected: () => {},
};

function CalendarPicker(props) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [currentDateView, setCurrentDateView] = useState(props.value === 'string' ? parseISO(props.value) : new Date(props.value));
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);

    const minYear = getYear(new Date(props.minDate));
    const maxYear = getYear(new Date(props.maxDate));

    const [years, setYears] = useState(
        // eslint-disable-next-line rulesdir/prefer-underscore-method
        Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear).map((value) => ({
            text: value.toString(),
            value,
            keyForList: value.toString(),
            isSelected: value === currentDateView.getFullYear(),
        })),
    );

    useEffect(() => {
        if (props.maxDate < currentDateView) {
            setCurrentDateView(props.maxDate);
        } else if (props.minDate > currentDateView) {
            setCurrentDateView(props.minDate);
        }
    }, []);

    const onYearSelected = (year) => {
        setIsYearPickerVisible(false);
        setCurrentDateView((prev) => {
            const newCurrentDateView = setYear(new Date(prev), year);
            setYears((prevYears) =>
                // eslint-disable-next-line rulesdir/prefer-underscore-method
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
     * @param {Number} day - The day of the month that was selected.
     */
    const onDayPressed = (day) => {
        setCurrentDateView((prev) => {
            const newCurrentDateView = setDate(new Date(prev), day);
            props.onSelected(format(new Date(newCurrentDateView), CONST.DATE.FNS_FORMAT_STRING));
            return newCurrentDateView;
        });
    };

    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    const moveToPrevMonth = () => {
        setCurrentDateView((prev) => subMonths(new Date(prev), 1));
    };

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    const moveToNextMonth = () => {
        setCurrentDateView((prev) => addMonths(new Date(prev), 1));
    };

    const monthNames = _.map(DateUtils.getMonthNames(props.preferredLocale), Str.recapitalize);
    const daysOfWeek = _.map(DateUtils.getDaysOfWeek(props.preferredLocale), (day) => day.toUpperCase());
    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
    const hasAvailableDatesNextMonth = startOfDay(new Date(props.maxDate)) > endOfMonth(new Date(currentDateView));
    const hasAvailableDatesPrevMonth = endOfDay(new Date(props.minDate)) < startOfMonth(new Date(currentDateView));

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
                    accessibilityLabel={props.translate('common.currentYear')}
                >
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentYearText"
                        accessibilityLabel={props.translate('common.currentYear')}
                    >
                        {currentYearView}
                    </Text>
                    <ArrowIcon />
                </PressableWithFeedback>
                <View style={[themeStyles.alignItemsCenter, themeStyles.flexRow, themeStyles.flex1, themeStyles.justifyContentEnd]}>
                    <Text
                        style={themeStyles.sidebarLinkTextBold}
                        testID="currentMonthText"
                        accessibilityLabel={props.translate('common.currentMonth')}
                    >
                        {monthNames[currentMonthView]}
                    </Text>
                    <PressableWithFeedback
                        shouldUseAutoHitSlop={false}
                        testID="prev-month-arrow"
                        disabled={!hasAvailableDatesPrevMonth}
                        onPress={moveToPrevMonth}
                        hoverDimmingValue={1}
                        accessibilityLabel={props.translate('common.previous')}
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
                        accessibilityLabel={props.translate('common.next')}
                    >
                        <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                    </PressableWithFeedback>
                </View>
            </View>
            <View style={themeStyles.flexRow}>
                {_.map(daysOfWeek, (dayOfWeek) => (
                    <View
                        key={dayOfWeek}
                        style={[themeStyles.calendarDayRoot, themeStyles.flex1, themeStyles.justifyContentCenter, themeStyles.alignItemsCenter]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        <Text style={themeStyles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                    </View>
                ))}
            </View>
            {_.map(calendarDaysMatrix, (week) => (
                <View
                    key={`week-${week}`}
                    style={themeStyles.flexRow}
                >
                    {_.map(week, (day, index) => {
                        const currentDate = new Date(currentYearView, currentMonthView, day);
                        const isBeforeMinDate = currentDate < startOfDay(new Date(props.minDate));
                        const isAfterMaxDate = currentDate > startOfDay(new Date(props.maxDate));
                        const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;
                        const isSelected = !!day && isSameDay(parseISO(props.value), new Date(currentYearView, currentMonthView, day));
                        return (
                            <PressableWithoutFeedback
                                key={`${index}_day-${day}`}
                                disabled={isDisabled}
                                onPress={() => onDayPressed(day)}
                                style={themeStyles.calendarDayRoot}
                                accessibilityLabel={day ? day.toString() : undefined}
                                tabIndex={day ? 0 : -1}
                                accessible={Boolean(day)}
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
                                        <Text style={isDisabled ? themeStyles.buttonOpacityDisabled : themeStyles.dayText}>{day}</Text>
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

CalendarPicker.propTypes = propTypes;
CalendarPicker.defaultProps = defaultProps;

export default compose(withLocalize, withThemeStyles, withStyleUtils)(CalendarPicker);
