import _ from 'underscore';
import React from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import * as Expensicons from './Icon/Expensicons';
import Icon from './Icon';

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    rowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayContainer: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: 'white',
    },
    textBold: {
        color: 'white',
        fontWeight: '700',
    },
    calendarHeader: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingRight: 5,
    },
    monthControls: {
        flexDirection: 'row',
    },
    icon: {
        padding: 5,
        paddingHorizontal: 8,
    },
});

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
        currentWeek.push({
            day: day.date(),
            weekday: day.format('dddd'),
        });
        if (day.weekday() === 6) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        matrix.push(currentWeek);
    }
    return matrix;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ArrowIcon = (props) => {
    const {direction = 'right', onPress} = props;
    return (
        <TouchableOpacity onPress={onPress} style={[styles.icon, direction === 'left' ? {transform: [{rotate: '180deg'}]} : undefined]}>
            <Icon src={Expensicons.ArrowRight} />
        </TouchableOpacity>
    );
};

const addMonths = (date, months) => {
    const d = new Date(date.getTime());
    const newMonth = d.getMonth() + months;
    d.setMonth(newMonth);
    return d;
};

const CalendarPicker = () => {
    const [currentDateView, setCurrentDateView] = React.useState(new Date());

    const currentMonthView = currentDateView.getMonth();
    const currentYearView = currentDateView.getFullYear();
    const monthMatrix = generateMonthMatrix(currentYearView, currentMonthView);

    const onNextMonthPress = () => setCurrentDateView(prev => addMonths(prev, 1));
    const onPrevMonthPress = () => setCurrentDateView(prev => addMonths(prev, -1));

    return (
        <View style={styles.root}>
            <View>
                <View style={styles.calendarHeader}>
                    <View style={styles.rowCenter}>
                        <Text style={styles.textBold}>{monthNames[currentMonthView]}</Text>
                        <ArrowIcon />
                    </View>
                    <View style={styles.rowCenter}>
                        <Text style={styles.textBold}>{currentYearView}</Text>
                        <ArrowIcon />
                    </View>
                    <View style={styles.rowCenter}>
                        <ArrowIcon onPress={onPrevMonthPress} direction="left" />
                        <ArrowIcon onPress={onNextMonthPress} />
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
                            <View style={styles.dayContainer}>
                                <Text style={styles.dayText}>{day ? day.day : ''}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

CalendarPicker.displayName = 'CalendarPicker';

export default CalendarPicker;
