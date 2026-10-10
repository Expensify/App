import {fireEvent, render, screen} from '@testing-library/react-native';

import RangeDatePicker from '@components/Search/FilterComponents/RangeDatePicker';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type * as ReactNavigationNative from '@react-navigation/native';

import {addYears, format} from 'date-fns';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => () => null);
jest.mock('@components/DatePicker/CalendarPicker/YearPickerModal', () => () => null);

// When both calendars show the same month, every day label appears twice: the From calendar first, then the To calendar
const FROM_CALENDAR_INDEX = 0;
const TO_CALENDAR_INDEX = 1;

// A day of the current month, which is always inside CONST.CALENDAR_PICKER.MIN_DATE..MAX_DATE, so these tests don't expire
function dayOfThisMonth(day: number) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), day);
}

function toStoredDate(date: Date) {
    return format(date, CONST.DATE.FNS_FORMAT_STRING);
}

function toDayLabel(date: Date) {
    return DateUtils.formatToLongDateWithWeekday(date, undefined);
}

function pressDay(label: string, calendarIndex: number) {
    const day = screen.getAllByLabelText(label).at(calendarIndex);
    if (!day) {
        throw new Error(`No day labelled "${label}" in calendar ${calendarIndex}`);
    }
    fireEvent.press(day);
}

function pressArrow(testID: string, calendarIndex: number) {
    const arrow = screen.getAllByTestId(testID).at(calendarIndex);
    if (!arrow) {
        throw new Error(`No "${testID}" in calendar ${calendarIndex}`);
    }
    fireEvent.press(arrow);
}

