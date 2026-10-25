import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import DatePicker from '@components/DatePicker';
import type {DateInputWithPickerProps} from '@components/DatePicker/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Typing is only offered where the calendar can sit beside the field, so a touch screen turns the whole feature off
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => false,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    }),
    useIsFocused: () => true,
    useFocusEffect: () => {},
}));

// The window's own width is what decides whether there is room to show a calendar beside the field
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

const SEGMENT_LABELS = {
    year: 'Year',
    month: 'Month',
    day: 'Day',
};

function focusSegment(label: string) {
    fireEvent(screen.getByLabelText(label), 'focus', {nativeEvent: {}});
}

function pressKeys(label: string, keys: string[]) {
    for (const key of keys) {
        fireEvent(screen.getByLabelText(label), 'keyPress', {
            preventDefault: jest.fn(),
            nativeEvent: {key},
        });
    }
}

async function renderDatePicker(props: Partial<DateInputWithPickerProps> = {}) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DatePicker
                inputID="testDate"
                label="Date"
                {...props}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('DatePicker typing', () => {
    beforeEach(() => {
        jest.mocked(useResponsiveLayout).mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isInLandscapeMode: false,
        });
    });

    // The segments are found by the accessibility labels the locale gives them
    beforeAll(async () => {
        await act(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    it('hands over a date once the last segment of it has been typed', async () => {
        // Given a date field on a wide screen without a touch screen, which is where typing is offered
        const onInputChange = jest.fn();
        await renderDatePicker({onInputChange});

        // When a whole date is typed, the caret moving on by itself as each segment fills
        focusSegment(SEGMENT_LABELS.year);
        pressKeys(SEGMENT_LABELS.year, ['2', '0', '2', '4']);
        pressKeys(SEGMENT_LABELS.month, ['0', '3']);
        pressKeys(SEGMENT_LABELS.day, ['1', '7']);

        // Then the field reports the date the way the calendar would have
        expect(onInputChange).toHaveBeenLastCalledWith('2024-03-17');
    });

    it('withholds a date that is still part way through being typed', async () => {
        // Given the same field
        const onInputChange = jest.fn();
        await renderDatePicker({onInputChange});

        // When only the year and the month have been entered
        focusSegment(SEGMENT_LABELS.year);
        pressKeys(SEGMENT_LABELS.year, ['2', '0', '2', '4']);
        pressKeys(SEGMENT_LABELS.month, ['0', '3']);

        // Then nothing is handed over, since a half written date would replace the one already saved
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('shows the digits that have been typed so far', async () => {
        // Given a field being filled in
        await renderDatePicker();

        // When the year is typed
        focusSegment(SEGMENT_LABELS.year);
        pressKeys(SEGMENT_LABELS.year, ['1', '9', '9', '0']);

        // Then the year segment holds those digits and the caret has moved on to the month
        expect(screen.getByLabelText(SEGMENT_LABELS.year).props.value).toBe('1990');
        expect(screen.getByLabelText(SEGMENT_LABELS.month).props.value).toBe('');
    });

    it('opens the calendar as soon as the field is typed in, so the two show the same date', async () => {
        // Given a field whose calendar is closed
        const onPickerVisibilityChange = jest.fn();
        await renderDatePicker({onPickerVisibilityChange});

        // When the first digit is typed
        focusSegment(SEGMENT_LABELS.year);
        pressKeys(SEGMENT_LABELS.year, ['2']);

        // Then the calendar opens alongside, rather than waiting for the field to be pressed
        expect(onPickerVisibilityChange).toHaveBeenCalledWith(true);
    });

    it('reports a typed date the calendar would never have offered', async () => {
        // Given a field bounded to a range, which the calendar enforces by only drawing the days inside it
        const onValidationErrorChange = jest.fn();
        await renderDatePicker({
            onValidationErrorChange,
            minDate: new Date('2024-01-01'),
            maxDate: new Date('2024-12-31'),
        });

        // When a date outside those bounds is typed, which only typing can reach
        focusSegment(SEGMENT_LABELS.year);
        pressKeys(SEGMENT_LABELS.year, ['2', '0', '3', '0']);
        pressKeys(SEGMENT_LABELS.month, ['0', '5']);
        pressKeys(SEGMENT_LABELS.day, ['0', '9']);

        // Then the field reports an error naming the range, which is what the page's submit guard reads
        expect(onValidationErrorChange).toHaveBeenLastCalledWith(expect.stringContaining('2024'));
    });
});
