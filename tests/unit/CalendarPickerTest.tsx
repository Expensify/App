import type ReactNavigationNative from '@react-navigation/native';
import {fireEvent, render, screen, within} from '@testing-library/react-native';
import {addMonths, addYears, subMonths, subYears} from 'date-fns';
import type {ComponentType} from 'react';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import type {WithLocalizeProps} from '@components/withLocalize';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

const monthNames = DateUtils.getMonthNames(CONST.LOCALES.EN);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

jest.mock('../../src/components/withLocalize', () => (Component: ComponentType<WithLocalizeProps>) => {
    function WrappedComponent(props: Omit<WithLocalizeProps, 'translate' | 'preferredLocale'>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                translate={() => ''}
                preferredLocale="en"
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);

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

    test('should block the back arrow when there is no available dates in the previous month', () => {
        const minDate = new Date('2003-02-01');
        const value = new Date('2003-02-17');
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        expect(screen.getByTestId('prev-month-arrow')).toBeDisabled();
    });

    test('should block the next arrow when there is no available dates in the next month', () => {
        const maxDate = new Date('2003-02-24');
        const value = '2003-02-17';
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        expect(screen.getByTestId('next-month-arrow')).toBeDisabled();
    });

    test('should allow navigating to the month of the max date when it has less days than the selected date', () => {
        const maxDate = new Date('2003-11-27'); // This month has 30 days
        const value = '2003-10-31';
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        expect(screen.getByTestId('next-month-arrow')).not.toBeDisabled();
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
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        expect(screen.getByLabelText('15')).toBeDisabled();
    });

    test('should not allow to press later day than max', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        expect(screen.getByLabelText('25')).toBeDisabled();
    });

    test('should allow to press min date', () => {
        const value = '2003-02-17';
        const minDate = new Date('2003-02-16');
        render(
            <CalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        expect(screen.getByLabelText('16')).not.toBeDisabled();
    });

    test('should allow to press max date', () => {
        const value = '2003-02-17';
        const maxDate = new Date('2003-02-24');
        render(
            <CalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        expect(screen.getByLabelText('24')).not.toBeDisabled();
    });
});
