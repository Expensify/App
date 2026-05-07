import type * as ReactNavigationNative from '@react-navigation/native';
import {fireEvent, render, screen, userEvent, within} from '@testing-library/react-native';
import {addMonths, addYears, subMonths, subYears} from 'date-fns';
import type {ComponentType, ReactNode} from 'react';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type MockPressableProps = {testID?: string; accessibilityLabel?: string; role?: string; onPress?: () => void; children?: ReactNode};
type MockTextProps = {children?: ReactNode};
type MockViewProps = {testID?: string; children?: ReactNode};
type MockReactNativePrimitives = {
    Pressable: ComponentType<MockPressableProps>;
    Text: ComponentType<MockTextProps>;
    View: ComponentType<MockViewProps>;
};

const monthNames = DateUtils.getMonthNames();

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

type MockMonthPickerModalProps = {isVisible: boolean; onMonthChange?: (month: number) => void; onClose?: () => void};
type MockYearPickerModalProps = {
    isVisible: boolean;
    years: Array<{value: number; text: string}>;
    onYearChange?: (year: number) => void;
    onClose?: () => void;
};

jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => {
    const ReactNativeActual = jest.requireActual<MockReactNativePrimitives>('react-native');
    const {Pressable, Text, View} = ReactNativeActual;
    const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    function MockMonthPickerModal({isVisible, onMonthChange, onClose}: MockMonthPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        return (
            <View testID="MonthPickerModal">
                {MONTH_KEYS.map((key, i) => (
                    <Pressable
                        key={key}
                        testID={`month-option-${i}`}
                        accessibilityLabel={`month-${i}`}
                        role="button"
                        onPress={() => onMonthChange?.(i)}
                    >
                        <Text>{`month-${i}`}</Text>
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
    function MockYearPickerModal({isVisible, years, onYearChange, onClose}: MockYearPickerModalProps) {
        if (!isVisible) {
            return null;
        }
        return (
            <View testID="YearPickerModal">
                {years.map((year) => (
                    <Pressable
                        key={year.value}
                        testID={`year-option-${year.value}`}
                        accessibilityLabel={year.text}
                        role="button"
                        onPress={() => onYearChange?.(year.value)}
                    >
                        <Text>{year.text}</Text>
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
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

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
        const onSelectedMock = jest.fn();
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        const value = '2023-01-01';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(screen.getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith('2023-01-15');
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
    });

    test('clicking previous month arrow and selecting day updates the selected date', () => {
        const onSelectedMock = jest.fn();
        const value = '2022-01-01';
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));
        fireEvent.press(screen.getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith('2022-02-15');
    });

    test('should allow navigating to the previous month even when it is before minDate', async () => {
        const minDate = new Date('2003-02-01');
        const value = new Date('2003-02-17');

        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('prev-month-arrow'));

        // Navigation should work — the previous month is displayed
        const prevMonth = subMonths(value, 1).getMonth();
        expect(screen.getByText(monthNames.at(prevMonth) ?? '')).toBeOnTheScreen();
    });

    test('should allow navigating to the next month even when it is after maxDate', async () => {
        const maxDate = new Date('2003-02-24');
        const value = new Date('2003-02-17');
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('next-month-arrow'));

        // Navigation should work — the next month is displayed
        const nextMonth = addMonths(value, 1).getMonth();
        expect(screen.getByText(monthNames.at(nextMonth) ?? '')).toBeOnTheScreen();
    });

    test('should allow navigating to the month of the max date when it has less days than the selected date', () => {
        const maxDate = new Date('2003-11-27'); // This month has 30 days
        const value = '2003-10-31';

        // given the max date is 27
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // then the next arrow should be enabled
        expect(screen.getByTestId('next-month-arrow')).toBeEnabled();
    });

    test('should open the calendar on a month from max date if it is earlier than current month', () => {
        const onSelectedMock = jest.fn();
        const maxDate = new Date('2011-03-01');
        render(
            <CalendarPicker
                onSelected={onSelectedMock}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByText('1'));

        expect(onSelectedMock).toHaveBeenCalledWith('2011-03-01');
    });

    test('should open the calendar on a year from max date if it is earlier than current year', () => {
        const maxDate = new Date('2011-03-01');
        render(<CalendarPicker maxDate={maxDate} />);

        expect(within(screen.getByTestId('currentYearText')).getByText('2011')).toBeTruthy();
    });

    test('should open the calendar on a month from min date if it is later than current month', () => {
        const minDate = new Date('2035-02-16');
        const maxDate = new Date('2040-02-16');
        render(
            <CalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        expect(within(screen.getByTestId('currentYearText')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });

    test('should not allow to press earlier day than minDate', () => {
        const value = '2003-02-17';
        const minDate = new Date('2003-02-16');
        const onSelectedMock = jest.fn();

        // given the min date is 16
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        //  When the day 15 is pressed
        fireEvent.press(screen.getByLabelText('Saturday, February 15, 2003'));

        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 16 is pressed
        fireEvent.press(screen.getByLabelText('Sunday, February 16, 2003'));

        // Then the onSelected should be called as the label 16 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-16');
    });

    test('should not allow to press later day than max', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');
        const onSelectedMock = jest.fn();

        // given the max date is 24
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
                onSelected={onSelectedMock}
            />,
        );

        //  When the day 25 is pressed
        fireEvent.press(screen.getByLabelText('Tuesday, February 25, 2003'));

        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();

        // When the day 24 is pressed
        fireEvent.press(screen.getByLabelText('Monday, February 24, 2003'));

        // Then the onSelected should be called as the label 24 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-24');
    });

    test('should allow to press min date', () => {
        const value = '2003-02-17';
        const minDate = new Date('2003-02-16');

        // given the min date is 16
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        // then the label 16 should be clickable
        expect(screen.getByLabelText('Sunday, February 16, 2003')).toBeEnabled();
    });

    test('should allow to press max date', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');

        // given the max date is 24
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // then the label 24 should be clickable
        expect(screen.getByLabelText('Monday, February 24, 2003')).toBeEnabled();
    });

    test('clicking next year arrow updates the displayed year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
    });

    test('clicking previous year arrow updates the displayed year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
    });

    test('should allow navigating to the previous year even when it is before minDate', async () => {
        const minDate = new Date('2023-01-01');
        const value = new Date('2023-06-15');
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('prev-year-arrow'));

        // Navigation should work — year changes to 2022
        expect(within(screen.getByTestId('currentYearText')).getByText('2022')).toBeTruthy();
    });

    test('should allow navigating to the next year even when it is after maxDate', async () => {
        const maxDate = new Date('2023-12-31');
        const value = new Date('2023-06-15');
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        const user = userEvent.setup();
        await user.press(screen.getByTestId('next-year-arrow'));

        // Navigation should work — year changes to 2024
        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
    });

    test('prev year arrow should navigate freely without clamping to minDate', () => {
        const minDate = new Date('2023-11-01');
        const maxDate = new Date('2030-12-31');
        const value = '2024-03-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Should navigate to March 2023 without clamping
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(2) ?? '')).toBeTruthy();
    });

    test('next year arrow should navigate freely without clamping to maxDate', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2025-04-20');
        const value = '2024-09-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Should navigate to September 2025 without clamping
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(8) ?? '')).toBeTruthy();
    });

    test('clicking next month arrow in December should update year to next year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-12-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2026')).toBeTruthy();
        expect(screen.getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking previous month arrow in January should update year to previous year', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-01-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2024')).toBeTruthy();
        expect(screen.getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('next year arrow should not navigate above CONST.CALENDAR_PICKER.MAX_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 5, 15);
        const maxDate = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 31);
        render(
            <CalendarPicker
                value={value}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-year-arrow'));

        // Year should be clamped at MAX_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MAX_YEAR.toString())).toBeTruthy();
    });

    test('prev year arrow should not navigate below CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 5, 15);
        const minDate = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 1);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-year-arrow'));

        // Year should be clamped at MIN_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MIN_YEAR.toString())).toBeTruthy();
    });

    test('next month arrow should not navigate above December of CONST.CALENDAR_PICKER.MAX_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 15);
        const maxDate = new Date(CONST.CALENDAR_PICKER.MAX_YEAR, 11, 31);
        render(
            <CalendarPicker
                value={value}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('next-month-arrow'));

        // Should remain on December of MAX_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MAX_YEAR.toString())).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(11) ?? '')).toBeTruthy();
    });

    test('prev month arrow should not navigate below January of CONST.CALENDAR_PICKER.MIN_YEAR', () => {
        const value = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 15);
        const minDate = new Date(CONST.CALENDAR_PICKER.MIN_YEAR, 0, 1);
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
            />,
        );

        fireEvent.press(screen.getByTestId('prev-month-arrow'));

        // Should remain on January of MIN_YEAR
        expect(within(screen.getByTestId('currentYearText')).getByText(CONST.CALENDAR_PICKER.MIN_YEAR.toString())).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(0) ?? '')).toBeTruthy();
    });

    test('clicking the month button opens the month picker and selecting a month updates the calendar', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('currentMonthButton'));

        const monthPickerModal = screen.getByTestId('MonthPickerModal');
        expect(monthPickerModal).toBeTruthy();

        fireEvent.press(within(monthPickerModal).getByTestId('month-option-8'));

        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(8) ?? '')).toBeTruthy();
    });

    test('clicking the year button opens the year picker and selecting a year updates the calendar', () => {
        const minDate = new Date('2020-01-01');
        const maxDate = new Date('2030-12-31');
        const value = '2025-06-15';
        render(
            <CalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(screen.getByTestId('currentYearButton'));

        const yearPickerModal = screen.getByTestId('YearPickerModal');
        expect(yearPickerModal).toBeTruthy();

        fireEvent.press(within(yearPickerModal).getByTestId('year-option-2027'));

        expect(within(screen.getByTestId('currentYearText')).getByText('2027')).toBeTruthy();
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

    test('month picker should always return all 12 months', () => {
        const allMonths = DateUtils.getFilteredMonthItems(monthNames, 6);

        // All 12 months should be present
        expect(allMonths).toHaveLength(12);
        expect(allMonths.find((m) => m.value === 0)).toBeTruthy();
        expect(allMonths.find((m) => m.value === 11)).toBeTruthy();

        // The current month (June, index 6) should be selected
        expect(allMonths.find((m) => m.value === 6)?.isSelected).toBe(true);
        expect(allMonths.find((m) => m.value === 0)?.isSelected).toBe(false);
    });
});
