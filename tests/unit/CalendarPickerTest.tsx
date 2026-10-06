import {fireEvent, render, screen, within} from '@testing-library/react-native';

import CalendarPicker from '@components/DatePicker/CalendarPicker';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {ComponentType, ReactNode} from 'react';

import {addMonths, addYears, format, subMonths, subYears} from 'date-fns';

type MockPressableProps = {testID?: string; accessibilityLabel?: string; role?: string; disabled?: boolean; onPress?: () => void; children?: ReactNode};
type MockTextProps = {children?: ReactNode};
type MockViewProps = {testID?: string; children?: ReactNode};
type MockReactNativePrimitives = {
    Pressable: ComponentType<MockPressableProps>;
    Text: ComponentType<MockTextProps>;
    View: ComponentType<MockViewProps>;
};

const monthNames = DateUtils.getMonthNames(undefined);

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

type MockMonthPickerModalProps = {
    isVisible: boolean;
    minMonth: number;
    maxMonth: number;
    onMonthChange?: (month: number) => void;
    onClose?: () => void;
};
type MockYearPickerModalProps = {
    isVisible: boolean;
    minYear: number;
    maxYear: number;
    onYearChange?: (year: number) => void;
    onClose?: () => void;
};

jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Pressable, Text, View} = ReactNativeActual;
    function MockMonthPickerModal({isVisible, minMonth, maxMonth, onMonthChange, onClose}: MockMonthPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        // One row per month, disabled outside the range the calendar passes, so the tests can check that range and pick from it
        const months = Array.from({length: 12}, (v, i) => i);
        return (
            <View testID="MonthPickerModal">
                {months.map((month) => (
                    <Pressable
                        key={month}
                        testID={`month-option-${month}`}
                        accessibilityLabel={`month-${month}`}
                        role="button"
                        disabled={month < minMonth || month > maxMonth}
                        onPress={() => onMonthChange?.(month)}
                    >
                        <Text>{`month-${month}`}</Text>
                    </Pressable>
                ))}
                <Pressable
                    testID="month-modal-close"
                    accessibilityLabel="close"
                    role="button"
                    onPress={onClose}
                >
                    <Text>close</Text>
                </Pressable>
            </View>
        );
    }
    return MockMonthPickerModal;
});

jest.mock('@components/DatePicker/CalendarPicker/YearPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Pressable, Text, View} = ReactNativeActual;
    function MockYearPickerModal({isVisible, minYear, maxYear, onYearChange, onClose}: MockYearPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        // One row per year in the range the calendar passes, so the tests can check that range and pick from it
        const years = Array.from({length: maxYear - minYear + 1}, (v, i) => minYear + i);
        return (
            <View testID="YearPickerModal">
                {years.map((year) => (
                    <Pressable
                        key={year}
                        testID={`year-option-${year}`}
                        accessibilityLabel={year.toString()}
                        role="button"
                        onPress={() => onYearChange?.(year)}
                    >
                        <Text>{year.toString()}</Text>
                    </Pressable>
                ))}
                <Pressable
                    testID="year-modal-close"
                    accessibilityLabel="close"
                    role="button"
                    onPress={onClose}
                >
                    <Text>close</Text>
                </Pressable>
            </View>
        );
    }
    return MockYearPickerModal;
});

