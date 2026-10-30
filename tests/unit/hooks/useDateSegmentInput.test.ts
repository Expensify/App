import {act, renderHook} from '@testing-library/react-native';

import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useDateSegmentInput from '@hooks/useDateSegmentInput';

import Clipboard from '@libs/Clipboard';
import {DATE_SEGMENT_NAMES} from '@libs/DateInputMaskUtils';
import type {DateSegmentName} from '@libs/DateInputMaskUtils';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

// Copying the whole date is the field's own job, since the browser cannot select across separate inputs
jest.mock('@libs/Clipboard', () => ({__esModule: true, default: {setString: jest.fn()}}));

const setClipboardString = jest.mocked(Clipboard.setString);

const MIN_DATE = new Date(2000, 0, 1);
const MAX_DATE = new Date(2030, 11, 31);

/**
 * Stands in for one segment's input. The hook moves focus and reads selections through these, so giving it real
 * objects is what makes both observable from a test that renders no component.
 */
type SegmentElement = {
    focus: jest.Mock;
    setSelectionRange: jest.Mock;
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
};

function createElement(): SegmentElement {
    return {focus: jest.fn(), setSelectionRange: jest.fn(), value: '', selectionStart: null, selectionEnd: null};
}

function createKeyEvent(key: string, modifiers: {metaKey?: boolean; shiftKey?: boolean} = {}) {
    const event = {
        preventDefault: jest.fn(),
        nativeEvent: {key, metaKey: modifiers.metaKey ?? false, ctrlKey: false, shiftKey: modifiers.shiftKey ?? false},
    };

    // The hook reads a handful of fields off the event and prevents it, which is all this has to carry
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return event as unknown as TextInputKeyPressEvent;
}

type SetupOptions = {value?: string; isEnabled?: boolean};

function setup({value = '', isEnabled = true}: SetupOptions = {}) {
    const onCommit = jest.fn();
    const onLeaveByKeyboard = jest.fn();
    const elements: Record<DateSegmentName, SegmentElement> = {year: createElement(), month: createElement(), day: createElement()};

    const {result, rerender} = renderHook(
        (props: SetupOptions) => useDateSegmentInput({value: props.value ?? '', isEnabled: props.isEnabled ?? true, minDate: MIN_DATE, maxDate: MAX_DATE, onCommit, onLeaveByKeyboard}),
        {
            initialProps: {value, isEnabled},
        },
    );

    act(() => {
        for (const name of DATE_SEGMENT_NAMES) {
            // The hook only focuses these and reads their selection back, which the stand-in covers
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            result.current.setSegmentRef(name, elements[name] as unknown as AnimatedTextInputRef);
        }
    });

    /** Mirrors what the field draws, so the displayed date can be read back as one string */
    const read = () => DATE_SEGMENT_NAMES.map((name) => result.current.getSegmentProps(name).value).join('-');

    const focusSegment = (name: DateSegmentName) => act(() => result.current.getSegmentProps(name).onFocus());

    const press = (name: DateSegmentName, key: string, modifiers?: {metaKey?: boolean; shiftKey?: boolean}) => {
        const event = createKeyEvent(key, modifiers);
        act(() => result.current.getSegmentProps(name).onKeyPress(event));
        return event;
    };

    /** The segment the hook last moved the caret to, which is how focus movement is asserted */
    const focusedSegment = () => DATE_SEGMENT_NAMES.findLast((name) => elements[name].focus.mock.calls.length > 0);

    const clearFocusCalls = () => {
        for (const name of DATE_SEGMENT_NAMES) {
            elements[name].focus.mockClear();
        }
    };

    const type = (name: DateSegmentName, digits: string) => {
        for (const digit of digits) {
            press(name, digit);
        }
    };

    return {result, rerender, onCommit, onLeaveByKeyboard, elements, read, focusSegment, press, focusedSegment, clearFocusCalls, type};
}

