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

const CalendarPicker = (props) => {
    const [yearPickerVisible, setYearPickerVisible] = React.useState(false);
    const [monthPickerVisible, setMonthPickerVisible] = React.useState(false);
    const [currentDateView, setCurrentDateView] = React.useState(() => {
        let initialValue = props.value || new Date();
        if (props.maxDate && props.maxDate < initialValue) {
            initialValue = props.maxDate;
        } else if (props.minDate && props.minDate > initialValue) {
            initialValue = props.minDate;
        }

        return initialValue;
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    React.useEffect(() => {
        if (props.minDate && props.maxDate && props.minDate > props.maxDate) {
            throw new Error('Minimum date cannot be greater than the maximum date.');
        }
    }, [props.minDate, props.maxDate]);

    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);

    const hasAvailableDatesNextMonth = props.maxDate ? moment(props.maxDate).endOf('month').startOf('day') > moment(currentDateView).add(1, 'M') : true;
    const hasAvailableDatesPrevMonth = props.minDate ? moment(props.minDate).startOf('day') < moment(currentDateView).subtract(1, 'M').endOf('month') : true;

    const onNextMonthPress = () => setCurrentDateView(prev => moment(prev).add(1, 'M').toDate());
    const onPrevMonthPress = () => setCurrentDateView(prev => moment(prev).subtract(1, 'M').toDate());
    const onMonthPickerPress = () => setMonthPickerVisible(true);
    const onYearPickerPress = () => setYearPickerVisible(true);
    const onDayPress = (day) => {
        if (!props.onChange) {
            return;
        }
        const selectedDate = new Date(currentYearView, currentMonthView, day);

        if ((props.minDate && moment(selectedDate) < moment(props.minDate).startOf('day'))
             || (props.maxDate && moment(selectedDate) > moment(props.maxDate).startOf('day'))) {
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
                    <Text style={styles.sidebarLinkTextBold} accessibilityLabel="Current month">{monthNames[currentMonthView]}</Text>
                    <ArrowIcon />
                </TouchableOpacity>
                <TouchableOpacity onPress={onYearPickerPress} style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flex1]}>
                    <Text style={styles.sidebarLinkTextBold} accessibilityLabel="Current year">{currentYearView}</Text>
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
            {_.map(calendarDaysMatrix, week => (
                <View key={`week-${week}`} style={styles.flexRow}>
                    {_.map(week, (day, index) => {
                        const currentDate = moment([currentYearView, currentMonthView, day]);
                        const isBeforeMinDate = props.minDate && (currentDate < moment(props.minDate).startOf('day'));
                        const isAfterMaxDate = props.maxDate && (currentDate > moment(props.maxDate).startOf('day'));
                        const isDisabled = !day || isBeforeMinDate || isAfterMaxDate;

                        return (
                            <TouchableOpacity
                                key={`${index}_day-${day}`}
                                disabled={isDisabled}
                                onPress={() => onDayPress(day)}
                                style={styles.calendarDayRoot}
                                accessibilityLabel={day ? day.toString() : undefined}
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
