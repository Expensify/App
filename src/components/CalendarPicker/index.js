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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const addMonths = (date, months) => {
    const d = new Date(date.getTime());
    const newMonth = d.getMonth() + months;
    d.setMonth(newMonth);
    return d;
};

// sometimes setting time to midnight is needed to compare dates correctly
const midnight = date => new Date(date).setHours(0, 0, 0, 0);

const CalendarPicker = (props) => {
    const [currentDateView, setCurrentDateView] = React.useState(props.value ? props.value : new Date());

    const [yearPickerVisible, setYearPickerVisible] = React.useState(false);
    const [monthPickerVisible, setMonthPickerVisible] = React.useState(false);

    const isMaxDateBeforeCurrentDate = (props.maxDate && midnight(moment(props.maxDate).toDate()) < currentDateView);
    const isMinDateAfterCurrentDate = (props.minDate && midnight(moment(props.minDate).toDate()) > currentDateView);
    const dateToUse = isMinDateAfterCurrentDate ? props.minDate : props.maxDate;

    const currentMonthView = isMaxDateBeforeCurrentDate || isMinDateAfterCurrentDate ? moment(dateToUse).month() : currentDateView.getMonth();
    const currentYearView = isMaxDateBeforeCurrentDate || isMinDateAfterCurrentDate ? moment(dateToUse).year() : currentDateView.getFullYear();
    const monthMatrix = generateMonthMatrix(currentYearView, currentMonthView);
    const onNextMonthPress = () => setCurrentDateView(prev => addMonths(prev, 1));
    const onPrevMonthPress = () => setCurrentDateView(prev => addMonths(prev, -1));
    const onMonthPickerPress = () => setMonthPickerVisible(true);
    const onYearPickerPress = () => setYearPickerVisible(true);

    const hasAvailableDatesNextMonth = props.maxDate ? midnight(moment(props.maxDate).endOf('month').toDate()) > addMonths(currentDateView, 1) : true;
    const hasAvailableDatesPrevMonth = props.minDate ? midnight(moment(props.minDate).toDate()) < moment(addMonths(currentDateView, -1)).endOf('month').toDate() : true;

    React.useEffect(() => {
        if (!isMinDateAfterCurrentDate) { return; }

        setCurrentDateView(new Date(currentYearView, currentMonthView));
    }, []);

    React.useEffect(() => {
        if (!isMaxDateBeforeCurrentDate) { return; }

        setCurrentDateView(new Date(currentYearView, currentMonthView));
    }, []);

    const onDayPress = (day) => {
        if (!props.onChange) {
            return;
        }
        const selectedDate = new Date(currentYearView, currentMonthView, day);

        if ((props.minDate && selectedDate < midnight(new Date(props.minDate)))
             || (props.maxDate && selectedDate > midnight(new Date(props.maxDate)))) {
            return;
        }

        props.onChange(selectedDate);
    };

    if (yearPickerVisible) {
        const minYear = props.minDate ? moment(props.minDate).year() : 1970;
        const maxDate = props.maxDate ? moment(props.maxDate).year() - minYear : 200;
        const years = Array.from({length: maxDate}, (k, v) => v + minYear);
        return (
            <ListPicker
                selected={currentYearView}
                data={years}
                onSelect={(year) => {
                    setYearPickerVisible(false);
                    setCurrentDateView(prev => new Date(year, prev.getMonth(), prev.getDay()));
                }}
            />
        );
    }

    if (monthPickerVisible) {
        const months = Array.from({length: 12}, (k, v) => v);
        return (
            <ListPicker
                selected={currentMonthView}
                data={months}
                format={index => monthNames[index]}
                onSelect={(month) => {
                    setMonthPickerVisible(false);
                    setCurrentDateView(prev => new Date(prev.getFullYear(), month, prev.getDay()));
                }}
            />
        );
    }

    return (
        <View>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={onMonthPickerPress} style={[styles.alignItemsCenter, styles.flexRow, styles.flex1]}>
                    <Text style={styles.sidebarLinkTextBold}>{monthNames[currentMonthView]}</Text>
                    <ArrowIcon />
                </TouchableOpacity>
                <TouchableOpacity onPress={onYearPickerPress} style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flex1]}>
                    <Text style={styles.sidebarLinkTextBold}>{currentYearView}</Text>
                    <ArrowIcon />
                </TouchableOpacity>
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                    <TouchableOpacity testID="prev-month-arrow" disabled={!hasAvailableDatesPrevMonth} onPress={onPrevMonthPress}>
                        <ArrowIcon disabled={!hasAvailableDatesPrevMonth} direction="left" />
                    </TouchableOpacity>
                    <TouchableOpacity testID="next-month-arrow" disabled={!hasAvailableDatesNextMonth} onPress={onNextMonthPress}>
                        <ArrowIcon disabled={!hasAvailableDatesNextMonth} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.flexRow}>
                {_.map(daysOfWeek, (dayOfWeek => (
                    <View key={dayOfWeek} style={styles.calendarDayRoot}>
                        <Text style={styles.sidebarLinkTextBold}>{dayOfWeek[0]}</Text>
                    </View>
                )))}
            </View>
            {_.map(monthMatrix, week => (
                <View key={`week-${week}`} style={styles.flexRow}>
                    {_.map(week, (day, index) => {
                        const currentDate = moment([currentYearView, currentMonthView, day]);
                        const isBeforeMinDate = props.minDate && (currentDate.toDate() < midnight(new Date(props.minDate)));
                        const isAfterMaxDate = props.maxDate && (currentDate.toDate() > midnight(new Date(props.maxDate)));
                        const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;

                        return (
                            <TouchableOpacity
                                key={`${index}_day-${day}`}
                                disabled={isDisabled}
                                onPress={() => onDayPress(day)}
                                style={styles.calendarDayRoot}
                            >
                                <View style={[moment(props.value).isSame(moment([currentYearView, currentMonthView, day]), 'day') && styles.calendarDayContainerSelected]}>
                                    <Text style={isDisabled ? styles.calendarButtonDisabled : styles.dayText}>{day || ''}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

CalendarPicker.displayName = 'CalendarPicker';
CalendarPicker.propTypes = propTypes;
CalendarPicker.defaultProps = defaultProps;

export default CalendarPicker;