describe('useDateSegmentInput', () => {
    beforeEach(() => {
        setClipboardString.mockClear();
    });

    describe('entering a date', () => {
        it('fills the segments in turn and hands the caret on as each one finishes', () => {
            // Given an empty field the user has clicked into
            const {focusSegment, type, read, focusedSegment, clearFocusCalls, press} = setup();
            focusSegment('year');

            // When a full year is typed
            clearFocusCalls();
            type('year', '2026');

            // Then the year is complete and the caret has moved on by itself
            expect(read()).toBe('2026--');
            expect(focusedSegment()).toBe('month');

            // When the month and day follow
            press('month', '0');
            press('month', '9');
            press('day', '1');
            press('day', '5');

            // Then the field reads the whole date
            expect(read()).toBe('2026-09-15');
        });

        it('hands a digit a segment cannot take on to the next one', () => {
            // Given a month holding a 1, which only a 0, 1 or 2 can extend
            const {focusSegment, type, read, focusedSegment, clearFocusCalls} = setup();
            focusSegment('month');
            type('month', '1');

            // When a 3 is typed, which would make a month that does not exist
            clearFocusCalls();
            type('month', '3');

            // Then the month settles on January and the 3 starts the day off
            expect(read()).toBe('-01-03');
            expect(focusedSegment()).toBe('day');
        });

        it('replaces a segment arrived at rather than extending it', () => {
            // Given a date already in the field, with the caret placed on the month
            const {focusSegment, type, read} = setup({value: '2026-09-15'});
            focusSegment('year');
            focusSegment('month');

            // When a digit is typed
            type('month', '4');

            // Then it starts the month over instead of being added to what was there
            expect(read()).toBe('2026-04-15');
        });
    });

    describe('moving between segments', () => {
        it('moves one segment at a time with the arrows and stops at either end', () => {
            // Given the caret on the month
            const {focusSegment, press, focusedSegment, clearFocusCalls} = setup({value: '2026-09-15'});
            focusSegment('month');

            // When the right arrow is pressed
            clearFocusCalls();
            press('month', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);
            expect(focusedSegment()).toBe('day');

            // Then pressing it again at the last segment stays there rather than leaving the field
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);
            expect(focusedSegment()).toBe('day');

            // And the left arrow walks back the same way
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);
            expect(focusedSegment()).toBe('month');
        });

        it('reports only the keystroke that carries focus out of the field', () => {
            // Given a field being typed in, which nothing else tells when Tab takes focus away
            const {focusSegment, press, onLeaveByKeyboard} = setup({value: '2026-09-15'});
            focusSegment('year');

            // When Tab moves between segments
            press('month', CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey);
            expect(onLeaveByKeyboard).not.toHaveBeenCalled();

            // Then only the outermost segments hand focus out
            press('day', CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey);
            expect(onLeaveByKeyboard).toHaveBeenCalledTimes(1);
            press('year', CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey, {shiftKey: true});
            expect(onLeaveByKeyboard).toHaveBeenCalledTimes(2);
        });
    });

    describe('separators', () => {
        it('finishes a segment early', () => {
            // Given a month holding a single digit that could still be extended into a two digit month
            const {focusSegment, type, press, focusedSegment, clearFocusCalls} = setup();
            focusSegment('month');
            type('month', '1');

            // When a separator is typed
            clearFocusCalls();
            press('month', '-');

            // Then the caret moves on, since the separator says the user is done with that segment
            expect(focusedSegment()).toBe('day');
        });

        it('does nothing in a segment the caret was just handed to', () => {
            // Given a field that already holds a date, with the year retyped so the caret lands on the month
            const {focusSegment, type, press, read, focusedSegment, clearFocusCalls} = setup({value: '2026-09-15'});
            focusSegment('year');
            type('year', '1990');
            expect(focusedSegment()).toBe('month');

            // When the separator the user habitually types next arrives
            clearFocusCalls();
            press('month', '-');

            // Then it is ignored, rather than stepping over a month holding digits the user is about to replace
            expect(focusedSegment()).toBeUndefined();
            expect(read()).toBe('1990-09-15');
        });

        it('does nothing in a segment nothing has been typed into', () => {
            // Given an empty month the caret was placed on
            const {focusSegment, press, focusedSegment, clearFocusCalls} = setup();
            focusSegment('month');

            // When a separator is typed
            clearFocusCalls();
            press('month', '-');

            // Then the caret stays, since moving on would leave the month empty
            expect(focusedSegment()).toBeUndefined();
        });
    });

    describe('deleting', () => {
        it('takes off the last digit', () => {
            // Given a year that has been typed in full
            const {focusSegment, type, read, press} = setup();
            focusSegment('year');
            type('year', '2026');

            // When backspace is pressed on it
            press('year', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then one digit goes, leaving the rest to be corrected
            expect(read()).toBe('202--');
        });

        it('clears the digits selected inside a segment', () => {
            // Given a month whose digits the user has selected, which only the input itself knows about
            const {focusSegment, read, press, elements} = setup({value: '2026-12-15'});
            focusSegment('month');
            elements.month.selectionStart = 0;
            elements.month.selectionEnd = 2;

            // When backspace is pressed
            press('month', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the whole selection goes, rather than one digit leaving the other behind
            expect(read()).toBe('2026--15');
        });

        it('takes out only the part of a segment that is selected', () => {
            // Given the second of a month's two digits selected
            const {focusSegment, read, press, elements} = setup({value: '2026-12-15'});
            focusSegment('month');
            elements.month.selectionStart = 1;
            elements.month.selectionEnd = 2;

            // When backspace is pressed
            press('month', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the digit that was not selected stays
            expect(read()).toBe('2026-01-15');
        });

        it('leaves an empty segment by moving back to the one before it', () => {
            // Given a day with nothing in it
            const {focusSegment, press, focusedSegment, clearFocusCalls} = setup();
            focusSegment('day');

            // When backspace is pressed
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then there is nothing to delete, so the keystroke moves back instead
            expect(focusedSegment()).toBe('month');
        });

        it('empties the field and everything before the caret on the shortcut', () => {
            // Given a full date with the caret on the month
            const {focusSegment, read, press, focusedSegment, clearFocusCalls} = setup({value: '2026-09-15'});
            focusSegment('month');

            // When delete to the start of the line is pressed
            clearFocusCalls();
            press('month', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey, {metaKey: true});

            // Then the month and everything before it goes, and the caret returns to the start
            expect(read()).toBe('--15');
            expect(focusedSegment()).toBe('year');
        });
    });

    describe('selecting the whole date', () => {
        it('replaces everything with the next digit typed', () => {
            // Given a date the user has selected in full
            const {focusSegment, press, read, result} = setup({value: '2026-09-15'});
            focusSegment('year');
            press('year', 'a', {metaKey: true});
            expect(result.current.isAllSelected).toBe(true);

            // When a digit is typed
            press('year', '1');

            // Then it starts a new date rather than joining the one that was there
            expect(read()).toBe('1--');
            expect(result.current.isAllSelected).toBe(false);
        });

        it('copies the date without taking it out of the field', () => {
            // Given the whole date selected, which spans separate inputs the browser cannot copy from
            const {focusSegment, press, read} = setup({value: '2026-09-15'});
            focusSegment('year');
            press('year', 'a', {metaKey: true});

            // When it is copied
            press('year', 'c', {metaKey: true});

            // Then the clipboard carries the date and the field keeps it
            expect(setClipboardString).toHaveBeenCalledWith('2026-09-15');
            expect(read()).toBe('2026-09-15');
        });

        it('cuts the date out of the field', () => {
            // Given the whole date selected
            const {focusSegment, press, read, onCommit} = setup({value: '2026-09-15'});
            focusSegment('year');
            press('year', 'a', {metaKey: true});

            // When it is cut
            press('year', 'x', {metaKey: true});

            // Then the clipboard carries it and the field is emptied, which is a change the form hears about
            expect(setClipboardString).toHaveBeenCalledWith('2026-09-15');
            expect(read()).toBe('--');
            expect(onCommit).toHaveBeenCalledWith('');
        });
    });

    describe('undo and redo', () => {
        it('walks back through the digits typed and forward again', () => {
            // Given a few digits typed into a field whose inputs each have an empty history of their own
            const {focusSegment, type, read, press} = setup();
            focusSegment('year');
            type('year', '202');
            expect(read()).toBe('202--');

            // When undo is pressed twice
            press('year', 'z', {metaKey: true});
            press('year', 'z', {metaKey: true});
            expect(read()).toBe('2--');

            // Then redo returns what was undone
            press('year', 'y', {metaKey: true});
            expect(read()).toBe('20--');
        });

        it('drops what was undone once something else is typed', () => {
            // Given a digit that has been undone, leaving it ahead of the user
            const {focusSegment, type, read, press} = setup();
            focusSegment('year');
            type('year', '20');
            press('year', 'z', {metaKey: true});
            expect(read()).toBe('2--');

            // When a different digit is typed instead
            type('year', '5');
            expect(read()).toBe('25--');

            // Then there is nothing to redo, since that branch was abandoned
            press('year', 'y', {metaKey: true});
            expect(read()).toBe('25--');
        });
    });

    describe('handing the date over', () => {
        it('holds back an entry part way through', () => {
            // Given a date the user is still typing
            const {focusSegment, type, onCommit} = setup();
            focusSegment('year');
            type('year', '2026');

            // When each digit arrives
            // Then nothing is handed over, since a consumer would act on a date that is not finished
            expect(onCommit).not.toHaveBeenCalled();
        });

        it('hands over a date as soon as it is complete', () => {
            // Given a full date being typed
            const {focusSegment, type, press, onCommit} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('month', '9');
            press('day', '1');

            // When the day reads as a number a date can hold
            // Then the date is handed over without waiting for its second digit
            expect(onCommit).toHaveBeenLastCalledWith('2026-09-01');
        });

        it('reports a date that does not exist as no date at all', () => {
            // Given the 31st typed into February
            const {focusSegment, type, press, onCommit, result} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('month', '2');
            press('day', '3');
            press('day', '1');

            // When the entry is complete but names a day the month does not have
            // Then it is held back, and the field says it has digits that do not add up to a date
            expect(onCommit).not.toHaveBeenCalledWith('2026-02-31');
            expect(result.current.hasIncompleteEntry).toBe(true);
        });
    });

    describe('leaving the field', () => {
        it('settles a segment left reading as zero', () => {
            // Given a month the user moved on from after typing only its zero
            const {focusSegment, type, press, onCommit, result} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('day', '1');
            press('day', '5');

            // When focus leaves the field
            act(() => result.current.onFieldBlur());

            // Then the zero settles on the first month, which is the date the user had very nearly entered
            expect(onCommit).toHaveBeenLastCalledWith('2026-01-15');
        });

        it('keeps digits that do not add up to a date on screen to be corrected', () => {
            // Given a year left unfinished
            const {focusSegment, type, result, read} = setup();
            focusSegment('year');
            type('year', '202');

            // When focus leaves the field
            act(() => result.current.onFieldBlur());

            // Then the digits stay, with the field reporting that they cannot be used
            expect(result.current.hasInvalidEntry).toBe(true);
            expect(read()).toBe('202--');
        });

        it('shows the committed date again once a usable entry is left', () => {
            // Given a date that was entered in full
            const {focusSegment, type, press, result} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('month', '9');
            press('day', '1');
            press('day', '5');

            // When focus leaves the field
            act(() => result.current.onFieldBlur());

            // Then the segments step aside and the committed value is what the field shows
            expect(result.current.hasInvalidEntry).toBe(false);
            expect(result.current.isEditing).toBe(false);
        });
    });

    describe('following the calendar', () => {
        it('asks the calendar to show the month being typed', () => {
            // Given a field being typed into
            const {focusSegment, type, press, result} = setup();
            focusSegment('year');
            const startingVersion = result.current.viewDateVersion;
            type('year', '2026');
            press('month', '0');
            press('month', '9');

            // When a month and year that read as somewhere to go are entered
            // Then the calendar is asked for that month, and the count says the request is new
            expect(result.current.viewDate).toEqual(new Date(2026, 8, 1));
            expect(result.current.viewDateVersion).toBeGreaterThan(startingVersion);
        });

        it('counts a repeated month as a request of its own', () => {
            // Given a calendar already showing the month the field asked for
            const {focusSegment, type, press, result} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('month', '9');
            const versionAfterFirstRequest = result.current.viewDateVersion;

            // When the same month is typed again, which the user may have moved the calendar away from
            press('month', '0');
            press('month', '9');

            // Then the count moves, since the date alone would not say the calendar has to come back
            expect(result.current.viewDate).toEqual(new Date(2026, 8, 1));
            expect(result.current.viewDateVersion).toBeGreaterThan(versionAfterFirstRequest);
        });

        it('follows a date picked from the calendar even when it repeats the one already entered', () => {
            // Given a date whose year has had a digit taken out, so nothing was handed over and the value never changed
            const {focusSegment, press, result, read} = setup({value: '1990-02-15'});
            focusSegment('year');
            press('year', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);
            expect(read()).toBe('199-02-15');

            // When that same date is picked from the calendar
            act(() => result.current.onDateSelected('1990-02-15'));

            // Then the segments catch up, which no change of value would have told them to do
            expect(read()).toBe('1990-02-15');
        });
    });

    describe('when typing is turned off', () => {
        it('drops an entry part way through rather than keeping it behind the plain field', () => {
            // Given a date being typed when the window narrows past where the segments are shown
            const {focusSegment, press, result, rerender} = setup({value: '1990-02-15'});
            focusSegment('year');
            press('year', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);
            expect(result.current.isEditing).toBe(true);

            // When typing is turned off
            rerender({value: '1990-02-15', isEnabled: false});
            expect(result.current.isEditing).toBe(false);

            // Then widening the window again shows the committed date rather than the edit that left the screen
            rerender({value: '1990-02-15', isEnabled: true});
            expect(result.current.isEditing).toBe(false);
            expect(DATE_SEGMENT_NAMES.map((name) => result.current.getSegmentProps(name).value).join('-')).toBe('1990-02-15');
        });
    });
});
