import {act, renderHook} from '@testing-library/react-native';

import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useDateSegmentInput from '@hooks/useDateSegmentInput';

import {DATE_SEGMENT_NAMES, getSegmentsFromISODate} from '@libs/DateInputMaskUtils';
import type {DateSegmentName} from '@libs/DateInputMaskUtils';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

type StubSegment = {
    focus: jest.Mock;
    setSelectionRange: jest.Mock;
    value: string;
};

/**
 * Stands in for the three inputs the field renders, since focus is handed to them through their refs and a hook on its
 * own has none to hand it to.
 */
function renderDateSegmentInput(value = '') {
    const shownSegments = getSegmentsFromISODate(value);
    const makeStub = (segmentValue: string): StubSegment => ({focus: jest.fn(), setSelectionRange: jest.fn(), value: segmentValue});
    const stubs: Record<DateSegmentName, StubSegment> = {
        year: makeStub(shownSegments.year),
        month: makeStub(shownSegments.month),
        day: makeStub(shownSegments.day),
    };

    const {result} = renderHook(() =>
        useDateSegmentInput({
            value,
            isEnabled: true,
            minDate: new Date('1900-01-01'),
            maxDate: new Date('2100-12-31'),
            onCommit: jest.fn(),
            onLeaveByKeyboard: jest.fn(),
        }),
    );

    act(() => {
        for (const name of DATE_SEGMENT_NAMES) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only input stub; focus is handed over through the two methods it carries
            result.current.setSegmentRef(name, stubs[name] as unknown as AnimatedTextInputRef);
        }
    });

    return {result, stubs};
}

/** Every keystroke is handled by the hook rather than by the input, so a test only has to hand it the key and its modifiers */
function pressKey(result: ReturnType<typeof renderDateSegmentInput>['result'], name: DateSegmentName, key: string, modifiers: Record<string, boolean> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only event stub carrying the two fields the handler reads
    const event = {preventDefault: jest.fn(), nativeEvent: {key, ...modifiers}} as unknown as TextInputKeyPressEvent;

    act(() => result.current.getSegmentProps(name).onKeyPress(event));
}

describe('useDateSegmentInput', () => {
    describe('arrow keys held with a modifier', () => {
        it('carries the caret to the start of the date rather than one segment back', () => {
            // Given a field holding a whole date, which the user is at the end of
            const {result, stubs} = renderDateSegmentInput('1990-05-15');

            // When the caret is sent left the way a text field is asked for the start of the line
            pressKey(result, 'day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, {altKey: true});

            // Then it reaches the year, rather than stopping at the month as an unmodified arrow would
            expect(stubs.year.focus).toHaveBeenCalled();
            expect(stubs.month.focus).not.toHaveBeenCalled();
        });

        it('carries the caret to the end of the date', () => {
            // Given the same date, which the user is at the start of
            const {result, stubs} = renderDateSegmentInput('1990-05-15');

            // When the caret is sent the other way, which a modifier the browser answers alone would otherwise swallow
            pressKey(result, 'year', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, {metaKey: true});

            // Then it reaches the day
            expect(stubs.day.focus).toHaveBeenCalled();
            expect(stubs.month.focus).not.toHaveBeenCalled();
        });
    });

    describe('restoreFocus', () => {
        it('gives focus back to the segment the user was last in', () => {
            // Given a field holding a whole date, which the user has entered at the month
            const {result, stubs} = renderDateSegmentInput('1990-05-15');
            act(() => result.current.getSegmentProps('month').onFocus());

            // When a modal has taken focus away and hands it back, as the month and year pickers do
            act(() => result.current.restoreFocus());

            // Then the caret returns to the month rather than being moved somewhere the user did not ask about
            expect(stubs.month.focus).toHaveBeenCalled();
            expect(stubs.day.focus).not.toHaveBeenCalled();
        });

        it('starts at the beginning of the date when the user has not been in it yet', () => {
            // Given a field holding a whole date that nothing has been focused in, so there is no caret to return
            const {result, stubs} = renderDateSegmentInput('1990-05-15');

            // When focus is handed back anyway
            act(() => result.current.restoreFocus());

            // Then it lands where an untouched field starts, since a whole date stops short nowhere
            expect(stubs.year.focus).toHaveBeenCalled();
            expect(stubs.day.focus).not.toHaveBeenCalled();
        });

        it('stops at the digits the date is still missing when the user has not been in it yet', () => {
            // Given an empty field, which the user has to fill in from the first segment on
            const {result, stubs} = renderDateSegmentInput('');

            // When focus is handed back
            act(() => result.current.restoreFocus());

            // Then it lands on the segment typing would start at
            expect(stubs.year.focus).toHaveBeenCalled();
        });
    });
});