describe('CalendarPicker', () => {
    test('renders calendar component', () => {
        render(<CalendarPicker />);
    });

    test('displays the current month and year', () => {
        const currentDate = new Date();
        const maxDate = addYears(new Date(currentDate), 1);
        const minDate = subYears(new Date(currentDate), 1);
        render(
            <CalendarPicker
                maxDate={maxDate}
                minDate={minDate}
            />,
        );

        expect(screen.getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
        expect(screen.getByText(currentDate.getFullYear().toString())).toBeTruthy();
    });

    test('clicking next month arrow updates the displayed month', () => {
        // Given a picker showing the current month, with bounds a year either side of today so the test doesn't depend on the date it runs
        const minDate = subYears(new Date(), 1);
        const maxDate = addYears(new Date(), 1);
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next-month arrow
        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Then the calendar shows next month, because it is inside the bounds
        const nextMonth = addMonths(new Date(), 1).getMonth();
        expect(screen.getByText(monthNames.at(nextMonth) ?? '')).toBeTruthy();
    });

    test('clicking previous month arrow updates the displayed month', () => {
        render(<CalendarPicker />);

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        const prevMonth = subMonths(new Date(), 1).getMonth();
        expect(screen.getByText(monthNames.at(prevMonth) ?? '')).toBeTruthy();
    });

    test('clicking a day updates the selected date', () => {
        // Given a picker showing January 2023, inside its bounds
        const onSelectedMock = jest.fn();
        const minDate = new Date(2022, 0, 1);
        const maxDate = new Date(2030, 0, 1);
        const value = new Date(2023, 0, 1);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        // When the user presses the 15th
        fireEvent.press(screen.getByText('15'));

        // Then onSelected is called once with January 15, 2023, so the caller can save the picked day
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2023, 0, 15));
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
    });

    test('highlights the day of the value', () => {
        // Given a value of June 15, 2025
        const value = new Date(2025, 5, 15);

        // When the calendar opens on that value
        render(
            <CalendarPicker
                value={value}
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
            />,
        );

        // Then June 15 is shown as selected and the day before it is not, so the user can see which day is picked
        expect(screen.getByLabelText('Sunday, June 15, 2025')).toBeSelected();
        expect(screen.getByLabelText('Saturday, June 14, 2025')).not.toBeSelected();
    });

    test('highlights no day when there is no value', () => {
        // Given no value, as when the user hasn't picked a date yet
        // When the calendar opens, which it does on today
        render(<CalendarPicker />);

        // Then today is shown but not selected, because nothing has been picked yet
        expect(screen.getByLabelText(DateUtils.formatToLongDateWithWeekday(new Date(), undefined))).not.toBeSelected();
    });

    test('clicking next month arrow and selecting day updates the selected date', () => {
        // Given a picker showing January 2022, the month of minDate
        const onSelectedMock = jest.fn();
        const value = new Date(2022, 0, 1);
        const minDate = new Date(2022, 0, 1);
        const maxDate = new Date(2030, 0, 1);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        // When the user moves to February and presses the 15th
        fireEvent.press(screen.getByTestId('next-month-arrow'));
        fireEvent.press(screen.getByText('15'));

        // Then onSelected is called with February 15, 2022, because the picked day belongs to the month now shown
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2022, 1, 15));
    });

    test('should disable the previous month arrow in the month of minDate', () => {
        // Given a minDate of February 10, 2003
        const minDate = new Date(2003, 1, 10);

        // When the calendar opens on February 17, 2003, in the month of minDate
        render(
            <CalendarPicker
                minDate={minDate}
                value={new Date(2003, 1, 17)}
            />,
        );

        // Then the previous-month arrow is disabled, because January 2003 has no day on or after minDate
        expect(screen.getByTestId('prev-month-arrow')).toBeDisabled();
    });

    test('should disable the next month arrow in the month of maxDate', () => {
        // Given a maxDate of February 24, 2003
        const maxDate = new Date(2003, 1, 24);

        // When the calendar opens on February 17, 2003, in the month of maxDate
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={new Date(2003, 1, 17)}
            />,
        );

        // Then the next-month arrow is disabled, because March 2003 has no day on or before maxDate
        expect(screen.getByTestId('next-month-arrow')).toBeDisabled();
    });

    test('should allow navigating to the month of the max date when it has less days than the selected date', () => {
        // Given a maxDate of November 27, 2003, in a month with only 30 days
        const maxDate = new Date(2003, 10, 27);
        const value = new Date(2003, 9, 31);

        // When the calendar opens on October 31, 2003
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // Then the next-month arrow is enabled, because November has days up to maxDate even though it has no 31st
        expect(screen.getByTestId('next-month-arrow')).toBeEnabled();
    });

    test('should open the calendar on a month from max date if it is earlier than current month', () => {
        // Given a maxDate of March 1, 2011, before today, and no value
        const onSelectedMock = jest.fn();
        const maxDate = new Date(2011, 2, 1);
        render(
            <CalendarPicker
                onSelected={onSelectedMock}
                maxDate={maxDate}
            />,
        );

        // When the user presses the 1st
        fireEvent.press(screen.getByText('1'));

        // Then March 1, 2011 is selected, because the calendar opened on the month of maxDate instead of today
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2011, 2, 1));
    });

    test('should open the calendar on a year from max date if it is earlier than current year', () => {
        // Given a maxDate in 2011, before today, and no value
        const maxDate = new Date(2011, 2, 1);

        // When the calendar opens
        render(<CalendarPicker maxDate={maxDate} />);

        // Then it shows 2011, because today is after maxDate and the calendar opens inside its bounds
        expect(within(screen.getByTestId('currentYearText')).getByText('2011')).toBeTruthy();
    });

    test('should open the calendar on a month from min date if it is later than current month', () => {
        // Given a minDate two years after today, and no value
        const minDate = addYears(new Date(), 2);
        const maxDate = addYears(new Date(), 5);

        // When the calendar opens
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // Then it shows the year of minDate, because today is before minDate and the calendar opens inside its bounds
        expect(within(screen.getByTestId('currentYearText')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });

    test('should not allow to press earlier day than minDate', () => {
        const value = new Date(2003, 1, 17);
        const minDate = new Date(2003, 1, 16);
        const onSelectedMock = jest.fn();

        // Given a minDate of February 16, 2003
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        // When the day 15 is pressed
        fireEvent.press(screen.getByLabelText('Saturday, February 15, 2003'));

        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 16 is pressed
        fireEvent.press(screen.getByLabelText('Sunday, February 16, 2003'));

        // Then the onSelected should be called as the label 16 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2003, 1, 16));
    });

    test('should not allow to press later day than max', () => {
        const value = new Date(2003, 1, 17);
        const maxDate = new Date(2003, 1, 24);
        const onSelectedMock = jest.fn();

        // Given a maxDate of February 24, 2003
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        // When the day 25 is pressed
        fireEvent.press(screen.getByLabelText('Tuesday, February 25, 2003'));

        // Then the onSelected should not be called as the label 25 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 24 is pressed
        fireEvent.press(screen.getByLabelText('Monday, February 24, 2003'));

        // Then the onSelected should be called as the label 24 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2003, 1, 24));
    });

    test('should allow to press min date', () => {
        const value = new Date(2003, 1, 17);
        const minDate = new Date(2003, 1, 16);

        // Given a minDate of February 16, 2003
        // When the calendar opens on February 17, 2003
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        // Then the 16th can be pressed, because minDate itself is selectable
        expect(screen.getByLabelText('Sunday, February 16, 2003')).toBeEnabled();
    });

    test('should allow to press max date', () => {
        const value = new Date(2003, 1, 17);
        const maxDate = new Date(2003, 1, 24);

        // Given a maxDate of February 24, 2003
        // When the calendar opens on February 17, 2003
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // Then the 24th can be pressed, because maxDate itself is selectable
        expect(screen.getByLabelText('Monday, February 24, 2003')).toBeEnabled();
    });

    test('clicking next year arrow updates the displayed year', () => {
        // Given a picker showing June 2025, with bounds from 2020 to 2030
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 5, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next-year arrow
        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Then the calendar shows 2026, because the next year is inside the bounds
        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
    });

    test('clicking previous year arrow updates the displayed year', () => {
        // Given a picker showing June 2025, with bounds from 2020 to 2030
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 5, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the previous-year arrow
        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Then the calendar shows 2024, because the previous year is inside the bounds
        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
    });

    test('should disable the previous year arrow in the year of minDate', () => {
        // Given a minDate in 2023
        const minDate = new Date(2023, 0, 1);
        const value = new Date(2023, 5, 15);

        // When the calendar opens on June 2023, in the year of minDate
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        // Then the previous year arrow is disabled, because every earlier year is before minDate and has no selectable days
        expect(screen.getByTestId('prev-year-arrow')).toBeDisabled();
    });

    test('should disable the next year arrow in the year of maxDate', () => {
        // Given a maxDate in 2023
        const maxDate = new Date(2023, 11, 31);
        const value = new Date(2023, 5, 15);

        // When the calendar opens on June 2023, in the year of maxDate
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // Then the next year arrow is disabled, because every later year is after maxDate and has no selectable days
        expect(screen.getByTestId('next-year-arrow')).toBeDisabled();
    });

    test('prev year arrow should move to minDate when the same month last year is before it', () => {
        // Given a picker showing March 2024 with minDate in November 2023
        const minDate = new Date(2023, 10, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2024, 2, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the previous year arrow
        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Then the calendar shows November 2023, the month of minDate, instead of March 2023 where every day is disabled
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(10) ?? '')).toBeTruthy();
    });

    test('next year arrow should move to maxDate when the same month next year is after it', () => {
        // Given a picker showing September 2024 with maxDate in April 2025
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2025, 3, 20);
        const value = new Date(2024, 8, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next year arrow
        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Then the calendar shows April 2025, the month of maxDate, instead of September 2025 where every day is disabled
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(3) ?? '')).toBeTruthy();
    });

    test('moves to maxDate when maxDate moves before the shown month', () => {
        // Given a picker showing June 2025
        const minDate = new Date(2020, 0, 1);
        const {rerender} = render(
            <CalendarPicker
                value={new Date(2025, 5, 15)}
                minDate={minDate}
                maxDate={new Date(2030, 11, 31)}
            />,
        );

        // When maxDate moves to March 2025 while the calendar stays mounted
        rerender(
            <CalendarPicker
                value={new Date(2025, 5, 15)}
                minDate={minDate}
                maxDate={new Date(2025, 2, 20)}
            />,
        );

        // Then the calendar shows March 2025, the month of the new maxDate, instead of staying on June where every day is now disabled
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(2) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
    });

    test('clicking next month arrow in December should update year to next year', () => {
        // Given a picker showing December 2025
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 11, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next-month arrow
        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Then the calendar shows January 2026, because the month after December is in the next year
        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
        expect(screen.getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking previous month arrow in January should update year to previous year', () => {
        // Given a picker showing January 2025
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 0, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the previous-month arrow
        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Then the calendar shows December 2024, because the month before January is in the previous year
        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
        expect(screen.getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('next year arrow should not navigate above CONST.CALENDAR_PICKER.MAX_YEAR', () => {
        // Given a picker without a maxDate, so the default one in CONST.CALENDAR_PICKER.MAX_YEAR applies, showing June of that year
        const value = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 5, 15);
        render(<CalendarPicker value={value} />);

        // When the user presses the next-year arrow
        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Then the calendar stays in MAX_YEAR, because every later day is after the default maxDate
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MAX_YEAR.toString())).toBeTruthy();
    });

    test('prev year arrow should not navigate below CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        // Given a picker without a minDate, so the default one in CONST.CALENDAR_PICKER.MIN_YEAR applies, showing a month of that year
        const value = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 5, 15);
        render(<CalendarPicker value={value} />);

        // When the user presses the previous-year arrow
        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Then the calendar stays in MIN_YEAR, because every earlier day is before the default minDate
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MIN_YEAR.toString())).toBeTruthy();
    });

    test('next month arrow should not navigate past the month of maxDate', () => {
        // Given a picker showing December 2030, the month of maxDate
        const value = new Date(2030, 11, 15);
        const maxDate = new Date(2030, 11, 31);
        render(
            <CalendarPicker
                value={value}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next-month arrow
        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Then the calendar stays on December 2030, because every later day is after maxDate
        expect(within(screen.getByTestId('currentYearText')).getByText('2030')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('prev month arrow should not navigate past the month of minDate', () => {
        // Given a picker showing January 2020, the month of minDate
        const value = new Date(2020, 0, 15);
        const minDate = new Date(2020, 0, 1);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
            />,
        );

        // When the user presses the previous-month arrow
        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Then the calendar stays on January 2020, because every earlier day is before minDate
        expect(within(screen.getByTestId('currentYearText')).getByText('2020')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking the month button opens the month picker and selecting a month updates the calendar', () => {
        // Given a picker showing June 2025
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 5, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user opens the month list and picks September
        fireEvent.press(screen.getByTestId('currentMonthButton'));
        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        expect(monthPickerModal).toBeTruthy();
        fireEvent.press(within(monthPickerModal).getByTestId('month-option-8'));

        // Then the calendar shows September, so the list is a shortcut for the month arrows
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(8) ?? '')).toBeTruthy();
    });

    test('clicking the year button opens the year picker and selecting a year updates the calendar', () => {
        // Given a picker showing June 2025
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date(2030, 11, 31);
        const value = new Date(2025, 5, 15);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user opens the year list and picks 2027
        fireEvent.press(screen.getByTestId('currentYearButton'));
        const yearPickerModal = screen.getByTestId('YearPickerModal');
        expect(yearPickerModal).toBeTruthy();
        fireEvent.press(within(yearPickerModal).getByTestId('year-option-2027'));

        // Then the calendar shows 2027, so the list is a shortcut for the year arrows
        expect(within(screen.getByTestId('currentYearText')).getByText('2027')).toBeTruthy();
    });

    test('picking a year from February 29 shows February of a year without it', () => {
        // Given a picker showing February 29, 2024
        render(
            <CalendarPicker
                value={new Date(2024, 1, 29)}
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
            />,
        );

        // When the user picks 2023 from the year list
        fireEvent.press(screen.getByTestId('currentYearButton'));
        fireEvent.press(within(screen.getByTestId('YearPickerModal')).getByTestId('year-option-2023'));

        // Then the calendar shows February 2023, as the previous-year arrow does, instead of moving on to March
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(1) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
    });

    test('ignores an invalid minDate instead of breaking the calendar', () => {
        // Given a minDate that is an Invalid Date, as a bound built from bad data would be
        const minDate = new Date(Number.NaN);

        // When the calendar opens on June 15, 2025, with a valid maxDate
        render(
            <CalendarPicker
                value={new Date(2025, 5, 15)}
                minDate={minDate}
                maxDate={new Date(2025, 5, 30)}
            />,
        );

        // Then it shows June 2025 with its days enabled, because the invalid bound falls back to the default instead of making every value invalid
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
        expect(screen.getByLabelText('Sunday, June 15, 2025')).toBeEnabled();
    });

    test('disables the year button when the bounds are in one year', () => {
        // Given bounds that both fall in 2025
        const minDate = new Date(2025, 0, 10);
        const maxDate = new Date(2025, 10, 20);

        // When the calendar opens
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // Then the year button is disabled, because the year list would offer only the year already shown
        expect(screen.getByTestId('currentYearButton')).toBeDisabled();
    });

    test('disables the month button when the bounds are in one month', () => {
        // Given bounds that both fall in October 2025, like a Schedule a call window
        const minDate = new Date(2025, 9, 7);
        const maxDate = new Date(2025, 9, 28);

        // When the calendar opens
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // Then the month button is disabled, because the month list would offer only the month already shown
        expect(screen.getByTestId('currentMonthButton')).toBeDisabled();
    });

    test('closing the year picker via onClose hides the modal', () => {
        render(<CalendarPicker />);

        fireEvent.press(screen.getByTestId('currentYearButton'));
        expect(screen.getByTestId('YearPickerModal')).toBeTruthy();

        fireEvent.press(screen.getByTestId('year-modal-close'));
        expect(screen.queryByTestId('YearPickerModal')).toBeNull();
    });

    test('closing the month picker via onClose hides the modal', () => {
        render(<CalendarPicker />);

        fireEvent.press(screen.getByTestId('currentMonthButton'));
        expect(screen.getByTestId('MonthPickerModal')).toBeTruthy();

        fireEvent.press(screen.getByTestId('month-modal-close'));
        expect(screen.queryByTestId('MonthPickerModal')).toBeNull();
    });

    test('month picker should list all 12 months enabled in a year inside the bounds', () => {
        // Given a picker showing June 2025, a year far from both bounds
        render(
            <CalendarPicker
                value={new Date(2025, 5, 15)}
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
            />,
        );

        // When the user opens the month list
        fireEvent.press(screen.getByTestId('currentMonthButton'));

        // Then every month is listed and can be picked
        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        for (const month of monthNames.keys()) {
            expect(within(monthPickerModal).getByTestId(`month-option-${month}`)).toBeEnabled();
        }
    });
});

