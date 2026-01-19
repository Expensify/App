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
});
