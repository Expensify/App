import {fireEvent, render, screen} from '@testing-library/react-native';

import DatePicker from '@components/DatePicker';

import DateUtils from '@libs/DateUtils';

import type {PropsWithChildren} from 'react';

import React from 'react';

// useAutoFocusInput reads the navigator. Stub it so the picker renders without one.
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn(), cancelAutoFocus: jest.fn()})));
jest.mock('@components/PopoverWithMeasuredContent', () => jest.fn(({isVisible, children}: PropsWithChildren<{isVisible: boolean}>) => (isVisible ? children : null)));
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => jest.fn(() => null));
jest.mock('@components/DatePicker/CalendarPicker/YearPickerModal', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const LABEL = 'Date';

function openCalendar() {
    fireEvent.press(screen.getByLabelText(LABEL));
}

describe('DatePicker', () => {
    it('selects no day when an empty field opens the calendar', () => {
        // Given an empty date field
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value=""
            />,
        );

        // When the user opens the calendar
        openCalendar();

        // Then today is shown but not selected, because the field has no date yet
        expect(screen.getByLabelText(`${DateUtils.formatToLongDateWithWeekday(new Date(), undefined)}, common.today`)).not.toBeSelected();
    });

    it('opens an empty field on the month of its defaultValue without selecting it', () => {
        // Given an empty field with a defaultValue of March 10, 2020, as a caller that renders DatePicker directly can pass
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value=""
                defaultValue="2020-03-10"
            />,
        );

        // When the user opens the calendar
        openCalendar();

        // Then it shows March 2020 with March 10 not selected, because the default only says where to start
        expect(screen.getByLabelText('Tuesday, March 10, 2020')).not.toBeSelected();
    });

    it('selects the date of the field', () => {
        // Given a field with March 10, 2020
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value="2020-03-10"
            />,
        );

        // When the user opens the calendar
        openCalendar();

        // Then March 10 is selected, so the user sees the date the field holds
        expect(screen.getByLabelText('Tuesday, March 10, 2020')).toBeSelected();
    });
});
