/**
 * Drives the guided date input, where the year, month and day are edited in one input each. Every keystroke is handled
 * here and the raw keystroke is prevented, so a segment can only ever hold digits it is allowed to hold.
 */
import type {AnimatedTextInputRef} from '@components/RNTextInput';

import Clipboard from '@libs/Clipboard';
import {
    clearSegmentsUpTo,
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    getAdjacentSegmentName,
    getFirstUnfilledSegmentName,
    getISODateFromSegments,
    getSegmentDisplay,
    getSegmentsFromISODate,
    getSegmentsFromText,
    getViewDateFromSegments,
    hasAnySegment,
    removeLastDigit,
    typeDigitIntoSegments,
} from '@libs/DateInputMaskUtils';
import type {DateSegmentName, DateSegments} from '@libs/DateInputMaskUtils';
import {isNumeric} from '@libs/ValidationUtils';

import CONST from '@src/CONST';

import type {TextInputKeyPressEvent} from 'react-native';

import {useRef, useState} from 'react';

const FIRST_SEGMENT_NAME = DATE_SEGMENT_NAMES[0];
const LAST_SEGMENT_NAME = DATE_SEGMENT_NAMES[DATE_SEGMENT_NAMES.length - 1];

const DELETE_KEY = 'Delete';
const SELECT_ALL_KEY = 'a';
const COPY_KEY = 'c';
const MOVE_KEYS = {
    [CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey]: -1,
    [CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey]: 1,
} as const;

/** The characters a locale uses between segments, any of which means the user is finished with the one they are on */
const SEPARATOR_KEYS = new Set(['-', '/', '.', ' ']);

type UseDateSegmentInputParams = {
    /** The committed date in the format the app stores, shown whenever the field is not being edited */
    value: string;

    /** Whether this platform lets the user type a date at all */
    isEnabled: boolean;

    /** The oldest date the calendar can show, so it is not moved somewhere with nothing to select */
    minDate: Date;

    /** The newest date the calendar can show */
    maxDate: Date;

    /** Called with a stored format date whenever the segments produce one, and with an empty string whenever they do not */
    onCommit: (isoDate: string) => void;
};

/** Everything one segment's input needs. The segment itself is stateless and reports back through these */
type DateSegmentProps = {
    value: string;
    onKeyPress: (event: TextInputKeyPressEvent) => void;
    onChangeText: (text: string) => void;
    onFocus: () => void;

    /** Puts the caret back where the user pressed, which is what collapses a whole field selection */
    onPointerDown: () => void;
};

type UseDateSegmentInputResult = {
    /** Hands over each segment's input, so a keystroke can move focus as it is handled */
    setSegmentRef: (name: DateSegmentName, element: AnimatedTextInputRef | null) => void;

    /** Where a press on the field rather than on a segment lands */
    focusFirstUnfilledSegment: () => void;

    /** Whether focus is going to another segment, which is moving within the field rather than leaving it */
    isSegmentElement: (target: unknown) => boolean;

    /** The month the calendar should show, so it follows the date being typed. Undefined leaves the calendar alone */
    viewDate: Date | undefined;

    /** Counts how many times the input has asked the calendar to follow it, so asking twice for the same month counts twice */
    viewDateVersion: number;

    /** Whether any digit has been typed, so the field is showing more than an untouched mask */
    hasTypedDigits: boolean;

    /** Whether the whole date is selected, so the field draws it as one selection and the next keystroke replaces it */
    isAllSelected: boolean;

    /** Whether a date is being entered right now, so the segments rather than the committed value are what the field shows */
    isEditing: boolean;

    /** Whether the field was left holding digits that do not add up to a date, which reads as no date at all */
    hasInvalidEntry: boolean;

    /** Whether the segments hold digits that do not add up to a date, so there is no date to hand over yet */
    hasIncompleteEntry: boolean;

    getSegmentProps: (name: DateSegmentName) => DateSegmentProps;

    /** Called once focus has left the field altogether rather than moved between segments */
    onFieldBlur: () => void;

    /** Called when the field's clear button empties it, so the segments start again rather than being left behind */
    onClear: () => void;
};