describe('CalendarPicker with date of birth bounds', () => {
    // Date of birth bounds (150 to 18 years before 2026-10-06), fixed so the tests don't depend on today
    const minDate = new Date(1876, 9, 6);
    const maxDate = new Date(2008, 9, 6);

    test('lists only the years from minDate to maxDate', () => {
        // Given a date of birth picker, which opens on maxDate because today is after it
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user opens the year list
        fireEvent.press(screen.getByTestId('currentYearButton'));

        // Then it runs from 1876 to 2008, so every year offered has selectable days and the oldest allowed birth years are reachable
        const yearPickerModal = screen.getByTestId('YearPickerModal');
        expect(within(yearPickerModal).getByTestId('year-option-1876')).toBeTruthy();
        expect(within(yearPickerModal).getByTestId('year-option-2008')).toBeTruthy();
        expect(within(yearPickerModal).queryByTestId('year-option-1875')).toBeNull();
        expect(within(yearPickerModal).queryByTestId('year-option-2009')).toBeNull();
    });

    test('moves to the previous month in a year before CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        // Given a picker showing June 1900, a year that is only in the list because minDate is in 1876
        render(
            <CalendarPicker
                value={new Date(1900, 5, 15)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the previous-month arrow
        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Then the calendar shows May 1900, so month navigation works in every year the list offers
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(4) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('1900')).toBeTruthy();
    });

    test('stops the next-month arrow at the month of maxDate', () => {
        // Given a picker showing September 2008, the month before maxDate
        render(
            <CalendarPicker
                value={new Date(2008, 8, 15)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the next-month arrow
        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Then the calendar shows October 2008 with the arrow disabled, so it can't move to November, where every day is after maxDate
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(9) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('2008')).toBeTruthy();
        expect(screen.getByTestId('next-month-arrow')).toBeDisabled();
    });

    test('stops the previous-month arrow at the month of minDate', () => {
        // Given a picker showing November 1876, the month after minDate
        render(
            <CalendarPicker
                value={new Date(1876, 10, 15)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user presses the previous-month arrow
        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Then the calendar shows October 1876 with the arrow disabled, so it can't move to September, where every day is before minDate
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(9) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('1876')).toBeTruthy();
        expect(screen.getByTestId('prev-month-arrow')).toBeDisabled();
    });

    test('greys out the months after maxDate in the year of maxDate', () => {
        // Given a picker showing October 2008, the month of maxDate
        render(
            <CalendarPicker
                value={new Date(2008, 9, 1)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user opens the month list
        fireEvent.press(screen.getByTestId('currentMonthButton'));

        // Then all 12 months are listed, but November and December are disabled because every day in them is after maxDate
        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        expect(within(monthPickerModal).getByTestId('month-option-0')).toBeEnabled();
        expect(within(monthPickerModal).getByTestId('month-option-9')).toBeEnabled();
        expect(within(monthPickerModal).getByTestId('month-option-10')).toBeDisabled();
        expect(within(monthPickerModal).getByTestId('month-option-11')).toBeDisabled();
    });

    test('greys out the months before minDate in the year of minDate', () => {
        // Given a picker showing October 1876, the month of minDate
        render(
            <CalendarPicker
                value={new Date(1876, 9, 15)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user opens the month list
        fireEvent.press(screen.getByTestId('currentMonthButton'));

        // Then all 12 months are listed, but January to September are disabled because every day in them is before minDate
        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        expect(within(monthPickerModal).getByTestId('month-option-0')).toBeDisabled();
        expect(within(monthPickerModal).getByTestId('month-option-8')).toBeDisabled();
        expect(within(monthPickerModal).getByTestId('month-option-9')).toBeEnabled();
        expect(within(monthPickerModal).getByTestId('month-option-11')).toBeEnabled();
    });

    test('moves to maxDate when the year picked from the list would land after it', () => {
        // Given a picker showing December 2007
        render(
            <CalendarPicker
                value={new Date(2007, 11, 15)}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When the user picks 2008 from the year list
        fireEvent.press(screen.getByTestId('currentYearButton'));
        fireEvent.press(within(screen.getByTestId('YearPickerModal')).getByTestId('year-option-2008'));

        // Then the calendar shows October 2008, the month of maxDate, instead of December 2008 where every day is disabled
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(9) ?? '')).toBeTruthy();
        expect(within(screen.getByTestId('currentYearText')).getByText('2008')).toBeTruthy();
    });

    test('updates the year list when the bounds change while the calendar is shown', () => {
        // Given a picker whose maxDate is in 2008
        const {rerender} = render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        // When maxDate moves to 2010 while the calendar stays mounted, and the user opens the year list
        rerender(
            <CalendarPicker
                minDate={minDate}
                maxDate={new Date(2010, 9, 6)}
            />,
        );
        fireEvent.press(screen.getByTestId('currentYearButton'));

        // Then the list follows the new bound, so it never offers years the current bounds rule out
        expect(within(screen.getByTestId('YearPickerModal')).getByTestId('year-option-2010')).toBeTruthy();
    });
});

describe('CalendarPicker isDateSelectable', () => {
    test('disables the days it rejects without limiting navigation', () => {
        // Given a picker that only accepts days up to February 10, 2003
        const onSelectedMock = jest.fn();
        render(
            <CalendarPicker
                value={new Date(2003, 1, 17)}
                minDate={new Date(2000, 0, 1)}
                maxDate={new Date(2005, 11, 31)}
                isDateSelectable={(date) => date <= new Date(2003, 1, 10)}
                onSelected={onSelectedMock}
            />,
        );

        // When the user presses February 11 and then February 10
        fireEvent.press(screen.getByLabelText('Tuesday, February 11, 2003'));
        fireEvent.press(screen.getByLabelText('Monday, February 10, 2003'));

        // Then only February 10 is selected
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
        expect(onSelectedMock).toHaveBeenCalledWith(new Date(2003, 1, 10));

        // Then the next-month arrow stays enabled, even though the rule rejects every day in March 2003
        expect(screen.getByTestId('next-month-arrow')).toBeEnabled();

        // When the user presses the next year arrow
        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Then the calendar still moves to 2004, because the rule limits selection, not which years can be shown
        expect(within(screen.getByTestId('currentYearText')).getByText('2004')).toBeTruthy();
    });

    test('asks the rule only about the days of the month', () => {
        // Given a rule that formats each day it is asked about, like the one on the Schedule a call page, and format throws on an invalid date
        const availableDays = new Set(['2003-02-10']);
        const isDateSelectable = (date: Date) => availableDays.has(format(date, CONST.DATE.FNS_FORMAT_STRING));

        // When the calendar shows February 2003, whose grid has empty cells before the 1st
        render(
            <CalendarPicker
                value={new Date(2003, 1, 10)}
                isDateSelectable={isDateSelectable}
            />,
        );

        // Then it renders without asking the rule about the empty cells, and only the day the rule accepts is enabled
        expect(screen.getByLabelText('Monday, February 10, 2003')).toBeEnabled();
        expect(screen.getByLabelText('Tuesday, February 11, 2003')).toBeDisabled();
    });
});
