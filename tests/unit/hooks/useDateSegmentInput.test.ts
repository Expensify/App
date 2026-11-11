import {act, renderHook} from '@testing-library/react-native';

import type {AnimatedTextInputRef} from '@components/RNTextInput';

import useDateSegmentInput from '@hooks/useDateSegmentInput';

import Clipboard from '@libs/Clipboard';
import {DATE_SEGMENT_NAMES, getSegmentsFromISODate} from '@libs/DateInputMaskUtils';
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

function createElement(value = ''): SegmentElement {
    const element: SegmentElement = {focus: jest.fn(), setSelectionRange: jest.fn(), value, selectionStart: null, selectionEnd: null};

    // The hook reads the caret back from the element it put there, so the stand-in has to remember it
    element.setSelectionRange = jest.fn((start: number, end: number) => {
        element.selectionStart = start;
        element.selectionEnd = end;
    });

    return element;
}

function createKeyEvent(key: string, modifiers: {metaKey?: boolean; shiftKey?: boolean; altKey?: boolean} = {}) {
    const preventDefault = jest.fn();
    const event = {
        preventDefault,
        nativeEvent: {key, metaKey: modifiers.metaKey ?? false, ctrlKey: false, shiftKey: modifiers.shiftKey ?? false, altKey: modifiers.altKey ?? false},
    };

    // The hook reads a handful of fields off the event and prevents it, which is all this has to carry
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {event: event as unknown as TextInputKeyPressEvent, preventDefault};
}

type SetupOptions = {value?: string; isEnabled?: boolean};

