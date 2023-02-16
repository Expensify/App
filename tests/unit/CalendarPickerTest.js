import {render, fireEvent} from '@testing-library/react-native';
import moment from 'moment';
import CalendarPicker from '../../src/components/CalendarPicker';

const monthNames = moment.localeData().months();

test('renders calendar component', () => {
    const onChangeMock = jest.fn();
    render(<CalendarPicker onChange={onChangeMock} />);
});

test('displays the current month and year', () => {
    const onChangeMock = jest.fn();
    const currentDate = new Date();

    const {getByText} = render(<CalendarPicker onChange={onChangeMock} />);

    expect(getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
    expect(getByText(currentDate.getFullYear().toString())).toBeTruthy();
});

test('clicking next month arrow updates the displayed month', () => {
    const onChangeMock = jest.fn();

    const {getByTestId, getByText} = render(<CalendarPicker onChangeMock={onChangeMock} />);

    fireEvent.press(getByTestId('next-month-arrow'));

    const nextMonth = (new Date()).getMonth() + 1;

    expect(getByText(monthNames[nextMonth])).toBeTruthy();
});

test('clicking previous month arrow updates the displayed month', () => {
    const onChangeMock = jest.fn();

    const {getByTestId, getByText} = render(<CalendarPicker onChangeMock={onChangeMock} />);

    fireEvent.press(getByTestId('prev-month-arrow'));
    const prevMonth = (new Date()).getMonth() - 1;

    expect(getByText(monthNames[prevMonth])).toBeTruthy();
});

test('clicking a day updates the selected date', () => {
    const onChangeMock = jest.fn();

    const {getByText} = render(<CalendarPicker value={new Date('2022-01-01')} onChange={onChangeMock} />);

    fireEvent.press(getByText('15'));

    expect(onChangeMock).toHaveBeenCalledWith(new Date('2022-01-15'));
});

test('clicking previous month arrow and selecting day updates the selected date', () => {
    const onChangeMock = jest.fn();

    const {getByText, getByTestId} = render(<CalendarPicker value={new Date('2022-01-01')} onChange={onChangeMock} />);

    fireEvent.press(getByTestId('next-month-arrow'));
    fireEvent.press(getByText('15'));

    expect(onChangeMock).toHaveBeenCalledWith(new Date('2022-02-15'));
});
