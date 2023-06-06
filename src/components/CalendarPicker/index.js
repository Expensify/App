import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import ArrowIcon from './ArrowIcon';
import styles from '../../styles/styles';
import {propTypes as calendarPickerPropType, defaultProps as defaultCalendarPickerPropType} from './calendarPickerPropTypes';
import generateMonthMatrix from './generateMonthMatrix';
import withLocalize from '../withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import getButtonState from '../../libs/getButtonState';
import * as StyleUtils from '../../styles/StyleUtils';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

class CalendarPicker extends React.PureComponent {
    constructor(props) {
        super(props);

        let currentSelection = moment(props.value, CONST.DATE.MOMENT_FORMAT_STRING);
        let currentDateView = currentSelection.toDate();

        if (props.selectedYear) {
            currentDateView = moment(currentDateView).set('year', props.selectedYear).toDate();
        }
        if (props.selectedMonth != null) {
            currentDateView = moment(currentDateView).set('month', props.selectedMonth).toDate();
        }
        if (props.maxDate < currentDateView) {
            currentDateView = props.maxDate;
            currentSelection = moment(props.maxDate);
        } else if (props.minDate > currentDateView) {
            currentDateView = props.minDate;
            currentSelection = moment(props.minDate);
        }

        this.state = {
            currentDateView,
            selectedYear: currentSelection.get('year').toString(),
            selectedMonth: this.getNumberStringWithLeadingZero(currentSelection.get('month') + 1),
            selectedDay: this.getNumberStringWithLeadingZero(currentSelection.get('date')),
        };

        this.moveToPrevMonth = this.moveToPrevMonth.bind(this);
        this.moveToNextMonth = this.moveToNextMonth.bind(this);
        this.onYearPickerPressed = this.onYearPickerPressed.bind(this);
        this.onDayPressed = this.onDayPressed.bind(this);
    }

    componentDidMount() {
        if (this.props.minDate <= this.props.maxDate) {
            return;
        }
        throw new Error('Minimum date cannot be greater than the maximum date.');
    }

    componentDidUpdate(prevProps) {
        // Check if selectedYear has changed
        if (this.props.selectedYear === prevProps.selectedYear) {
            return;
        }

        // If the selectedYear prop has changed, update the currentDateView state with the new year value
        this.setState(
            (prev) => {
                const newMomentDate = moment(prev.currentDateView).set('year', this.props.selectedYear);

                return {
                    selectedYear: this.props.selectedYear,
                    currentDateView: this.clampDate(newMomentDate.toDate()),
                };
            },
            () => {
                this.props.onSelected(this.getSelectedDateString());
            },
        );
    }

    /**
     * Handles the user pressing the year picker button.
     * Opens the year selection screen with the minimum and maximum year range
     * based on the props, the current year based on the state, and the active route.
     */
    onYearPickerPressed() {
        const minYear = moment(this.props.minDate).year();
        const maxYear = moment(this.props.maxDate).year();
        const currentYear = parseInt(this.state.selectedYear, 10);
        Navigation.navigate(ROUTES.getYearSelectionRoute(minYear, maxYear, currentYear, Navigation.getActiveRoute()));
        this.props.onYearPickerOpen(this.state.currentDateView);
    }

    /**
     * Calls the onSelected function with the selected date.
     * @param {Number} day - The day of the month that was selected.
     */
    onDayPressed(day) {
        this.setState(
            (prev) => {
                const momentDate = moment(prev.currentDateView).date(day);

                return {
                    selectedDay: this.getNumberStringWithLeadingZero(day),
                    currentDateView: this.clampDate(momentDate.toDate()),
                };
            },
            () => {
                this.props.onSelected(this.getSelectedDateString());
            },
        );
    }

    /**
     * Gets the date string build from state values of selected year, month and day.
     * @returns {string} - Date string in the 'YYYY-MM-DD' format.
     */
    getSelectedDateString() {
        // can't use moment.format() method here because it won't allow incorrect dates
        return `${this.state.selectedYear}-${this.state.selectedMonth}-${this.state.selectedDay}`;
    }

    /**
     * Returns the string converted from the given number. If the number is lower than 10,
     * it will add zero at the beginning of the string.
     * @param {Number} number - The number to be converted.
     * @returns {string} - Converted string prefixed by zero if necessary.
     */
    getNumberStringWithLeadingZero(number) {
        return `${number < 10 ? `0${number}` : number}`;
    }

    /**
     * Gives the new version of the state object,
     * changing both selected month and year based on the given moment date.
     * @param {moment.Moment} momentDate - Moment date object.
     * @returns {{currentDateView: Date, selectedMonth: string, selectedYear: string}} - The new version of the state.
     */
    getMonthState(momentDate) {
        const clampedDate = this.clampDate(momentDate.toDate());
        const month = clampedDate.getMonth() + 1;

        return {
            selectedMonth: this.getNumberStringWithLeadingZero(month),
            selectedYear: clampedDate.getFullYear().toString(), // year might have changed too
            currentDateView: clampedDate,
        };
    }

    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    moveToPrevMonth() {
        this.setState(
            (prev) => {
                const momentDate = moment(prev.currentDateView).subtract(1, 'M');

                return this.getMonthState(momentDate);
            },
            () => {
                this.props.onSelected(this.getSelectedDateString());
            },
        );
    }

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    moveToNextMonth() {
        this.setState(
            (prev) => {
                const momentDate = moment(prev.currentDateView).add(1, 'M');

                return this.getMonthState(momentDate);
            },
            () => {
                this.props.onSelected(this.getSelectedDateString());
            },
        );
    }