function isMoveKey(key: string): key is keyof typeof MOVE_KEYS {
    return key in MOVE_KEYS;
}

function useDateSegmentInput({value, isEnabled, minDate, maxDate, onCommit}: UseDateSegmentInputParams): UseDateSegmentInputResult {
    // The segments only describe an edit in progress, so they are seeded on focus rather than synced with the value
    const [segments, setSegments] = useState<DateSegments>(EMPTY_SEGMENTS);
    const [isEditing, setIsEditing] = useState(false);
    const segmentRefs = useRef<Partial<Record<DateSegmentName, AnimatedTextInputRef | null>>>({});
    const [viewDate, setViewDate] = useState<Date | undefined>(undefined);
    const [viewDateVersion, setViewDateVersion] = useState(0);
    // Set on arriving at a segment, so the next digit replaces it instead of extending it
    const [shouldOverwrite, setShouldOverwrite] = useState(false);
    const [appliedValue, setAppliedValue] = useState(value);
    // Digits that do not add up to a date stay on screen after the field is left, so the user can correct them
    const [hasInvalidEntry, setHasInvalidEntry] = useState(false);
    // Native selection cannot span separate inputs, so selecting the whole date is tracked here and drawn by the field
    const [isAllSelected, setIsAllSelected] = useState(false);

    // A date set from outside, by the calendar or a restored draft, has to reach an edit in progress too
    if (value !== appliedValue) {
        setAppliedValue(value);

        // A date this field has just committed already agrees with the segments, and seeding from it would replace a
        // half typed segment with the padded form it is showing. The next digit would then start the segment over.
        if (isEditing && value !== (getISODateFromSegments(segments) ?? '')) {
            setSegments(getSegmentsFromISODate(value));
        }

        // A date picked from the calendar settles what the field holds, so there is no longer an entry to correct. An
        // empty value is the field reporting its own unusable entry, which is what put those digits on screen.
        if (value) {
            setHasInvalidEntry(false);
        }
    }

    const setSegmentRef = (name: DateSegmentName, element: AnimatedTextInputRef | null) => {
        segmentRefs.current[name] = element;
    };

    const isSegmentElement = (target: unknown) => !!target && Object.values(segmentRefs.current).some((element) => element === target);

    /** Rests the caret after the segment's digits, so a half typed month reads as 02 and not 0, a caret, then 2 */
    const focusSegment = (name: DateSegmentName) => {
        const element = segmentRefs.current[name];
        element?.focus();

        const caretPosition = element?.value?.length ?? 0;
        element?.setSelectionRange?.(caretPosition, caretPosition);
    };

    const enterSegment = (name: DateSegmentName) => {
        setShouldOverwrite(true);
        focusSegment(name);
    };

    /**
     * Runs on every keystroke rather than once the date is finished. An entry part way through is held back, since a
     * consumer that acts on each change would act on a date the user has not finished writing. Emptying the field is
     * reported, because that is a change the user has finished making.
     */
    const commitSegments = (newSegments: DateSegments) => {
        const isoDate = getISODateFromSegments(newSegments);

        if (!isoDate && hasAnySegment(newSegments)) {
            return;
        }

        onCommit(isoDate ?? '');
    };

    /** The count carries the request, since the user may have moved the calendar away and typed the month it was on */
    const assertViewDate = (nextViewDate: Date | undefined) => {
        if (!nextViewDate) {
            return;
        }

        setViewDate(nextViewDate);
        setViewDateVersion((version) => version + 1);
    };

    /** The one place segments are written, so the calendar cannot fall out of step with them */
    const applySegments = (newSegments: DateSegments) => {
        setSegments(newSegments);
        assertViewDate(getViewDateFromSegments(newSegments, viewDate ?? new Date(), minDate, maxDate));
        commitSegments(newSegments);
    };

    const handleKeyPress = (name: DateSegmentName, event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;

        // A shortcut is the browser's to handle, apart from the two it cannot apply across separate inputs
        if (event.nativeEvent.metaKey || event.nativeEvent.ctrlKey) {
            if (key === CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey || key === DELETE_KEY) {
                event.preventDefault();
                setIsAllSelected(false);
                applySegments(isAllSelected ? EMPTY_SEGMENTS : clearSegmentsUpTo(segments, name));
                enterSegment(FIRST_SEGMENT_NAME);
                return;
            }

            // Selecting the whole date selects nothing in the document, so the browser has nothing of its own to copy
            if (key.toLowerCase() === COPY_KEY && isAllSelected) {
                const isoDate = getISODateFromSegments(segments);

                if (isoDate) {
                    event.preventDefault();
                    Clipboard.setString(isoDate);
                }
                return;
            }

            if (key.toLowerCase() !== SELECT_ALL_KEY || !hasAnySegment(segments)) {
                return;
            }

            event.preventDefault();
            setIsAllSelected(true);
            // Selecting the date puts the caret at its start, so replacing it does not have to move focus first
            enterSegment(FIRST_SEGMENT_NAME);
            return;
        }

        const wasAllSelected = isAllSelected;
        setIsAllSelected(false);

        if (isNumeric(key)) {
            event.preventDefault();
            const result = typeDigitIntoSegments(wasAllSelected ? EMPTY_SEGMENTS : segments, name, key, shouldOverwrite);
            setShouldOverwrite(false);
            applySegments(result.segments);

            if (result.nextSegmentName) {
                enterSegment(result.nextSegmentName);
            }
            return;
        }

        if (isMoveKey(key)) {
            event.preventDefault();
            enterSegment(getAdjacentSegmentName(name, MOVE_KEYS[key]));
            return;
        }

        if (key === CONST.KEYBOARD_SHORTCUTS.BACKSPACE.shortcutKey || key === DELETE_KEY) {
            event.preventDefault();

            if (wasAllSelected) {
                applySegments(EMPTY_SEGMENTS);
                enterSegment(FIRST_SEGMENT_NAME);
                return;
            }

            const trimmedSegments = removeLastDigit(segments, name);

            // An empty segment has nothing to delete, so the keystroke falls back to leaving it
            if (!trimmedSegments) {
                enterSegment(getAdjacentSegmentName(name, -1));
                return;
            }

            applySegments(trimmedSegments);
            setShouldOverwrite(false);
            return;
        }

        if (!SEPARATOR_KEYS.has(key)) {
            // Nothing else may reach the input, or the browser would write characters the mask cannot represent
            if (key.length === 1) {
                event.preventDefault();
            }
            return;
        }

        // A separator means the user is finished with this segment even if they only typed one digit into it
        event.preventDefault();
        enterSegment(getAdjacentSegmentName(name, 1));
    };

    // Every keystroke is prevented, so this only runs for text the user pasted in
    const handleChangeText = (name: DateSegmentName, text: string) => {
        // The input reports its whole value, and the caret rests after the digits the segment already holds, so what
        // the user pasted is whatever follows them
        const shownValue = getSegmentDisplay(segments, name);
        const pastedText = text.startsWith(shownValue) ? text.slice(shownValue.length) : text;

        // A paste over the whole date replaces it, while one into a single segment merges into what is already there
        const baseSegments = isAllSelected ? EMPTY_SEGMENTS : segments;
        const pastedSegments = getSegmentsFromText(pastedText, name, baseSegments);

        // Text with no digits in it leaves every segment as it was, so there is nothing to apply and nowhere to move
        if (pastedSegments === baseSegments) {
            return;
        }

        setIsAllSelected(false);
        applySegments(pastedSegments);

        const unfilledName = getFirstUnfilledSegmentName(pastedSegments);

        // A paste that fills the date leaves the last segment ready to be started over
        if (!unfilledName) {
            enterSegment(LAST_SEGMENT_NAME);
            return;
        }

        // A paste that fills only part of the date leaves the user at the digits they still have to enter. Those are
        // the start of that segment, so the next digit has to extend them rather than replace them.
        focusSegment(unfilledName);
        setShouldOverwrite(false);
    };

    const handleSegmentFocus = () => {
        setShouldOverwrite(true);

        if (isEditing) {
            return;
        }

        // Returning to an entry that was left unusable resumes it, since the date it reported was the empty one
        const seededSegments = hasInvalidEntry ? segments : getSegmentsFromISODate(value);
        setHasInvalidEntry(false);
        setSegments(seededSegments);
        assertViewDate(getViewDateFromSegments(seededSegments, new Date(), minDate, maxDate));
        setIsEditing(true);
    };

    const handleFieldBlur = () => {
        setIsEditing(false);
        setViewDate(undefined);
        setShouldOverwrite(false);
        setIsAllSelected(false);

        const hasUnusableEntry = hasAnySegment(segments) && !getISODateFromSegments(segments);
        setHasInvalidEntry(hasUnusableEntry);

        if (!hasUnusableEntry) {
            setSegments(EMPTY_SEGMENTS);
        }
    };

    // The clear button unmounts as it is pressed, so focus is placed here rather than left to whatever is underneath
    const handleClear = () => {
        setSegments(EMPTY_SEGMENTS);
        setHasInvalidEntry(false);
        setIsAllSelected(false);
        setViewDate(undefined);
        enterSegment(FIRST_SEGMENT_NAME);
    };

    if (!isEnabled) {
        return {
            setSegmentRef: () => {},
            focusFirstUnfilledSegment: () => {},
            isSegmentElement: () => false,
            viewDate: undefined,
            viewDateVersion: 0,
            hasTypedDigits: false,
            isAllSelected: false,
            isEditing: false,
            hasInvalidEntry: false,
            hasIncompleteEntry: false,
            getSegmentProps: () => ({value: '', onKeyPress: () => {}, onChangeText: () => {}, onFocus: () => {}, onPointerDown: () => {}}),
            onFieldBlur: () => {},
            onClear: () => {},
        };
    }

    // Outside an edit in progress or one left unusable, the committed date is what the field shows
    const shouldShowSegments = isEditing || hasInvalidEntry;
    const displayedSegments = shouldShowSegments ? segments : getSegmentsFromISODate(value);

    const focusFirstUnfilledSegment = () => {
        setIsAllSelected(false);
        focusSegment(getFirstUnfilledSegmentName(displayedSegments) ?? LAST_SEGMENT_NAME);
    };

    return {
        setSegmentRef,
        focusFirstUnfilledSegment,
        isSegmentElement,
        viewDate: isEditing ? viewDate : undefined,
        viewDateVersion,
        hasTypedDigits: shouldShowSegments && hasAnySegment(segments),
        isAllSelected,
        isEditing,
        hasInvalidEntry,
        hasIncompleteEntry: shouldShowSegments && hasAnySegment(segments) && !getISODateFromSegments(segments),
        getSegmentProps: (name: DateSegmentName) => ({
            value: getSegmentDisplay(displayedSegments, name),
            onKeyPress: (event: TextInputKeyPressEvent) => handleKeyPress(name, event),
            onChangeText: (text: string) => handleChangeText(name, text),
            onFocus: handleSegmentFocus,
            onPointerDown: () => setIsAllSelected(false),
        }),
        onFieldBlur: handleFieldBlur,
        onClear: handleClear,
    };
}

export default useDateSegmentInput;
export type {UseDateSegmentInputResult};
