import _ from 'underscore';
import React from 'react';
import {
    StyleSheet, View, TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import Icon from './Icon';
import Text from './Text';
import colors from '../styles/colors';
import flex from '../styles/utilities/flex';

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    calendarHeader: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingRight: 5,
    },
    rowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayContainer: {
        flex: 1,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    daySelected: {
        backgroundColor: colors.greenDefaultButton,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    dayText: {
        color: 'white',
    },
    textBold: {
        color: 'white',
        fontWeight: '700',
    },
    monthControls: {
        flexDirection: 'row',
    },
    icon: {
        padding: 5,
        paddingHorizontal: 8,
    },
});

const propTypes = {
    /** A function that is called when the day is clicked */
    onChange: PropTypes.func.isRequired,

    /** A value initial of date */
    value: PropTypes.object,
};

const defaultProps = {
    value: new Date(),
};

function generateMonthMatrix(year, month) {
    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]).startOf('month');
    const matrix = [];
    let currentWeek = [];
    for (let i = 0; i < firstDay.weekday(); i++) {
        currentWeek.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const day = moment([year, month, i]);
        currentWeek.push(day.date());
        if (day.weekday() === 6) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        for (let i = currentWeek.length; i < 7; i++) {
            currentWeek.push(null);
        }
        matrix.push(currentWeek);
    }
    return matrix;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ArrowIcon = props => (
    <View style={[styles.icon, props?.direction === 'left' ? {transform: [{rotate: '180deg'}]} : undefined]}>
        <Icon src={Expensicons.ArrowRight} />
    </View>
);

const addMonths = (date, months) => {
    const d = new Date(date.getTime());
    const newMonth = d.getMonth() + months;
    d.setMonth(newMonth);
    return d;
};

const CalendarPicker = (props) => {
    const [currentDateView, setCurrentDateView] = React.useState(new Date());

    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const monthMatrix = generateMonthMatrix(currentYearView, currentMonthView);

    const onNextMonthPress = () => setCurrentDateView(prev => addMonths(prev, 1));
    const onPrevMonthPress = () => setCurrentDateView(prev => addMonths(prev, -1));
    const onMonthPickerPress = () => {};
    const onYearPickerPress = () => {};

    const onDayPress = (day) => {
        if (!props.onChange) {
            return;
        }
        const selectedDate = new Date(currentYearView, currentMonthView, day);
        props.onChange(selectedDate);
    };

    return (
        <View style={styles.root}>
            <View>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={onMonthPickerPress} style={[styles.rowCenter, flex.flex1, flex.justifyContentStart]}>
                        <Text style={styles.textBold}>{monthNames[currentMonthView]}</Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onYearPickerPress} style={[styles.rowCenter, flex.flex1, flex.justifyContentCenter]}>
                        <Text style={styles.textBold}>{currentYearView}</Text>
                        <ArrowIcon />
                    </TouchableOpacity>
                    <View style={[styles.rowCenter, flex.flex1, flex.justifyContentEnd]}>
                        <TouchableOpacity onPress={onPrevMonthPress}>
                            <ArrowIcon direction="left" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onNextMonthPress}>
                            <ArrowIcon />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.row}>
                    {_.map(daysOfWeek, (dayOfWeek => (
                        <View style={styles.dayContainer}>
                            <Text style={[styles.dayText, styles.textBold]}>{dayOfWeek[0]}</Text>
                        </View>
                    )))}
                </View>
                {_.map(monthMatrix, week => (
                    <View style={styles.row}>
                        {_.map(week, day => (
                            <TouchableOpacity
                                disabled={!day}
                                onPress={() => onDayPress(day)}
                                style={styles.dayContainer}
                            >
                                <View style={[moment(props.value).isSame(moment([currentYearView, currentMonthView, day]), 'day') && styles.daySelected]}>
                                    <Text style={styles.dayText}>{day || ''}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

CalendarPicker.displayName = 'CalendarPicker';
CalendarPicker.propTypes = propTypes;
CalendarPicker.defaultProps = defaultProps;

export default CalendarPicker;
