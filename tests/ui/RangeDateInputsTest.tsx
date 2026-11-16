import {act, fireEvent, render, screen} from '@testing-library/react-native';

import RangeDateInputs from '@components/Search/FilterComponents/RangeDateInputs';

import type {PropsWithChildren} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn(), cancelAutoFocus: jest.fn()})));
jest.mock('@components/PopoverWithMeasuredContent', () => jest.fn(({isVisible, children}: PropsWithChildren<{isVisible: boolean}>) => (isVisible ? children : null)));
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => jest.fn(() => null));
jest.mock('@components/DatePicker/CalendarPicker/YearPickerModal', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

function RangeHarness({initialFrom = '', initialTo = ''}: {initialFrom?: string; initialTo?: string}) {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);

    return (
        <RangeDateInputs
            fromValue={from}
            toValue={to}
            onFromSelected={setFrom}
            onToSelected={setTo}
        />
    );
}

describe('RangeDateInputs', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        // The picker waits for its anchor measurement, which the test renderer cannot provide.
        jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((callback) => callback(300, 150, 290, 56));
    });
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('shows only the two fields until their standard calendar is opened', () => {
        // Given a compact range with no selected dates
        render(<RangeHarness />);

        // When the range editor is shown
        // Then no full calendar takes up space until a field is pressed
        expect(screen.getByLabelText('common.from')).toHaveDisplayValue('');
        expect(screen.getByLabelText('common.to')).toHaveDisplayValue('');
        expect(screen.queryByTestId('currentMonthText')).toBeNull();

        // When From is pressed
        fireEvent.press(screen.getByLabelText('common.from'));

        // Then only its calendar opens
        expect(screen.getAllByTestId('currentMonthText')).toHaveLength(1);
    });

    it('selects and clears a date without changing the other bound', () => {
        // Given a range from March 5 to March 10
        render(
            <RangeHarness
                initialFrom="2026-03-05"
                initialTo="2026-03-10"
            />,
        );

        // When the From field is changed through its calendar
        fireEvent.press(screen.getByLabelText('common.from'));
        fireEvent.press(screen.getByLabelText('Friday, March 6, 2026'));
        act(() => jest.advanceTimersByTime(100));

        // Then the field updates and the calendar closes, leaving To untouched
        expect(screen.getByLabelText('common.from')).toHaveDisplayValue('2026-03-06');
        expect(screen.getByLabelText('common.to')).toHaveDisplayValue('2026-03-10');
        expect(screen.queryByTestId('currentMonthText')).toBeNull();

        // When From is cleared
        const [clearFrom] = screen.getAllByLabelText('common.clear');
        if (!clearFrom) {
            throw new Error('Missing From clear button');
        }
        fireEvent.press(clearFrom);

        // Then only that bound is removed
        expect(screen.getByLabelText('common.from')).toHaveDisplayValue('');
        expect(screen.getByLabelText('common.to')).toHaveDisplayValue('2026-03-10');
    });

    it('prevents From from being later than To while allowing a same-day range', () => {
        // Given a range ending on March 10
        render(
            <RangeHarness
                initialFrom="2026-03-05"
                initialTo="2026-03-10"
            />,
        );

        // When From is opened
        fireEvent.press(screen.getByLabelText('common.from'));

        // Then dates after To are disabled, and To itself remains selectable
        expect(screen.getByLabelText('Wednesday, March 11, 2026')).toBeDisabled();
        expect(screen.getByLabelText('Tuesday, March 10, 2026')).toBeEnabled();
    });

    it('prevents To from being earlier than From', () => {
        // Given a range starting on March 5
        render(
            <RangeHarness
                initialFrom="2026-03-05"
                initialTo="2026-03-10"
            />,
        );

        // When To is opened
        fireEvent.press(screen.getByLabelText('common.to'));

        // Then dates before From are disabled, and From itself remains selectable
        expect(screen.getByLabelText('Wednesday, March 4, 2026')).toBeDisabled();
        expect(screen.getByLabelText('Thursday, March 5, 2026')).toBeEnabled();
    });

    it('opens an empty From field on the month of To without selecting it', () => {
        // Given a range with only To set
        render(<RangeHarness initialTo="2026-03-10" />);

        // When the empty From field is opened
        fireEvent.press(screen.getByLabelText('common.from'));

        // Then its calendar starts at the other bound, without treating that date as selected
        expect(screen.getByLabelText('Tuesday, March 10, 2026')).not.toBeSelected();
        expect(screen.getByLabelText('common.from')).toHaveDisplayValue('');
    });
});