    /**
     * Checks whether the given date is in the min/max date range and returns the limit value if not.
     * @param {Date} date - The date object to check.
     * @returns {Date} - The date that is within the min/max date range.
     */
    clampDate(date) {
        if (this.props.maxDate < date) {
            return this.props.maxDate;
        }
        if (this.props.minDate > date) {
            return this.props.minDate;
        }
        return date;
    }

    render() {
        const monthNames = _.map(moment.localeData(this.props.preferredLocale).months(), Str.recapitalize);
        const daysOfWeek = _.map(moment.localeData(this.props.preferredLocale).weekdays(), (day) => day.toUpperCase());
        const currentMonthView = this.state.currentDateView.getMonth();
        const currentYearView = this.state.currentDateView.getFullYear();
        const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
        const hasAvailableDatesNextMonth = moment(this.props.maxDate).endOf('month').startOf('day') > moment(this.state.currentDateView).add(1, 'M');
        const hasAvailableDatesPrevMonth = moment(this.props.minDate).startOf('day') < moment(this.state.currentDateView).subtract(1, 'M').endOf('month');

        return (
            <View>
                <View style={[styles.calendarHeader, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph4, styles.pr1]}>
                    <PressableWithFeedback
                        onPress={this.onYearPickerPressed}
                        style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentStart]}
                        wrapperStyle={[styles.alignItemsCenter]}
                        hoverDimmingValue={1}
                        accessibilityLabel={this.props.translate('common.currentYear')}
                    >
                        <Text
                            style={styles.sidebarLinkTextBold}
                            testID="currentYearText"
                            accessibilityLabel={this.props.translate('common.currentYear')}
                        >
                            {currentYearView}
                        </Text>
                        <ArrowIcon />
                    </PressableWithFeedback>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                        <Text
                            style={styles.sidebarLinkTextBold}
                            testID="currentMonthText"
                            accessibilityLabel={this.props.translate('common.currentMonth')}
                        >
                            {monthNames[currentMonthView]}
                        </Text>
                        <PressableWithFeedback
                            testID="prev-month-arrow"
                            disabled={!hasAvailableDatesPrevMonth}
                            onPress={this.moveToPrevMonth}
                            hoverDimmingValue={1}
                            accessibilityLabel={this.props.translate('common.previous')}
                        >
                            <ArrowIcon
                                disabled={!hasAvailableDatesPrevMonth}
                                direction={CONST.DIRECTION.LEFT}
                            />
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            testID="next-month-arrow"
                            disabled={!hasAvailableDatesNextMonth}
                            onPress={this.moveToNextMonth}
                            hoverDimmingValue={1}
                            accessibilityLabel={this.props.translate('common.next')}
                        >
                            <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                        </PressableWithFeedback>
                    </View>
                </View>
                <View style={styles.flexRow}>
                    {_.map(daysOfWeek, (dayOfWeek) => (
                        <View
                            key={dayOfWeek}
                            style={[styles.calendarDayRoot, styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}
                        >
                            <Text style={styles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                        </View>
                    ))}
                </View>
                {_.map(calendarDaysMatrix, (week) => (
                    <View
                        key={`week-${week}`}
                        style={styles.flexRow}
                    >
                        {_.map(week, (day, index) => {
                            const currentDate = moment([currentYearView, currentMonthView, day]);
                            const isBeforeMinDate = currentDate < moment(this.props.minDate).startOf('day');
                            const isAfterMaxDate = currentDate > moment(this.props.maxDate).startOf('day');
                            const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;
                            const isSelected = moment(this.props.value).isSame(moment([currentYearView, currentMonthView, day]), 'day');

                            return (
                                <PressableWithoutFeedback
                                    key={`${index}_day-${day}`}
                                    disabled={isDisabled}
                                    onPress={() => this.onDayPressed(day)}
                                    style={styles.calendarDayRoot}
                                    accessibilityLabel={day ? day.toString() : undefined}
                                    focusable={Boolean(day)}
                                    accessible={Boolean(day)}
                                >
                                    {({hovered, pressed}) => (
                                        <View
                                            style={[
                                                styles.calendarDayContainer,
                                                isSelected ? styles.calendarDayContainerSelected : {},
                                                !isDisabled ? StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)) : {},
                                            ]}
                                        >
                                            <Text style={isDisabled ? styles.buttonOpacityDisabled : styles.dayText}>{day}</Text>
                                        </View>
                                    )}
                                </PressableWithoutFeedback>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    }
}

CalendarPicker.propTypes = calendarPickerPropType;
CalendarPicker.defaultProps = defaultCalendarPickerPropType;

export default withLocalize(CalendarPicker);
