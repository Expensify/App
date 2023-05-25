import {render, fireEvent, within} from '@testing-library/react-native';
import moment from 'moment';
import CalendarPicker from '../../src/components/CalendarPicker';
import CONST from '../../src/CONST';

moment.locale(CONST.LOCALES.EN);
const monthNames = moment.localeData().months();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({navigate: jest.fn()}),
    createNavigationContainerRef: jest.fn(),
}));

// eslint-disable-next-line arrow-body-style
const MockedCalendarPicker = (props) => {
    return (
        <CalendarPicker
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            translate={() => ''}
            preferredLocale={CONST.LOCALES.EN}
        />
    );
};

describe('CalendarPicker', () => {
    test('renders calendar component', () => {
        render(<MockedCalendarPicker />);
    });

    test('displays the current month and year', () => {
        const currentDate = new Date();
        const maxDate = moment(currentDate).add(1, 'Y').toDate();
        const minDate = moment(currentDate).subtract(1, 'Y').toDate();
        const {getByText} = render(
            <MockedCalendarPicker
                maxDate={maxDate}
                minDate={minDate}
            />,
        );

        expect(getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
        expect(getByText(currentDate.getFullYear().toString())).toBeTruthy();
    });

    test('clicking next month arrow updates the displayed month', () => {
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        const {getByTestId, getByText} = render(
            <MockedCalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(getByTestId('next-month-arrow'));

        const nextMonth = new Date().getMonth() + 1;
        expect(getByText(monthNames[nextMonth])).toBeTruthy();
    });

    test('clicking previous month arrow updates the displayed month', () => {
        const {getByTestId, getByText} = render(<MockedCalendarPicker />);

        fireEvent.press(getByTestId('prev-month-arrow'));

        const prevMonth = new Date().getMonth() - 1;
        expect(getByText(monthNames[prevMonth])).toBeTruthy();
    });

    test('clicking a day updates the selected date', () => {
        const onSelectedMock = jest.fn();
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        const value = new Date('2023-01-01');
        const {getByText} = render(
            <MockedCalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith(new Date('2023-01-15'));
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
    });

    test('clicking previous month arrow and selecting day updates the selected date', () => {
        const onSelectedMock = jest.fn();
        const value = new Date('2022-01-01');
        const minDate = new Date('2022-01-01');
        const maxDate = new Date('2030-01-01');
        const {getByText, getByTestId} = render(
            <MockedCalendarPicker
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onSelected={onSelectedMock}
            />,
        );

        fireEvent.press(getByTestId('next-month-arrow'));
        fireEvent.press(getByText('15'));

        expect(onSelectedMock).toHaveBeenCalledWith(new Date('2022-02-15'));
    });

    test('should block the back arrow when there is no available dates in the previous month', () => {
        const minDate = new Date('2003-02-01');
        const value = new Date('2003-02-17');
        const {getByTestId} = render(
            <MockedCalendarPicker
                minDate={minDate}
                value={value}
            />,
        );

        expect(getByTestId('prev-month-arrow')).toBeDisabled();
    });

    test('should block the next arrow when there is no available dates in the next month', () => {
        const maxDate = new Date('2003-02-24');
        const value = new Date('2003-02-17');
        const {getByTestId} = render(
            <MockedCalendarPicker
                maxDate={maxDate}
                value={value}
            />,
        );

        expect(getByTestId('next-month-arrow')).toBeDisabled();
    });

    test('should open the calendar on a month from max date if it is earlier than current month', () => {
        const onSelectedMock = jest.fn();
        const maxDate = new Date('2011-03-01');
        const {getByText} = render(
            <MockedCalendarPicker
                onSelected={onSelectedMock}
                maxDate={maxDate}
            />,
        );

        fireEvent.press(getByText('1'));

        expect(onSelectedMock).toHaveBeenCalledWith(new Date('2011-03-01'));
    });

    test('should open the calendar on a year from max date if it is earlier than current year', () => {
        const maxDate = new Date('2011-03-01');
        const {getByTestId} = render(<MockedCalendarPicker maxDate={maxDate} />);

        expect(within(getByTestId('currentYearText')).getByText('2011')).toBeTruthy();
    });

    test('should open the calendar on a month from min date if it is later than current month', () => {
        const minDate = new Date('2035-02-16');
        const maxDate = new Date('2040-02-16');
        const {getByTestId} = render(
            <MockedCalendarPicker
                minDate={minDate}
                maxDate={maxDate}
            />,
        );

        expect(within(getByTestId('currentYearText')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });

    test('should not allow to press earlier day than minDate', () => {
        const date = new Date('2003-02-17');
        const minDate = new Date('2003-02-16');
        const {getByLabelText} = render(
            <MockedCalendarPicker
                minDate={minDate}
                value={date}
            />,
        );

        expect(getByLabelText('15')).toBeDisabled();
    });

    test('should not allow to press later day than max', () => {
        const date = new Date('2003-02-17');
        const maxDate = new Date('2003-02-24');
        const {getByLabelText} = render(
            <MockedCalendarPicker
                maxDate={maxDate}
                value={date}
            />,
        );

        expect(getByLabelText('25')).toBeDisabled();
    });

    test('should allow to press min date', () => {
        const date = new Date('2003-02-17');
        const minDate = new Date('2003-02-16');
        const {getByLabelText} = render(
            <MockedCalendarPicker
                minDate={minDate}
                value={date}
            />,
        );

        expect(getByLabelText('16')).not.toBeDisabled();
    });

    test('should not allow to press max date', () => {
        const date = new Date('2003-02-17');
        const maxDate = new Date('2003-02-24');
        const {getByLabelText} = render(
            <MockedCalendarPicker
                maxDate={maxDate}
                value={date}
            />,
        );

        expect(getByLabelText('24')).not.toBeDisabled();
    });
});
