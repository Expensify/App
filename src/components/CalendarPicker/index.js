import _ from 'underscore';
import React from 'react';
import {View, TouchableOpacity, Pressable} from 'react-native';
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

class CalendarPicker extends React.PureComponent {
    constructor(props) {
        super(props);

        this.monthNames = _.map(moment.localeData(props.preferredLocale).months(), Str.recapitalize);
        this.daysOfWeek = _.map(moment.localeData(props.preferredLocale).weekdays(), day => day.toUpperCase());

        let currentDateView = moment(props.value).toDate();
        if (props.selectedYear) {
            currentDateView = moment(currentDateView).set('year', props.selectedYear).toDate();
        }
        if (props.selectedMonth != null) {
            currentDateView = moment(currentDateView).set('month', props.selectedMonth).toDate();
        }
        if (props.maxDate < currentDateView) {
            currentDateView = props.maxDate;
        } else if (props.minDate > currentDateView) {
            currentDateView = props.minDate;
        }

        const currentSelection = moment(props.value).format(CONST.DATE.MOMENT_FORMAT_STRING);
        const selectionParts = currentSelection.split('-');

        this.state = {
            currentDateView,
            selectedYear: selectionParts[0],
            selectedMonth: selectionParts[1],
            selectedDay: selectionParts[2],
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
        this.setState((prev) => {
            const newMomentDate = moment(prev.currentDateView).set('year', this.props.selectedYear);
            const clampedDate = this.clampDate(newMomentDate.toDate());

            return {
                selectedYear: this.props.selectedYear,
                currentDateView: clampedDate,
            };
        }, () => {
            this.props.onSelected(this.getSelectedDateString());
        });
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
        this.setState((prev) => {
            const momentDate = moment(prev.currentDateView).date(day);
            const clampedDate = this.clampDate(momentDate.toDate());
            return {
                selectedDay: `${day < 10 ? `0${day}` : day}`,
                currentDateView: clampedDate,
            };
        }, () => {
            this.props.onSelected(this.getSelectedDateString());
        });
    }

    getSelectedDateString() {
        return `${this.state.selectedYear}-${this.state.selectedMonth}-${this.state.selectedDay}`;
    }

    moveToPrevMonth() {
        this.setState((prev) => {
            const momentDate = moment(prev.currentDateView).subtract(1, 'M');
            const clampedDate = this.clampDate(momentDate.toDate());

            const month = clampedDate.getMonth() + 1;
            const year = clampedDate.getFullYear(); // year might have changed too

            return {
                selectedMonth: `${month < 10 ? `0${month}` : month}`,
                selectedYear: `${year}`,
                currentDateView: clampedDate,
            };
        }, () => {
            this.props.onSelected(this.getSelectedDateString());
        });
    }

    moveToNextMonth() {
        this.setState((prev) => {
            const momentDate = moment(prev.currentDateView).add(1, 'M');
            const clampedDate = this.clampDate(momentDate.toDate());

            const month = clampedDate.getMonth() + 1;
            const year = clampedDate.getFullYear(); // year might have changed too

            return {
                selectedMonth: `${month < 10 ? `0${month}` : month}`,
                selectedYear: `${year}`,
                currentDateView: clampedDate,
            };
        }, () => {
            this.props.onSelected(this.getSelectedDateString());
        });
    }

    /**
     * @param {Date} date
     * @returns {Date}
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
                    <TouchableOpacity
                        onPress={this.onYearPickerPressed}
                        style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentStart]}
                    >
                        <Text
                            style={styles.sidebarLinkTextBold}
                            testID="currentYearText"
                            accessibilityLabel={this.props.translate('common.currentYear')}
                        >
                            {currentYearView}
                        </Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                        <Text
                            style={styles.sidebarLinkTextBold}
                            testID="currentMonthText"
                            accessibilityLabel={this.props.translate('common.currentMonth')}
                        >
                            {monthNames[currentMonthView]}
                        </Text>
                        <TouchableOpacity
                            testID="prev-month-arrow"
                            disabled={!hasAvailableDatesPrevMonth}
                            onPress={this.moveToPrevMonth}
                        >
                            <ArrowIcon
                                disabled={!hasAvailableDatesPrevMonth}
                                direction={CONST.DIRECTION.LEFT}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="next-month-arrow"
                            disabled={!hasAvailableDatesNextMonth}
                            onPress={this.moveToNextMonth}
                        >
                            <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                        </TouchableOpacity>
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
                                <Pressable
                                    key={`${index}_day-${day}`}
                                    disabled={isDisabled}
                                    onPress={() => this.onDayPressed(day)}
                                    style={styles.calendarDayRoot}
                                    accessibilityLabel={day ? day.toString() : undefined}
                                >
                                    {({hovered, pressed}) => (
                                        <View
                                            style={[
                                                styles.calendarDayContainer,
                                                isSelected ? styles.calendarDayContainerSelected : {},
                                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
                                            ]}
                                        >
                                            <Text style={isDisabled ? styles.buttonOpacityDisabled : styles.dayText}>{day}</Text>
                                        </View>
                                    )}
                                </Pressable>
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
