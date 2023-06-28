import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import Text from '../../Text';
import ScreenSlideAnimation from './ScreenSlideAnimation';
import YearPickerPage from './YearPickerPage';
import ArrowIcon from './ArrowIcon';
import styles from '../../../styles/styles';
import {propTypes as calendarPickerPropType, defaultProps as defaultCalendarPickerPropType} from './calendarPickerPropTypes';
import generateMonthMatrix from './generateMonthMatrix';
import withLocalize from '../../withLocalize';
import CONST from '../../../CONST';
import getButtonState from '../../../libs/getButtonState';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithFeedback from '../../Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';

class CalendarPicker extends React.PureComponent {
    constructor(props) {
        super(props);

        if (props.minDate >= props.maxDate) {
            throw new Error('Minimum date cannot be greater than the maximum date.');
        }

        let currentDateView = moment(props.value, CONST.DATE.MOMENT_FORMAT_STRING).toDate();
        if (props.maxDate < currentDateView) {
            currentDateView = props.maxDate;
        } else if (props.minDate > currentDateView) {
            currentDateView = props.minDate;
        }

        this.state = {
            currentDateView,
        };

        this.moveToPrevMonth = this.moveToPrevMonth.bind(this);
        this.moveToNextMonth = this.moveToNextMonth.bind(this);
        this.onDayPressed = this.onDayPressed.bind(this);
        this.onYearSelected = this.onYearSelected.bind(this);
    }

    onYearSelected(year) {
        this.setState(
            (prev) => ({
                currentDateView: moment(prev.currentDateView).set('year', year).toDate(),
            }),
            () => this.yearPickerRef.close(),
        );
    }

    /**
     * Calls the onSelected function with the selected date.
     * @param {Number} day - The day of the month that was selected.
     */
    onDayPressed(day) {
        this.setState(
            (prev) => ({
                currentDateView: moment(prev.currentDateView).set('date', day).toDate(),
            }),
            () => this.props.onSelected(moment(this.state.currentDateView).format('YYYY-MM-DD')),
        );
    }

    /**
     * Handles the user pressing the previous month arrow of the calendar picker.
     */
    moveToPrevMonth() {
        this.setState((prev) => ({currentDateView: moment(prev.currentDateView).subtract(1, 'M').toDate()}));
    }

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    moveToNextMonth() {
        this.setState((prev) => ({currentDateView: moment(prev.currentDateView).add(1, 'M').toDate()}));
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
                        onPress={() => this.yearPickerRef.open()}
                        style={[styles.alignItemsCenter, styles.flexRow, styles.flex1, styles.justifyContentStart]}
                        wrapperStyle={[styles.alignItemsCenter]}
                        hoverDimmingValue={1}
                        testID="currentYearButton"
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
                            shouldUseAutoHitSlop={false}
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
                            shouldUseAutoHitSlop={false}
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
                <ScreenSlideAnimation ref={(ref) => (this.yearPickerRef = ref)}>
                    <YearPickerPage
                        onYearChange={this.onYearSelected}
                        onClose={() => this.yearPickerRef.close()}
                        min={moment(this.props.minDate).year()}
                        max={moment(this.props.maxDate).year()}
                        currentYear={currentYearView}
                    />
                </ScreenSlideAnimation>
            </View>
        );
    }
}

CalendarPicker.propTypes = calendarPickerPropType;
CalendarPicker.defaultProps = defaultCalendarPickerPropType;

export default withLocalize(CalendarPicker);
