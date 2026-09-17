/**
 * Drives the guided date input, where the year, month and day are selected and edited one segment at a time. Every
 * keystroke is handled here and the raw keystroke is prevented, so the field can only ever hold a date shaped value.
 */
import {
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    getAdjacentSegmentName,
    getCaretOffsetLimit,
    getDateDisplay,
    getFirstUnfilledSegmentName,
    getISODateFromSegments,
    getSegmentNameAtPosition,
    getSegmentsFromISODate,
    getSegmentsFromText,
    getViewDateFromSegments,
    hasAnySegment,
    removeLastDigit,
    typeDigitIntoSegments,
} from '@libs/DateInputMaskUtils';
import type {DateSegmentName, DateSegmentRange, DateSegments} from '@libs/DateInputMaskUtils';
import {isNumeric} from '@libs/ValidationUtils';

import type {TextInputKeyPressEvent, TextInputSelectionChangeEvent} from 'react-native';

import {useRef, useState} from 'react';

const FIRST_SEGMENT_NAME = DATE_SEGMENT_NAMES[0];
const LAST_SEGMENT_NAME = DATE_SEGMENT_NAMES[DATE_SEGMENT_NAMES.length - 1];

const BACKSPACE_KEY = 'Backspace';
const DELETE_KEY = 'Delete';
const MOVE_KEYS = {ArrowLeft: -1, ArrowRight: 1} as const;

/** The characters a locale uses between segments, any of which means the user is finished with the one they are on */
const SEPARATOR_KEYS = new Set(['-', '/', '.', ' ']);

type UseDateSegmentInputParams = {
    /** The committed date in the format the app stores, shown whenever the field is not being edited */
    value: string;

    /** The localized mask, such as YYYY-MM-DD, which decides the segment order and the text shown for empty segments */
    mask: string;

    /** Whether this platform lets the user type a date at all */
    isEnabled: boolean;

    /** The oldest date the calendar can show, so it is not moved somewhere with nothing to select */
    minDate: Date;

    /** The newest date the calendar can show */
    maxDate: Date;

    /** Called with a stored format date once every segment holds a valid value */
    onCommit: (isoDate: string) => void;
};

type UseDateSegmentInputResult = {
    /** The text to render in the input */
    displayValue: string;

    /** The range covering the segment being edited, which selects it as a whole */
    selection: DateSegmentRange | undefined;

    /** The month the calendar should show, so it follows the date being typed. Undefined leaves the calendar alone */
    viewDate: Date | undefined;

    onKeyPress: (event: TextInputKeyPressEvent) => void;
    onSelectionChange: (event: TextInputSelectionChangeEvent) => void;
    onChangeText: (text: string) => void;
    onFocus: () => void;
    onBlur: () => void;
};

function isMoveKey(key: string): key is keyof typeof MOVE_KEYS {
    return key in MOVE_KEYS;
}