function setup({value = '', isEnabled = true}: SetupOptions = {}) {
    const onCommit = jest.fn();
    const onLeaveByKeyboard = jest.fn();
    const shownSegments = getSegmentsFromISODate(value);
    const elements: Record<DateSegmentName, SegmentElement> = {year: createElement(shownSegments.year), month: createElement(shownSegments.month), day: createElement(shownSegments.day)};

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

    /** Whether the hook answered the keystroke itself, since what it leaves alone is what the input answers */
    const press = (name: DateSegmentName, key: string, modifiers?: {metaKey?: boolean; shiftKey?: boolean; altKey?: boolean}) => {
        const {event, preventDefault} = createKeyEvent(key, modifiers);
        act(() => result.current.getSegmentProps(name).onKeyPress(event));
        return preventDefault.mock.calls.length > 0;
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

    /** Puts the caret where the browser would after a click, which is what a plain arrow moves a digit at a time */
    /** Where the hook left the caret inside one segment, which is what an edit part way through a segment is read against */
    const caret = (name: DateSegmentName) => elements[name].selectionStart;

    const setCaret = (name: DateSegmentName, start: number, end = start) => {
        elements[name].selectionStart = start;
        elements[name].selectionEnd = end;
    };

    return {result, rerender, onCommit, onLeaveByKeyboard, elements, read, focusSegment, press, focusedSegment, clearFocusCalls, type, setCaret, caret};
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

        it('replaces only the selected digit when one is typed over', () => {
            // Given the last digit of the year selected, which only the input itself knows about
            const {focusSegment, read, press, elements} = setup({value: '1990-11-28'});
            focusSegment('year');
            elements.year.selectionStart = 3;
            elements.year.selectionEnd = 4;

            // When a digit is typed
            press('year', '1');

            // Then it takes that digit's place, rather than starting the year over
            expect(read()).toBe('1991-11-28');

            // Then the caret is left after what was typed, so the next digit carries on from there
            expect(elements.year.setSelectionRange).toHaveBeenCalledWith(4, 4);
        });
    });

    describe('moving between segments', () => {
        it('collapses a selection against the edge the arrow points to at the start of the date', () => {
            // Given the whole year selected inside its own input, which only the input knows about
            const {focusSegment, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-09-15'});
            focusSegment('year');
            setCaret('year', 0, 4);

            // When the left arrow is pressed, with no segment before the year for it to reach
            clearFocusCalls();
            const wasHandled = press('year', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);

            // Then the input is left to answer it, so the caret collapses to the start rather than jumping to the end
            expect(wasHandled).toBe(false);
            expect(focusedSegment()).toBeUndefined();
        });

        it('moves one segment at a time with the arrows and stops at either end', () => {
            // Given the caret against the right hand edge of the month, so the next digit is in the segment beside it
            const {focusSegment, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-09-15'});
            focusSegment('month');
            setCaret('month', 2);

            // When the right arrow is pressed
            clearFocusCalls();
            press('month', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey);
            expect(focusedSegment()).toBe('day');

            // Then pressing it again at the end of the last segment is left to the input, which keeps the caret there
            clearFocusCalls();
            setCaret('day', 2);
            expect(press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey)).toBe(false);
            expect(focusedSegment()).toBeUndefined();

            // And the left arrow walks back the same way once the caret reaches the other edge
            clearFocusCalls();
            setCaret('day', 0);
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);
            expect(focusedSegment()).toBe('month');
        });

        it('leaves the caret to the input while it is still moving between the digits of one segment', () => {
            // Given the caret between the digits of the day
            const {focusSegment, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-09-15'});
            focusSegment('day');
            setCaret('day', 1);

            // When the left arrow is pressed, which has a digit to move over before it reaches the month
            clearFocusCalls();
            const wasHandled = press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey);

            // Then the keystroke is left alone, so the input moves its own caret the one digit
            expect(wasHandled).toBe(false);
            expect(focusedSegment()).toBeUndefined();
        });

        it('lets a selection be extended within a segment rather than moving focus', () => {
            // Given the caret before the first digit of the year
            const {focusSegment, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '1990-05-15'});
            focusSegment('year');
            setCaret('year', 0);

            // When the right arrow is pressed with shift held, which asks for that digit to be selected
            clearFocusCalls();
            const wasHandled = press('year', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, {shiftKey: true});

            // Then the input is left to select it, rather than focus moving to the month where nothing would be selected
            expect(wasHandled).toBe(false);
            expect(focusedSegment()).toBeUndefined();
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

        it('takes off the digit the caret is behind rather than the last one', () => {
            // Given a whole date with the caret partway through the year
            const {focusSegment, read, press, setCaret, caret} = setup({value: '2026-09-15'});
            focusSegment('year');
            setCaret('year', 2);

            // When backspace is pressed
            press('year', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the digit before the caret goes and the caret takes its place, so holding the key keeps moving back
            expect(read()).toBe('226-09-15');
            expect(caret('year')).toBe(1);
        });

        it('moves back out of a segment the caret is already at the start of', () => {
            // Given the caret before the first digit of the day, which backspace reaches past
            const {focusSegment, read, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-09-15'});
            focusSegment('day');
            setCaret('day', 0);

            // When backspace is pressed
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the day keeps its digits, since the key reached past them, and the caret moves back a segment
            expect(read()).toBe('2026-09-15');
            expect(focusedSegment()).toBe('month');
        });

        it('empties a zero padded segment rather than taking its padding for a digit', () => {
            // Given the caret after the day, whose two digits are the only ones the user typed
            const {focusSegment, read, press, setCaret} = setup({value: '2026-09-15'});
            focusSegment('day');
            setCaret('day', 2);

            // When backspace is pressed once for each digit
            press('day', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);
            press('day', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the day is empty, since the zero it shows while one digit is left is not a digit to take out
            expect(read()).toBe('2026-09-');
        });

        it('leaves the caret alone on backspace at the start of the date', () => {
            // Given the caret before the first digit of the year, which has no segment before it to fall back to
            const {focusSegment, read, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-09-15'});
            focusSegment('year');
            setCaret('year', 0);

            // When backspace is pressed
            clearFocusCalls();
            press('year', CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey);

            // Then the date is kept and the caret is left where it is, so holding the key does not eat the year
            expect(read()).toBe('2026-09-15');
            expect(focusedSegment()).toBeUndefined();
        });

        it('takes out the digit in front of the caret on delete', () => {
            // Given the caret before the first digit of the day
            const {focusSegment, read, press, setCaret} = setup({value: '2026-11-28'});
            focusSegment('day');
            setCaret('day', 0);

            // When delete is pressed, which reaches the other way to backspace
            press('day', CONST.KEYBOARD_SHORTCUTS.DELETE.shortcutKey);

            // Then the digit the caret is in front of goes, rather than the last one in the segment
            expect(read()).toBe('2026-11-08');
        });

        it('leaves the date alone on delete at the end of a segment', () => {
            // Given the caret after the last digit of the day, which delete reaches past
            const {focusSegment, read, press, focusedSegment, clearFocusCalls, setCaret} = setup({value: '2026-11-28'});
            focusSegment('day');
            setCaret('day', 2);

            // When delete is pressed
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.DELETE.shortcutKey);

            // Then nothing is taken out and the caret stays where the user put it
            expect(read()).toBe('2026-11-28');
            expect(focusedSegment()).toBeUndefined();
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

        it('waits for the digit that finishes the day before handing the date over', () => {
            // Given a full date being typed
            const {focusSegment, type, press, onCommit} = setup();
            focusSegment('year');
            type('year', '2026');
            press('month', '0');
            press('month', '9');
            press('day', '1');

            // When the day holds one digit, which is zero padded into a date of its own
            // Then nothing is handed over, since the user is partway through the number they mean
            expect(onCommit).not.toHaveBeenCalled();

            // When the digit that fills the day follows
            press('day', '5');

            // Then the date is handed over once, for the day they meant rather than for both in turn
            expect(onCommit).toHaveBeenCalledTimes(1);
            expect(onCommit).toHaveBeenCalledWith('2026-09-15');
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

        it('empties an unusable entry on the first press of the clear button', () => {
            // Given an entry left holding digits that do not add up to a date, which the field keeps on screen
            const {focusSegment, type, result, read} = setup({value: ''});
            focusSegment('year');
            type('year', '2023');
            type('month', '02');
            type('day', '31');
            act(() => {
                result.current.onFieldBlur();
            });
            expect(result.current.hasInvalidEntry).toBe(true);

            // When the clear button is pressed, which hands focus back to the field within the same press
            act(() => {
                result.current.onClear();
                result.current.getSegmentProps('year').onFocus();
            });

            // Then the entry is gone, rather than resumed by the focus the press itself caused
            expect(read()).toBe('--');
        });

        it('reports an unusable entry to whoever is saving outside a form', () => {
            // Given a date the user typed past, leaving the day on a number that month does not have
            const {focusSegment, type, result, onCommit} = setup({value: '2026-11-12'});
            focusSegment('day');
            type('day', '13');
            type('day', '31');

            // When focus leaves the field
            let wasLeftUnusable = false;
            act(() => {
                wasLeftUnusable = result.current.onFieldBlur();
            });

            // Then leaving is reported as unusable, so the date reported on the way there is not saved as the answer
            expect(wasLeftUnusable).toBe(true);
            expect(onCommit).toHaveBeenLastCalledWith('2026-11-13');
            expect(result.current.hasInvalidEntry).toBe(true);
        });

        it('reports a usable entry as one worth saving', () => {
            // Given a date the user finished
            const {focusSegment, type, result} = setup({value: '2026-11-12'});
            focusSegment('day');
            type('day', '13');

            // When focus leaves the field
            let wasLeftUnusable = true;
            act(() => {
                wasLeftUnusable = result.current.onFieldBlur();
            });

            // Then nothing objects to what was left behind
            expect(wasLeftUnusable).toBe(false);
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

    describe('arrow keys held with a modifier', () => {
        it('carries the caret to the start of the date', () => {
            // Given a field holding a whole date, which the user is at the end of
            const {press, elements} = setup({value: '1990-05-15'});

            // When the caret is sent left the way a text field is asked for the start of the line
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, {metaKey: true});

            // Then it reaches the year, rather than stopping at the month as an arrow over one segment would
            expect(elements.year.focus).toHaveBeenCalled();
            expect(elements.month.focus).not.toHaveBeenCalled();

            // Then it rests before the first digit, which is where the start of the line is
            expect(elements.year.setSelectionRange).toHaveBeenCalledWith(0, 0);
        });

        it('carries the caret over one segment at a time while alt is held', () => {
            // Given the caret between the digits of the day, which alt steps over the way it steps over a word
            const {focusSegment, press, elements, clearFocusCalls, setCaret} = setup({value: '1990-05-15'});
            focusSegment('day');
            setCaret('day', 1);

            // When the caret is sent left
            clearFocusCalls();
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, {altKey: true});

            // Then it rests at the start of the day rather than carrying on into the month
            expect(elements.day.setSelectionRange).toHaveBeenCalledWith(0, 0);
            expect(elements.month.focus).not.toHaveBeenCalled();

            // Then sending it left again from that edge reaches the month, the way a second alt press reaches the word before
            clearFocusCalls();
            setCaret('day', 0);
            press('day', CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey, {altKey: true});
            expect(elements.month.focus).toHaveBeenCalled();
            expect(elements.year.focus).not.toHaveBeenCalled();
        });

        it('carries the caret to the end of the date', () => {
            // Given the same date, which the user is at the start of
            const {press, elements} = setup({value: '1990-05-15'});

            // When the caret is sent the other way, which a modifier the browser answers alone would otherwise swallow
            press('year', CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey, {metaKey: true});

            // Then it reaches the day, resting after its digits the way the end of a line does
            expect(elements.day.focus).toHaveBeenCalled();
            expect(elements.month.focus).not.toHaveBeenCalled();
            expect(elements.day.setSelectionRange).toHaveBeenCalledWith(2, 2);
        });
    });

    describe('restoring focus', () => {
        it('gives focus back to the segment the user was last in', () => {
            // Given a field holding a whole date, which the user has entered at the month
            const {result, elements, focusSegment} = setup({value: '1990-05-15'});
            focusSegment('month');

            // When a modal has taken focus away and hands it back, as the month and year pickers do
            act(() => result.current.restoreFocus());

            // Then the caret returns to the month rather than being moved somewhere the user did not ask about
            expect(elements.month.focus).toHaveBeenCalled();
            expect(elements.day.focus).not.toHaveBeenCalled();
        });

        it('starts at the beginning of the date when the user has not been in it yet', () => {
            // Given a field holding a whole date that nothing has been focused in, so there is no caret to return
            const {result, elements} = setup({value: '1990-05-15'});

            // When focus is handed back anyway
            act(() => result.current.restoreFocus());

            // Then it lands where an untouched field starts, since a whole date stops short nowhere
            expect(elements.year.focus).toHaveBeenCalled();
            expect(elements.day.focus).not.toHaveBeenCalled();
        });

        it('stops at the digits the date is still missing when the user has not been in it yet', () => {
            // Given an empty field, which the user has to fill in from the first segment on
            const {result, elements} = setup();

            // When focus is handed back
            act(() => result.current.restoreFocus());

            // Then it lands on the segment typing would start at
            expect(elements.year.focus).toHaveBeenCalled();
        });
    });
});
