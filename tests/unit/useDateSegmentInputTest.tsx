import {act, renderHook} from '@testing-library/react-native';

import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useDateSegmentInput from '@hooks/useDateSegmentInput';

import {DATE_SEGMENT_NAMES, getSegmentsFromISODate} from '@libs/DateInputMaskUtils';
import type {DateSegmentName} from '@libs/DateInputMaskUtils';

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

describe('useDateSegmentInput', () => {
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