export default function useDateSegmentInput({value, mask, isEnabled, minDate, maxDate, onCommit}: UseDateSegmentInputParams): UseDateSegmentInputResult {
    // The segments only describe an edit in progress, so they are seeded on focus rather than synced with the value
    const [segments, setSegments] = useState<DateSegments>(EMPTY_SEGMENTS);
    const [activeSegmentName, setActiveSegmentName] = useState<DateSegmentName>(FIRST_SEGMENT_NAME);
    const [caretOffset, setCaretOffset] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    // The month the calendar should show, which follows the typed date once the year is complete
    const [viewDate, setViewDate] = useState<Date | undefined>(undefined);
    // Re-rendering with a new value makes the browser report a caret of its own choosing. Honouring that would drag
    // the active segment around, so the first report after a keystroke is discarded as an echo of our own update.
    const hasPendingCaretEchoRef = useRef(false);
    // Whether the next digit replaces the active segment instead of extending it, set on arriving at a segment
    const shouldOverwriteRef = useRef(false);

    const {value: editingValue, ranges} = getDateDisplay(segments, mask);
    const activeRange = ranges[activeSegmentName];
    // A caret parked on a digit place reads as three fields sharing one box. Selecting the whole segment instead would
    // highlight it as a block, which is not what the design asks for.
    const caretPosition = activeRange.start + caretOffset;

    /**
     * A caret may rest on any digit place already typed, or just after the last of them, but never out on a mask
     * letter. An empty segment therefore only ever has its start, which is what stops a click landing on a bare Y.
     */
    const getFurthestOffset = (name: DateSegmentName, currentSegments: DateSegments) => getCaretOffsetLimit(currentSegments, name);

    const moveCaret = (name: DateSegmentName, offset: number, nextSegments: DateSegments = segments) => {
        hasPendingCaretEchoRef.current = true;
        setActiveSegmentName(name);
        setCaretOffset(Math.min(Math.max(offset, 0), getFurthestOffset(name, nextSegments)));
    };

    /**
     * Landing on a segment always rests the caret after whatever it already holds, so an empty one reads from its
     * start and a filled one is ready to be typed over. `shouldOverwriteRef` is what makes that typing replace the
     * segment rather than extend it.
     */
    const enterSegment = (name: DateSegmentName, nextSegments: DateSegments = segments) => {
        shouldOverwriteRef.current = true;
        moveCaret(name, getFurthestOffset(name, nextSegments), nextSegments);
    };

    const commitIfComplete = (newSegments: DateSegments) => {
        const isoDate = getISODateFromSegments(newSegments);
        if (!isoDate) {
            return;
        }

        onCommit(isoDate);
    };

    /**
     * The one place segments are written, so the calendar cannot fall out of step with them. The month already on
     * screen is the fallback while the typed month is unfinished, which keeps the calendar where the user left it.
     */
    const applySegments = (newSegments: DateSegments) => {
        setSegments(newSegments);

        const nextViewDate = getViewDateFromSegments(newSegments, (viewDate ?? new Date()).getMonth(), minDate, maxDate);
        if (nextViewDate) {
            setViewDate(nextViewDate);
        }

        commitIfComplete(newSegments);
    };

    const handleKeyPress = (event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;

        if (isNumeric(key)) {
            event.preventDefault();
            const result = typeDigitIntoSegments(segments, activeSegmentName, key, shouldOverwriteRef.current);
            shouldOverwriteRef.current = false;
            applySegments(result.segments);

            if (result.nextSegmentName) {
                enterSegment(result.nextSegmentName, result.segments);
                return;
            }

            moveCaret(activeSegmentName, getFurthestOffset(activeSegmentName, result.segments), result.segments);
            return;
        }

        if (isMoveKey(key)) {
            event.preventDefault();
            enterSegment(getAdjacentSegmentName(activeSegmentName, MOVE_KEYS[key]));
            return;
        }

        if (key === BACKSPACE_KEY || key === DELETE_KEY) {
            event.preventDefault();
            const trimmedSegments = removeLastDigit(segments, activeSegmentName);

            // An empty segment has nothing to delete, so the keystroke falls back to leaving it
            if (!trimmedSegments) {
                enterSegment(getAdjacentSegmentName(activeSegmentName, -1));
                return;
            }

            applySegments(trimmedSegments);
            shouldOverwriteRef.current = false;
            moveCaret(activeSegmentName, getFurthestOffset(activeSegmentName, trimmedSegments), trimmedSegments);
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
        enterSegment(getAdjacentSegmentName(activeSegmentName, 1));
    };

    // Clicking into the text lands the caret anywhere, so snap it onto the digit place that was clicked
    const handleSelectionChange = (event: TextInputSelectionChangeEvent) => {
        if (hasPendingCaretEchoRef.current) {
            hasPendingCaretEchoRef.current = false;
            return;
        }

        const position = event.nativeEvent.selection.start;

        // Landing past the end of the text means the empty space in the field was clicked rather than a segment, so
        // the first segment still to be filled in takes it, which is the year on an untouched field.
        const clickedSegmentName = position >= editingValue.length ? (getFirstUnfilledSegmentName(segments) ?? LAST_SEGMENT_NAME) : getSegmentNameAtPosition(position, ranges);
        const clickedOffset = position - ranges[clickedSegmentName].start;

        // Clicking is aiming at a digit place rather than arriving at a segment, so the next digit extends what is
        // there instead of replacing it
        shouldOverwriteRef.current = false;
        moveCaret(clickedSegmentName, clickedOffset);
    };

    // Every keystroke is prevented, so this only runs for text the user pasted in
    const handleChangeText = (text: string) => {
        const pastedSegments = getSegmentsFromText(text);
        if (!hasAnySegment(pastedSegments)) {
            return;
        }

        applySegments(pastedSegments);
        enterSegment(LAST_SEGMENT_NAME, pastedSegments);
    };

    const handleFocus = () => {
        const seededSegments = getSegmentsFromISODate(value);
        const firstSegmentName = getFirstUnfilledSegmentName(seededSegments) ?? FIRST_SEGMENT_NAME;

        setSegments(seededSegments);
        setViewDate(getViewDateFromSegments(seededSegments, new Date().getMonth(), minDate, maxDate));
        shouldOverwriteRef.current = false;
        setActiveSegmentName(firstSegmentName);
        setCaretOffset(getCaretOffsetLimit(seededSegments, firstSegmentName));

        // Deliberately not arming the caret echo guard. The click that brought focus here reports its own position
        // next, and that report is what moves the caret off the end of the text and onto a segment.
        setIsEditing(true);
    };

    // An unfinished edit is dropped rather than cleared, so leaving the field restores the last committed date
    const handleBlur = () => {
        setIsEditing(false);
        setSegments(EMPTY_SEGMENTS);
        setCaretOffset(0);
        setViewDate(undefined);
        shouldOverwriteRef.current = false;
    };

    if (!isEnabled) {
        return {
            displayValue: value,
            selection: undefined,
            viewDate: undefined,
            onKeyPress: () => {},
            onSelectionChange: () => {},
            onChangeText: () => {},
            onFocus: () => {},
            onBlur: () => {},
        };
    }

    return {
        displayValue: isEditing ? editingValue : value,
        selection: isEditing ? {start: caretPosition, end: caretPosition} : undefined,
        viewDate: isEditing ? viewDate : undefined,
        onKeyPress: handleKeyPress,
        onSelectionChange: handleSelectionChange,
        onChangeText: handleChangeText,
        onFocus: handleFocus,
        onBlur: handleBlur,
    };
}

export type {UseDateSegmentInputParams, UseDateSegmentInputResult};