describe('RangeDatePicker', () => {
    test('lets the From calendar select only days up to the To date', () => {
        // Given a range from the 5th to the 10th of this month
        const onFromSelected = jest.fn();
        render(
            <RangeDatePicker
                fromValue={toStoredDate(dayOfThisMonth(5))}
                toValue={toStoredDate(dayOfThisMonth(10))}
                onFromSelected={onFromSelected}
                onToSelected={jest.fn()}
            />,
        );

        // When the user presses the 11th and then the 10th in the From calendar
        pressDay(toDayLabel(dayOfThisMonth(11)), FROM_CALENDAR_INDEX);
        pressDay(toDayLabel(dayOfThisMonth(10)), FROM_CALENDAR_INDEX);

        // Then only the 10th is selected, so From can never end up after To
        expect(onFromSelected).toHaveBeenCalledTimes(1);
        expect(onFromSelected).toHaveBeenCalledWith(toStoredDate(dayOfThisMonth(10)));
    });

    test('lets the To calendar select only days from the From date', () => {
        // Given a range from the 5th to the 10th of this month
        const onToSelected = jest.fn();
        render(
            <RangeDatePicker
                fromValue={toStoredDate(dayOfThisMonth(5))}
                toValue={toStoredDate(dayOfThisMonth(10))}
                onFromSelected={jest.fn()}
                onToSelected={onToSelected}
            />,
        );

        // When the user presses the 4th and then the 5th in the To calendar
        pressDay(toDayLabel(dayOfThisMonth(4)), TO_CALENDAR_INDEX);
        pressDay(toDayLabel(dayOfThisMonth(5)), TO_CALENDAR_INDEX);

        // Then only the 5th is selected, so To can never end up before From
        expect(onToSelected).toHaveBeenCalledTimes(1);
        expect(onToSelected).toHaveBeenCalledWith(toStoredDate(dayOfThisMonth(5)));
    });

    test('limits the From calendar by a To date typed without leading zeros', () => {
        // Given a range typed in a Search query without leading zeros, from the 5th to the 9th of this month, which Search's date validation accepts
        const onFromSelected = jest.fn();
        const fifth = dayOfThisMonth(5);
        const ninth = dayOfThisMonth(9);
        render(
            <RangeDatePicker
                fromValue={`${fifth.getFullYear()}-${fifth.getMonth() + 1}-5`}
                toValue={`${ninth.getFullYear()}-${ninth.getMonth() + 1}-9`}
                onFromSelected={onFromSelected}
                onToSelected={jest.fn()}
            />,
        );

        // When the user presses the 10th and then the 9th in the From calendar
        pressDay(toDayLabel(dayOfThisMonth(10)), FROM_CALENDAR_INDEX);
        pressDay(toDayLabel(ninth), FROM_CALENDAR_INDEX);

        // Then only the 9th is selected, because the typed To date still limits From
        expect(onFromSelected).toHaveBeenCalledTimes(1);
        expect(onFromSelected).toHaveBeenCalledWith(toStoredDate(ninth));
    });

    test('keeps the From calendar free to move past the month and year of the To date', () => {
        // Given a range whose To date is February 10, 2025
        const toValue = '2025-02-10';

        // When the range picker opens, with both calendars on February 2025
        render(
            <RangeDatePicker
                fromValue="2025-02-05"
                toValue={toValue}
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // Then the From calendar's next-month and next-year arrows stay enabled, because the To date only limits which days can be selected
        expect(screen.getAllByTestId('next-month-arrow').at(FROM_CALENDAR_INDEX)).toBeEnabled();
        expect(screen.getAllByTestId('next-year-arrow').at(FROM_CALENDAR_INDEX)).toBeEnabled();
    });

    test('opens the From calendar on the month of a past To date when only To is set', () => {
        // Given a range with only a To date of January 15, 2020, as a typed date<=2020-01-15 query gives
        const toValue = '2020-01-15';

        // When the range picker opens
        render(
            <RangeDatePicker
                toValue={toValue}
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // Then the From calendar opens on January 2020 instead of today, where every day is after the To date and can't be selected
        expect(screen.getAllByTestId('currentMonthText').at(FROM_CALENDAR_INDEX)).toHaveTextContent('January');
        expect(screen.getAllByTestId('currentYearText').at(FROM_CALENDAR_INDEX)).toHaveTextContent('2020');
    });

    test('opens the To calendar on the month of a future From date when only From is set', () => {
        // Given a range with only a From date two years from now
        const fromDate = addYears(new Date(), 2);

        // When the range picker opens
        render(
            <RangeDatePicker
                fromValue={format(fromDate, CONST.DATE.FNS_FORMAT_STRING)}
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // Then the To calendar opens on the From date's year instead of today, where every day is before the From date and can't be selected
        expect(screen.getAllByTestId('currentYearText').at(TO_CALENDAR_INDEX)).toHaveTextContent(fromDate.getFullYear().toString());
    });

    test('moves the empty From calendar to the month of a past To date picked first', () => {
        // Given an open range picker with both ends empty, so both calendars show the current month
        const {rerender} = render(
            <RangeDatePicker
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // When the user picks January 15, 2020 as the To date first
        rerender(
            <RangeDatePicker
                toValue="2020-01-15"
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // Then the From calendar moves to January 2020, because staying on the current month would leave every day there after To and disabled
        expect(screen.getAllByTestId('currentMonthText').at(FROM_CALENDAR_INDEX)).toHaveTextContent('January');
        expect(screen.getAllByTestId('currentYearText').at(FROM_CALENDAR_INDEX)).toHaveTextContent('2020');
    });

    test('moves the empty To calendar to the year of a future From date picked first', () => {
        // Given an open range picker with both ends empty, so both calendars show the current month
        const {rerender} = render(
            <RangeDatePicker
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // When the user picks a From date two years from now first
        const fromDate = addYears(new Date(), 2);
        rerender(
            <RangeDatePicker
                fromValue={format(fromDate, CONST.DATE.FNS_FORMAT_STRING)}
                onFromSelected={jest.fn()}
                onToSelected={jest.fn()}
            />,
        );

        // Then the To calendar moves to the From date's year, because staying on the current month would leave every day there before From and disabled
        expect(screen.getAllByTestId('currentYearText').at(TO_CALENDAR_INDEX)).toHaveTextContent(fromDate.getFullYear().toString());
    });

    test('keeps the calendars free to move past CONST.CALENDAR_PICKER.MAX_DATE while blocking the days after it', () => {
        // Given a range whose From date is MAX_DATE, the last day Search accepts
        const onFromSelected = jest.fn();
        const maxDate = CONST.CALENDAR_PICKER.MAX_DATE;
        render(
            <RangeDatePicker
                fromValue={format(maxDate, CONST.DATE.FNS_FORMAT_STRING)}
                onFromSelected={onFromSelected}
                onToSelected={jest.fn()}
            />,
        );

        // Then the From calendar's next-year arrow is enabled, because Search navigation stays free
        expect(screen.getAllByTestId('next-year-arrow').at(FROM_CALENDAR_INDEX)).toBeEnabled();

        // When the user moves to the next month and presses its 15th, which is after MAX_DATE
        pressArrow('next-month-arrow', FROM_CALENDAR_INDEX);
        const dayAfterMaxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 15);
        pressDay(DateUtils.formatToLongDateWithWeekday(dayAfterMaxDate, undefined), FROM_CALENDAR_INDEX);

        // Then nothing is selected, because only days up to MAX_DATE can be selected
        expect(onFromSelected).not.toHaveBeenCalled();
    });
});
