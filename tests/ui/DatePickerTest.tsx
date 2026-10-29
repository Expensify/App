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
        expect(screen.getByLabelText(DateUtils.formatToLongDateWithWeekday(new Date(), undefined))).not.toBeSelected();
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

    it('carries no outer margin of its own', () => {
        // Given a field rendered without any spacing from its form
        // When it renders
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value=""
            />,
        );

        // Then its outermost view has no margin, because the form that contains the field decides the space around it
        expect(screen.root).not.toHaveStyle({marginVertical: 8});
        expect(screen.root).not.toHaveStyle({marginTop: 8});
    });

    it('takes the space around it from containerStyles', () => {
        // Given a field whose form puts 16px above it
        // When it renders with that margin in containerStyles
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value=""
                containerStyles={{marginTop: 16}}
            />,
        );

        // Then the outermost view gets that margin, the same way a TextInput does
        expect(screen.root).toHaveStyle({marginTop: 16});
    });
});
