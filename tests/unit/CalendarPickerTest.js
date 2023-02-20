import {render, fireEvent, within} from '@testing-library/react-native';
import moment from 'moment';
import CalendarPicker from '../../src/components/CalendarPicker';

const monthNames = moment.localeData().months();

describe('CalendarPicker', () => {
    test('renders calendar component', () => {
        render(<CalendarPicker />);
    });

    test('displays the current month and year', () => {
        const currentDate = new Date();

        const {getByText} = render(<CalendarPicker />);

        expect(getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
        expect(getByText(currentDate.getFullYear().toString())).toBeTruthy();
    });

    test('clicking next month arrow updates the displayed month', () => {
        const {getByTestId, getByText} = render(<CalendarPicker />);

        fireEvent.press(getByTestId('next-month-arrow'));

        const nextMonth = (new Date()).getMonth() + 1;

        expect(getByText(monthNames[nextMonth])).toBeTruthy();
    });

    test('clicking previous month arrow updates the displayed month', () => {
        const {getByTestId, getByText} = render(<CalendarPicker />);

        fireEvent.press(getByTestId('prev-month-arrow'));
        const prevMonth = (new Date()).getMonth() - 1;

        expect(getByText(monthNames[prevMonth])).toBeTruthy();
    });

    test('clicking a day updates the selected date', () => {
        const onChangeMock = jest.fn();
        const {getByText} = render(<CalendarPicker value={new Date('2022-01-01')} onChange={onChangeMock} />);

        fireEvent.press(getByText('15'));

        expect(onChangeMock).toHaveBeenCalledWith(new Date('2022-01-15'));
        expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    test('clicking previous month arrow and selecting day updates the selected date', () => {
        const onChangeMock = jest.fn();
        const {getByText, getByTestId} = render(<CalendarPicker value={new Date('2022-01-01')} onChange={onChangeMock} />);

        fireEvent.press(getByTestId('next-month-arrow'));
        fireEvent.press(getByText('15'));

        expect(onChangeMock).toHaveBeenCalledWith(new Date('2022-02-15'));
    });

    test('should block the back arrow when there is no available dates in the previous month', () => {
        const {getByTestId} = render(<CalendarPicker minDate={new Date('2023-02-01')} value={new Date('2023-02-17')} />);

        expect(getByTestId('prev-month-arrow')).toBeDisabled();
    });

    test('should block the next arrow when there is no available dates in the next month', () => {
        const {getByTestId} = render(<CalendarPicker maxDate={new Date('2023-02-24')} value={new Date('2023-02-17')} />);

        expect(getByTestId('next-month-arrow')).toBeDisabled();
    });

    test('should open the calendar on a month from max date if it is earlier than current month', () => {
        const onChangeMock = jest.fn();
        const {getByText} = render(<CalendarPicker onChange={onChangeMock} maxDate={new Date('2011-03-01')} />);

        fireEvent.press(getByText('1'));

        expect(onChangeMock).toHaveBeenCalledWith(new Date('2011-03-01'));
    });

    test('should open the calendar on a year from max date if it is earlier than current year', () => {
        const {getByLabelText} = render(<CalendarPicker maxDate={new Date('2011-03-01')} />);

        expect(within(getByLabelText('Current year')).getByText('2011')).toBeTruthy();
    });

    test('should open the calendar on a month from min date if it is later than current month', () => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() + 10);

        const {getByLabelText} = render(<CalendarPicker minDate={minDate} />);

        expect(within(getByLabelText('Current year')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });

    test('should not allow to press earlier day than minDate', () => {
        const date = new Date('2023-02-17');
        const minDate = new Date('2023-02-16');
        const {getByLabelText} = render(<CalendarPicker minDate={minDate} value={date} />);

        expect(getByLabelText('15')).toBeDisabled();
    });

    test('should not allow to press later day than max', () => {
        const date = new Date('2023-02-17');
        const maxDate = new Date('2023-02-24');
        const {getByLabelText} = render(<CalendarPicker maxDate={maxDate} value={date} />);

        expect(getByLabelText('25')).toBeDisabled();
    });

    test('should allow to press min date', () => {
        const date = new Date('2023-02-17');
        const minDate = new Date('2023-02-16');
        const {getByLabelText} = render(<CalendarPicker minDate={minDate} value={date} />);

        expect(getByLabelText('16')).not.toBeDisabled();
    });

    test('should not allow to press max date', () => {
        const date = new Date('2023-02-17');
        const maxDate = new Date('2023-02-24');
        const {getByLabelText} = render(<CalendarPicker maxDate={maxDate} value={date} />);

        expect(getByLabelText('24')).not.toBeDisabled();
    });
});

