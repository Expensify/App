import _ from 'underscore';
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import moment from 'moment';
import Text from '../Text';
import ArrowIcon from './ArrowIcon';
import styles from '../../styles/styles';
import {propTypes as calendarPickerPropType, defaultProps as defaultCalendarPickerPropType} from './calendarPickerPropTypes';
import generateMonthMatrix from './generateMonthMatrix';
import withLocalize from '../withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';

class CalendarPicker extends React.PureComponent {
    constructor(props) {
        super(props);

        this.monthNames = moment.localeData(props.preferredLocale).months();
        this.daysOfWeek = moment.localeData(props.preferredLocale).weekdays();

        let currentDateView = props.value;
        if (props.maxDate < currentDateView) {
            currentDateView = props.maxDate;
        } else if (props.minDate > currentDateView) {
            currentDateView = props.minDate;
        }

        this.state = {
            currentDateView,
        };

        this.onPrevMonthPressed = this.onPrevMonthPressed.bind(this);
        this.onNextMonthPressed = this.onNextMonthPressed.bind(this);
        this.onYearPickerPressed = this.onYearPickerPressed.bind(this);
        this.onDayPressed = this.onDayPressed.bind(this);
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    componentDidMount() {
        if (this.props.minDate <= this.props.maxDate) {
            return;
        }
        throw new Error('Minimum date cannot be greater than the maximum date.');
    }

    componentDidUpdate(prevProps) {
        // Check if defaultYear has changed
        if (this.props.defaultYear === prevProps.defaultYear) {
            return;
        }

        // If only the defaultYear prop has changed, update the currentDateView state with the new year value
        this.setState(prev => ({currentDateView: moment(prev.currentDateView).set('year', this.props.defaultYear).toDate()}));
    }

    onPrevMonthPressed() {
        this.setState(prev => ({currentDateView: moment(prev.currentDateView).subtract(1, 'M').toDate()}));
    }

    onNextMonthPressed() {
        this.setState(prev => ({currentDateView: moment(prev.currentDateView).add(1, 'M').toDate()}));
    }

    /**
     * Handles the user pressing the year picker button.
     * Opens the year selection screen with the minimum and maximum year range
     * based on the props, the current year based on the state, and the active route.
     * @returns {void}
     */
    onYearPickerPressed() {
        const minYear = moment(this.props.minDate).year();
        const maxYear = moment(this.props.maxDate).year();
        const currentYear = this.state.currentDateView.getFullYear();
        Navigation.navigate(ROUTES.getYearSelectionRoute(minYear, maxYear, currentYear, Navigation.getActiveRoute()));
        this.props.onYearPressed();
    }

    /**
     * Calls the onSelected function with the selected date, if it is within the min/max range.
     * @param {number} day - The day of the month that was selected.
     * @returns {void}
     */
    onDayPressed(day) {
        const selectedDate = new Date(this.state.currentDateView.getFullYear(), this.state.currentDateView.getMonth(), day);
        this.props.onSelected(selectedDate);
    }

    render() {
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
                        <Text style={styles.sidebarLinkTextBold} testID="currentYearText" accessibilityLabel={this.props.translate('common.currentYear')}>{currentYearView}</Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                        <Text
                            style={styles.sidebarLinkTextBold}
                            testID="currentMonthText"
                            accessibilityLabel={this.props.translate('common.currentMonth')}
                        >
                            {this.monthNames[currentMonthView]}
                        </Text>
                        <TouchableOpacity testID="prev-month-arrow" disabled={!hasAvailableDatesPrevMonth} onPress={this.onPrevMonthPressed}>
                            <ArrowIcon disabled={!hasAvailableDatesPrevMonth} direction={CONST.DIRECTION.LEFT} />
                        </TouchableOpacity>
                        <TouchableOpacity testID="next-month-arrow" disabled={!hasAvailableDatesNextMonth} onPress={this.onNextMonthPressed}>
                            <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.flexRow}>
                    {_.map(this.daysOfWeek, (dayOfWeek => (
                        <View key={dayOfWeek} style={[styles.calendarDayRoot, styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <Text style={styles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                        </View>
                    )))}
                </View>
                {_.map(calendarDaysMatrix, week => (
                    <View key={`week-${week}`} style={styles.flexRow}>
                        {_.map(week, (day, index) => {
                            const currentDate = moment([currentYearView, currentMonthView, day]);
                            const isBeforeMinDate = currentDate < moment(this.props.minDate).startOf('day');
                            const isAfterMaxDate = currentDate > moment(this.props.maxDate).startOf('day');
                            const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;

                            return (
                                <TouchableOpacity
                                    key={`${index}_day-${day}`}
                                    disabled={isDisabled}
                                    onPress={() => this.onDayPressed(day)}
                                    style={styles.calendarDayRoot}
                                    accessibilityLabel={day ? day.toString() : undefined}
                                >
                                    <View style={moment(this.props.value).isSame(moment([currentYearView, currentMonthView, day]), 'day') ? [
                                        styles.calendarDayContainerSelected, styles.justifyContentCenter, styles.alignItemsCenter] : null}
                                    >
                                        <Text style={isDisabled ? styles.calendarButtonDisabled : styles.dayText}>{day}</Text>
                                    </View>
                                </TouchableOpacity>
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
