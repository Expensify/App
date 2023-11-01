import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import Text from '../../Text';
import YearPickerModal from './YearPickerModal';
import ArrowIcon from './ArrowIcon';
import styles from '../../../styles/styles';
import generateMonthMatrix from './generateMonthMatrix';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import CONST from '../../../CONST';
import getButtonState from '../../../libs/getButtonState';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithFeedback from '../../Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';

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
};

const defaultProps = {
    value: new Date(),
    minDate: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR).toDate(),
    maxDate: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR).toDate(),
    onSelected: () => {},
};

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

        const minYear = moment(this.props.minDate).year();
        const maxYear = moment(this.props.maxDate).year();

        this.state = {
            currentDateView,
            isYearPickerVisible: false,
            years: _.map(
                Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear),
                (value) => ({
                    text: value.toString(),
                    value,
                    keyForList: value.toString(),
                    isSelected: value === currentDateView.getFullYear(),
                }),
            ),
        };

        this.moveToPrevMonth = this.moveToPrevMonth.bind(this);
        this.moveToNextMonth = this.moveToNextMonth.bind(this);
        this.onDayPressed = this.onDayPressed.bind(this);
        this.onYearSelected = this.onYearSelected.bind(this);
    }

    onYearSelected(year) {
        this.setState((prev) => {
            const newCurrentDateView = moment(prev.currentDateView).set('year', year).toDate();

            return {
                currentDateView: newCurrentDateView,
                isYearPickerVisible: false,
                years: _.map(prev.years, (item) => ({
                    ...item,
                    isSelected: item.value === newCurrentDateView.getFullYear(),
                })),
            };
        });
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
        this.setState((prev) => ({currentDateView: moment(prev.currentDateView).subtract(1, 'months').toDate()}));
    }

    /**
     * Handles the user pressing the next month arrow of the calendar picker.
     */
    moveToNextMonth() {
        this.setState((prev) => ({currentDateView: moment(prev.currentDateView).add(1, 'months').toDate()}));
    }

    render() {
        const monthNames = _.map(moment.localeData(this.props.preferredLocale).months(), Str.recapitalize);
        const daysOfWeek = _.map(moment.localeData(this.props.preferredLocale).weekdays(), (day) => day.toUpperCase());
        const currentMonthView = this.state.currentDateView.getMonth();
        const currentYearView = this.state.currentDateView.getFullYear();
        const calendarDaysMatrix = generateMonthMatrix(currentYearView, currentMonthView);
        const hasAvailableDatesNextMonth = moment(this.props.maxDate).endOf('month').endOf('day') >= moment(this.state.currentDateView).add(1, 'months');
        const hasAvailableDatesPrevMonth = moment(this.props.minDate).startOf('month').startOf('day') <= moment(this.state.currentDateView).subtract(1, 'months');

        return (
            <View>
                <View
                    style={[styles.calendarHeader, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ph4, styles.pr1]}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                >
                    <PressableWithFeedback
                        onPress={() => this.setState({isYearPickerVisible: true})}
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
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
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
                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
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
                <YearPickerModal
                    isVisible={this.state.isYearPickerVisible}
                    years={this.state.years}
                    currentYear={currentYearView}
                    onYearChange={this.onYearSelected}
                    onClose={() => this.setState({isYearPickerVisible: false})}
                />
            </View>
        );
    }
}

CalendarPicker.propTypes = propTypes;
CalendarPicker.defaultProps = defaultProps;

export default withLocalize(CalendarPicker);
