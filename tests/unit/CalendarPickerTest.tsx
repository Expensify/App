import type * as ReactNavigationNative from '@react-navigation/native';
import {fireEvent, render, screen, userEvent, within} from '@testing-library/react-native';
import {addMonths, addYears, subMonths, subYears} from 'date-fns';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import DateUtils from '@libs/DateUtils';

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

    test('should block the back arrow when there is no available dates in the previous month', async () => {
        const minDate = new Date('2003-02-01');
        const value = new Date('2003-02-17');

        // given the min date is 1
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        // When the previous month arrow is pressed
        const user = userEvent.setup();
        await user.press(screen.getByTestId('prev-month-arrow'));

        // Then the previous month should not be called as the previous month button is disabled
        const prevMonth = subMonths(value, 1).getMonth();
        expect(screen.queryByText(monthNames.at(prevMonth) ?? '')).not.toBeOnTheScreen();
    });

    test('should block the next arrow when there is no available dates in the next month', async () => {
        const maxDate = new Date('2003-02-24');
        const value = new Date('2003-02-17');
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        // When the next month arrow is pressed
        const user = userEvent.setup();
        await user.press(screen.getByTestId('next-month-arrow'));

        // Then the next month should not be called as the next month button is disabled
        const nextMonth = addMonths(value, 1).getMonth();
        expect(screen.queryByText(monthNames.at(nextMonth) ?? '')).not.toBeOnTheScreen();
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

    test('should block the previous year arrow when there are no available dates in the previous year', async () => {
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

        // Year should still be 2023 since the button is disabled
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
    });

    test('should block the next year arrow when there are no available dates in the next year', async () => {
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

        // Year should still be 2023 since the button is disabled
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
    });

    test('prev year arrow should clamp to minDate when navigating would go below it', () => {
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

        // Should clamp to minDate (November 2023), not land on March 2023
        expect(within(screen.getByTestId('currentYearText')).getByText('2023')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(10) ?? '')).toBeTruthy();
    });

    test('next year arrow should clamp to maxDate when navigating would go above it', () => {
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

        // Should clamp to maxDate (April 2025), not land on September 2025
        expect(within(screen.getByTestId('currentYearText')).getByText('2025')).toBeTruthy();
        expect(within(screen.getByTestId('currentMonthText')).getByText(monthNames.at(3) ?? '')).toBeTruthy();
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

    test('month picker filtering should exclude months before minDate', () => {
        const filteredMonths = DateUtils.getFilteredMonthItems(monthNames, 2023, 6, new Date('2023-06-01'), new Date('2030-12-31'));

        // Months before June (index 5) should be excluded
        expect(filteredMonths.find((m) => m.value === 0)).toBeUndefined();
        expect(filteredMonths.find((m) => m.value === 4)).toBeUndefined();

        // June and later months should be included
        expect(filteredMonths.find((m) => m.value === 5)).toBeTruthy();
        expect(filteredMonths.find((m) => m.value === 11)).toBeTruthy();
        expect(filteredMonths).toHaveLength(7);
    });

    test('month picker filtering should exclude months after maxDate', () => {
        const filteredMonths = DateUtils.getFilteredMonthItems(monthNames, 2023, 0, new Date('2020-01-01'), new Date('2023-09-30'));

        // Months after September (index 8) should be excluded
        expect(filteredMonths.find((m) => m.value === 10)).toBeUndefined();
        expect(filteredMonths.find((m) => m.value === 11)).toBeUndefined();

        // September and earlier months should be included
        expect(filteredMonths.find((m) => m.value === 8)).toBeTruthy();
        expect(filteredMonths.find((m) => m.value === 0)).toBeTruthy();
        expect(filteredMonths).toHaveLength(9);
    });
});
