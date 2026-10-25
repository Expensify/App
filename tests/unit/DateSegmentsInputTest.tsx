import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import DateSegmentsInput from '@components/DateSegmentsInput';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {DateSegmentName} from '@libs/DateInputMaskUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type DateSegmentsConfig = NonNullable<BaseTextInputProps['dateSegmentsConfig']>;

const SEGMENT_LABELS: Record<DateSegmentName, string> = {
    year: 'Year',
    month: 'Month',
    day: 'Day',
};

async function renderField(overrides: Partial<DateSegmentsConfig> = {}) {
    const config: DateSegmentsConfig = {
        mask: 'YYYY-MM-DD',
        getSegmentProps: () => ({
            value: '',
            onKeyPress: jest.fn(),
            onChangeText: jest.fn(),
            onFocus: jest.fn(),
            onPointerDown: jest.fn(),
        }),
        setSegmentRef: jest.fn(),
        focusFirstUnfilledSegment: jest.fn(),
        selectLastSegment: jest.fn(),
        selectAllSegments: jest.fn(),
        isSegmentElement: jest.fn(() => false),
        isAllSelected: false,
        onFieldBlur: jest.fn(),
        hasTypedDigits: false,
        ...overrides,
    };

    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DateSegmentsInput
                dateSegmentsConfig={config}
                accessibilityLabel="Date field"
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();

    return config;
}

describe('DateSegmentsInput', () => {
    // The accessibility labels the segments are found by come from the locale, which loads into Onyx
    beforeAll(async () => {
        await act(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    it('keeps the field from reporting a blur while focus moves between its own segments', async () => {
        // Given a field whose segments are each their own input, so moving along the date blurs one of them
        const config = await renderField({isSegmentElement: jest.fn(() => true)});

        // When focus leaves the year for another segment
        fireEvent(screen.getByLabelText(SEGMENT_LABELS.year), 'blur', {
            nativeEvent: {relatedTarget: {}},
        });

        // Then the field has not been left, so nothing hanging on its blur runs
        expect(config.onFieldBlur).not.toHaveBeenCalled();
    });

    it('reports a blur once focus lands outside every segment', async () => {
        // Given a field that recognizes its own segments and is handed something else
        const config = await renderField({
            isSegmentElement: jest.fn(() => false),
        });

        // When focus leaves the day for an element the field does not own
        fireEvent(screen.getByLabelText(SEGMENT_LABELS.day), 'blur', {
            nativeEvent: {relatedTarget: {}},
        });

        // Then the field reports the blur, which is what a form hangs its validation on
        expect(config.onFieldBlur).toHaveBeenCalledTimes(1);
    });

    it('reports a blur when focus leaves for nothing at all', async () => {
        // Given a field being left by a click on the page background, which names no related target
        const config = await renderField();

        // When the year blurs with no element taking over
        fireEvent(screen.getByLabelText(SEGMENT_LABELS.year), 'blur', {
            nativeEvent: {relatedTarget: null},
        });

        // Then the blur is reported, since focus is no longer anywhere in the date
        expect(config.onFieldBlur).toHaveBeenCalledTimes(1);
    });

    it('answers a double click on the space beside the date with the nearest segment', async () => {
        // Given the empty space that fills the rest of the row, which holds no text of its own
        const config = await renderField();

        // When it takes the second click of a double click
        fireEvent(screen.getByLabelText('Date'), 'mouseDown', {
            preventDefault: jest.fn(),
            detail: 2,
        });

        // Then the last segment stands in for the word a text field would have selected
        expect(config.selectLastSegment).toHaveBeenCalledTimes(1);
        expect(config.selectAllSegments).not.toHaveBeenCalled();
    });

    it('answers a triple click on that space with the whole date', async () => {
        // Given the same space, clicked a third time
        const config = await renderField();

        // When the click count passes two
        fireEvent(screen.getByLabelText('Date'), 'mouseDown', {
            preventDefault: jest.fn(),
            detail: 3,
        });

        // Then the whole date is selected, the way a triple click takes a whole line
        expect(config.selectAllSegments).toHaveBeenCalledTimes(1);
        expect(config.selectLastSegment).not.toHaveBeenCalled();
    });

    it('leaves a single click on that space to move focus rather than select', async () => {
        // Given a first click, which carries no selection meaning
        const config = await renderField();

        // When the space is pressed once
        fireEvent(screen.getByLabelText('Date'), 'mouseDown', {
            preventDefault: jest.fn(),
            detail: 1,
        });

        // Then neither selection runs, leaving the press itself to pick a segment to type in
        expect(config.selectLastSegment).not.toHaveBeenCalled();
        expect(config.selectAllSegments).not.toHaveBeenCalled();
    });
});
