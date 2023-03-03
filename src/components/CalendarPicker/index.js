import _ from 'underscore';
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import moment from 'moment';
import Text from '../Text';
import ListPicker from './ListPicker';
import ArrowIcon from './ArrowIcon';
import styles from '../../styles/styles';
import {propTypes, defaultProps} from './calendarPickerPropTypes';
import generateMonthMatrix from './generateMonthMatrix';
import withLocalize from '../withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

class CalendarPicker extends React.Component {
    constructor(props) {
        super(props);

        this.monthNames = moment.localeData(props.preferredLocale).months();
        this.daysOfWeek = moment.localeData(props.preferredLocale).weekdays();

        let currentDateView = props.value || new Date();
        if (props.maxDate && props.maxDate < currentDateView) {
            currentDateView = props.maxDate;
        } else if (props.minDate && props.minDate > currentDateView) {
            currentDateView = props.minDate;
        }

        this.state = {
            yearPickerVisible: false,
            monthPickerVisible: false,
            currentDateView,
        };

        this.onPrevMonthPress = this.onPrevMonthPress.bind(this);
        this.onNextMonthPress = this.onNextMonthPress.bind(this);
        this.onMonthPickerPress = this.onMonthPickerPress.bind(this);
        this.onYearPickerPress = this.onYearPickerPress.bind(this);
        this.onDayPress = this.onDayPress.bind(this);
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    componentDidMount() {
        if (this.props.minDate && this.props.maxDate && this.props.minDate > this.props.maxDate) {
            throw new Error('Minimum date cannot be greater than the maximum date.');
        }
    }

    /**
     * Updates the currentDateView state by subtracting one month from it.
     * @returns {void}
     */
    onPrevMonthPress() {
        this.setState(prev => ({currentDateView: moment(prev.currentDateView).subtract(1, 'M').toDate()}));
    }

    /**
     * Updates the currentDateView state by adding one month to it.
     * @returns {void}
     */
    onNextMonthPress() {
        this.setState(prev => ({currentDateView: moment(prev.currentDateView).add(1, 'M').toDate()}));
    }

    /**
     * Sets the monthPickerVisible state to true, displaying the month picker component.
     * @returns {void}
     */
    onMonthPickerPress() {
        Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH_MONTH);
        this.props.onMonthPressed();
    }

    /**
     * Sets the yearPickerVisible state to true, displaying the year picker component.
     * @returns {void}
     */
    onYearPickerPress() {
        Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH_YEAR);
        this.props.onYearPressed();
    }

    /**
     * Calls the onChange function with the selected date, if it is within the min/max range.
     * @param {number} day - The day of the month that was selected.
     * @returns {void}
     */
    onDayPress(day) {
        if (!this.props.onChange) {
            return;
        }
        const selectedDate = new Date(this.state.currentDateView.getFullYear(), this.state.currentDateView.getMonth(), day);
        if ((this.props.minDate && moment(selectedDate) < moment(this.props.minDate).startOf('day'))
        || (this.props.maxDate && moment(selectedDate) > moment(this.props.maxDate).startOf('day'))) {
            return;
        }
        this.props.onChange(selectedDate);
    }

    render() {
        const currentMonthView = this.state.currentDateView.getMonth();
        const currentYearView = this.state.currentDateView.getFullYear();
        const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
        const hasAvailableDatesNextMonth = this.props.maxDate ? moment(this.props.maxDate).endOf('month').startOf('day') > moment(this.state.currentDateView).add(1, 'M') : true;
        const hasAvailableDatesPrevMonth = this.props.minDate ? moment(this.props.minDate).startOf('day') < moment(this.state.currentDateView).subtract(1, 'M').endOf('month') : true;

        if (this.state.yearPickerVisible) {
            const minYear = this.props.minDate ? moment(this.props.minDate).year() : 1970;
            const maxDate = this.props.maxDate ? moment(this.props.maxDate).year() - minYear : 200;
            const years = Array.from({length: maxDate}, (k, v) => v + minYear);
            return (
                <ListPicker
                    selected={currentYearView}
                    data={years}
                    onSelect={(year) => {
                        this.setState(prev => ({yearPickerVisible: false, currentDateView: new Date(year, prev.currentDateView.getMonth(), prev.currentDateView.getDay())}));
                    }}
                />
            );
        }

        if (this.state.monthPickerVisible) {
            const months = Array.from({length: 12}, (k, v) => v);
            return (
                <ListPicker
                    selected={currentMonthView}
                    data={months}
                    format={index => this.monthNames[index]}
                    onSelect={(month) => {
                        this.setState(prev => ({monthPickerVisible: false, currentDateView: new Date(prev.currentDateView.getFullYear(), month, prev.currentDateView.getDay())}));
                    }}
                />
            );
        }

        return (
            <View>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={this.onMonthPickerPress} style={[styles.alignItemsCenter, styles.flexRow, styles.flex1]}>
                        <Text style={styles.sidebarLinkTextBold} accessibilityLabel="Current month">{this.monthNames[currentMonthView]}</Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.onYearPickerPress} style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flex1]}>
                        <Text style={styles.sidebarLinkTextBold} accessibilityLabel="Current year">{currentYearView}</Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                        <TouchableOpacity testID="prev-month-arrow" disabled={!hasAvailableDatesPrevMonth} onPress={this.onPrevMonthPress}>
                            <ArrowIcon disabled={!hasAvailableDatesPrevMonth} direction="left" />
                        </TouchableOpacity>
                        <TouchableOpacity testID="next-month-arrow" disabled={!hasAvailableDatesNextMonth} onPress={this.onNextMonthPress}>
                            <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.flexRow}>
                    {_.map(this.daysOfWeek, (dayOfWeek => (
                        <View key={dayOfWeek} style={styles.calendarDayRoot}>
                            <Text style={styles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                        </View>
                    )))}
                </View>
                {_.map(calendarDaysMatrix, week => (
                    <View key={`week-${week}`} style={styles.flexRow}>
                        {_.map(week, (day, index) => {
                            const currentDate = moment([currentYearView, currentMonthView, day]);
                            const isBeforeMinDate = this.props.minDate && (currentDate < moment(this.props.minDate).startOf('day'));
                            const isAfterMaxDate = this.props.maxDate && (currentDate > moment(this.props.maxDate).startOf('day'));
                            const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;

                            return (
                                <TouchableOpacity
                                    key={`${index}_day-${day}`}
                                    disabled={isDisabled}
                                    onPress={() => this.onDayPress(day)}
                                    style={styles.calendarDayRoot}
                                    accessibilityLabel={day ? day.toString() : undefined}
                                >
                                    <View style={[moment(this.props.value).isSame(moment([currentYearView, currentMonthView, day]), 'day') && styles.calendarDayContainerSelected]}>
                                        <Text style={isDisabled ? styles.calendarButtonDisabled : styles.dayText}>{day || ''}</Text>
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

CalendarPicker.propTypes = propTypes;
CalendarPicker.defaultProps = defaultProps;

export default withLocalize(CalendarPicker);
