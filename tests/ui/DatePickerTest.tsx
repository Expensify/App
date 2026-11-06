// cspell:ignore Donnerstag Januar
import {fireEvent, render, screen} from '@testing-library/react-native';

import DatePicker from '@components/DatePicker';

import useLocalize from '@hooks/useLocalize';

import DateUtils from '@libs/DateUtils';

import type {PropsWithChildren} from 'react';

import {de} from 'date-fns/locale/de';
import {ja} from 'date-fns/locale/ja';
import React from 'react';

import createMock from '../utils/createMock';

// useAutoFocusInput reads the navigator. Stub it so the picker renders without one.
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn(), cancelAutoFocus: jest.fn()})));
jest.mock('@components/PopoverWithMeasuredContent', () => jest.fn(({isVisible, children}: PropsWithChildren<{isVisible: boolean}>) => (isVisible ? children : null)));
jest.mock('@components/DatePicker/CalendarPicker/MonthPickerModal', () => jest.fn(() => null));
jest.mock('@components/DatePicker/CalendarPicker/YearPickerModal', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string, ...params: string[]) => [key, ...params].join('|')})));

const LABEL = 'Date';

function openCalendar() {
    fireEvent.press(screen.getByLabelText(LABEL));
}

describe('DatePicker', () => {
    afterEach(() => {
        jest.mocked(useLocalize).mockClear();
    });

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
        expect(screen.getByLabelText(`common.todayDateLabel|${DateUtils.formatToLongDateWithWeekday(new Date(), undefined)}`)).not.toBeSelected();
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

    it.each([
        ['German', de, 'Donnerstag, 22. Januar 2026'],
        ['Japanese', ja, '2026年1月22日木曜日'],
    ])('announces the selected day in the order used by %s', (languageName, locale, expected) => {
        // Given a German or Japanese calendar whose selected day is January 22
        jest.mocked(useLocalize).mockReturnValue(
            createMock<ReturnType<typeof useLocalize>>({
                translate: jest.fn(),
                dateFnsLocale: locale,
            }),
        );
        render(
            <DatePicker
                inputID="date"
                label={LABEL}
                value="2026-01-22"
            />,
        );

        // When the user opens the date field's calendar
        openCalendar();

        // Then its accessible name follows the locale's weekday/date order rather than only translating words
        expect(screen.getByLabelText(expected)).toBeSelected();
    });
});
