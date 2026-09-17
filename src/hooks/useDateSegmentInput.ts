/**
 * Drives the guided date input, where the year, month and day are selected and edited one segment at a time. Every
 * keystroke is handled here and the raw keystroke is prevented, so the field can only ever hold a date shaped value.
 */
import {
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    clearSegment,
    getAdjacentSegmentName,
    getDateDisplay,
    getISODateFromSegments,
    getSegmentNameAtPosition,
    getSegmentsFromISODate,
    getSegmentsFromText,
    hasAnySegment,
    stepSegment,
    typeDigitIntoSegment,
} from '@libs/DateInputMaskUtils';
import type {DateSegmentName, DateSegmentRange, DateSegments} from '@libs/DateInputMaskUtils';
import {isNumeric} from '@libs/ValidationUtils';

import type {TextInputKeyPressEvent, TextInputSelectionChangeEvent} from 'react-native';

import {useRef, useState} from 'react';

const FIRST_SEGMENT_NAME = DATE_SEGMENT_NAMES[0];

const BACKSPACE_KEY = 'Backspace';
const DELETE_KEY = 'Delete';
const STEP_KEYS = {ArrowUp: 1, ArrowDown: -1} as const;
const MOVE_KEYS = {ArrowLeft: -1, ArrowRight: 1} as const;

type UseDateSegmentInputParams = {
    /** The committed date in the format the app stores, shown whenever the field is not being edited */
    value: string;

    /** The localized mask, such as YYYY-MM-DD, which decides the segment order and the text shown for empty segments */
    mask: string;

    /** Whether this platform lets the user type a date at all */
    isEnabled: boolean;

    /** Called with a stored format date once every segment holds a valid value */
    onCommit: (isoDate: string) => void;
};

type UseDateSegmentInputResult = {
    /** The text to render in the input */
    displayValue: string;

    /** The range covering the segment being edited, which selects it as a whole */
    selection: DateSegmentRange | undefined;

    onKeyPress: (event: TextInputKeyPressEvent) => void;
    onSelectionChange: (event: TextInputSelectionChangeEvent) => void;
    onChangeText: (text: string) => void;
    onFocus: () => void;
    onBlur: () => void;
};

function isStepKey(key: string): key is keyof typeof STEP_KEYS {
    return key in STEP_KEYS;
}

function isMoveKey(key: string): key is keyof typeof MOVE_KEYS {
    return key in MOVE_KEYS;
}

/** Whether the key is a single character that is not a digit, such as a dash the user types to leave a segment */
function isSeparatorKey(key: string): boolean {
    return key.length === 1 && !isNumeric(key);
}

export default function useDateSegmentInput({value, mask, isEnabled, onCommit}: UseDateSegmentInputParams): UseDateSegmentInputResult {
    // The segments only describe an edit in progress, so they are seeded on focus rather than synced with the value
    const [segments, setSegments] = useState<DateSegments>(EMPTY_SEGMENTS);
    const [activeSegmentName, setActiveSegmentName] = useState<DateSegmentName>(FIRST_SEGMENT_NAME);
    const [caretOffset, setCaretOffset] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    // Re-rendering with a new value makes the browser report a caret of its own choosing. Honouring that would drag
    // the active segment around, so the first report after a keystroke is discarded as an echo of our own update.
    const hasPendingCaretEchoRef = useRef(false);

    const {value: editingValue, ranges} = getDateDisplay(segments, mask);
    const activeRange = ranges[activeSegmentName];
    // A caret parked on a digit place reads as three fields sharing one box. Selecting the whole segment instead would
    // highlight it as a block, which is not what the design asks for.
    const caretPosition = activeRange.start + caretOffset;

    /**
     * A caret may rest on any digit place already typed, or just after the last of them, but never out on a mask
     * letter. An empty segment therefore only ever has its start, which is what stops a click landing on a bare Y.
     */
    const getFurthestOffset = (name: DateSegmentName, currentSegments: DateSegments) => currentSegments[name].length;

    const moveCaret = (name: DateSegmentName, offset: number, nextSegments: DateSegments = segments) => {
        hasPendingCaretEchoRef.current = true;
        setActiveSegmentName(name);
        setCaretOffset(Math.min(Math.max(offset, 0), getFurthestOffset(name, nextSegments)));
    };

    const commitIfComplete = (newSegments: DateSegments) => {
        const isoDate = getISODateFromSegments(newSegments);
        if (!isoDate) {
            return;
        }

        onCommit(isoDate);
    };

    const applySegments = (newSegments: DateSegments) => {
        setSegments(newSegments);
        commitIfComplete(newSegments);
    };

    const handleKeyPress = (event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;

        if (isNumeric(key)) {
            event.preventDefault();
            const result = typeDigitIntoSegment(segments, activeSegmentName, key);
            applySegments(result.segments);

            // A completed segment hands over to its neighbour. The last one has nowhere to hand over to, so the caret
            // rests after the digit just typed and the next digit overwrites the segment.
            const nextSegmentName = result.isSegmentComplete ? getAdjacentSegmentName(activeSegmentName, 1) : activeSegmentName;
            const nextOffset = nextSegmentName === activeSegmentName ? result.segments[activeSegmentName].length : 0;

            moveCaret(nextSegmentName, nextOffset, result.segments);
            return;
        }

        if (isStepKey(key)) {
            event.preventDefault();
            const steppedSegments = stepSegment(segments, activeSegmentName, STEP_KEYS[key]);
            applySegments(steppedSegments);
            moveCaret(activeSegmentName, caretOffset, steppedSegments);
            return;
        }

        if (isMoveKey(key)) {
            event.preventDefault();
            const step = MOVE_KEYS[key];
            const nextOffset = caretOffset + step;

            // Stepping past either end of what has been typed carries on into the neighbouring segment.
            if (nextOffset >= 0 && nextOffset <= getFurthestOffset(activeSegmentName, segments)) {
                moveCaret(activeSegmentName, nextOffset);
                return;
            }

            const adjacentSegmentName = getAdjacentSegmentName(activeSegmentName, step);
            if (adjacentSegmentName === activeSegmentName) {
                return;
            }

            moveCaret(adjacentSegmentName, step > 0 ? 0 : getFurthestOffset(adjacentSegmentName, segments));
            return;
        }

        if (key === BACKSPACE_KEY || key === DELETE_KEY) {
            event.preventDefault();
            setSegments(clearSegment(segments, activeSegmentName));
            moveCaret(activeSegmentName, 0);
            return;
        }

        if (!isSeparatorKey(key)) {
            return;
        }

        // A separator means the user is finished with this segment even if they only typed one digit into it
        event.preventDefault();
        moveCaret(getAdjacentSegmentName(activeSegmentName, 1), 0);
    };

    // Clicking into the text lands the caret anywhere, so snap it onto the digit place that was clicked
    const handleSelectionChange = (event: TextInputSelectionChangeEvent) => {
        if (hasPendingCaretEchoRef.current) {
            hasPendingCaretEchoRef.current = false;
            return;
        }

        const position = event.nativeEvent.selection.start;
        const clickedSegmentName = getSegmentNameAtPosition(position, ranges);
        const clickedOffset = position - ranges[clickedSegmentName].start;

        moveCaret(clickedSegmentName, clickedOffset);
    };

    // Every keystroke is prevented, so this only runs for text the user pasted in
    const handleChangeText = (text: string) => {
        const pastedSegments = getSegmentsFromText(text);
        if (!hasAnySegment(pastedSegments)) {
            return;
        }

        applySegments(pastedSegments);
        moveCaret(FIRST_SEGMENT_NAME, 0);
    };

    const handleFocus = () => {
        setSegments(getSegmentsFromISODate(value));
        moveCaret(FIRST_SEGMENT_NAME, 0);
        setIsEditing(true);
    };

    // An unfinished edit is dropped rather than cleared, so leaving the field restores the last committed date
    const handleBlur = () => {
        setIsEditing(false);
        setSegments(EMPTY_SEGMENTS);
        setCaretOffset(0);
    };

    if (!isEnabled) {
        return {
            displayValue: value,
            selection: undefined,
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
        onKeyPress: handleKeyPress,
        onSelectionChange: handleSelectionChange,
        onChangeText: handleChangeText,
        onFocus: handleFocus,
        onBlur: handleBlur,
    };
}

export type {UseDateSegmentInputParams, UseDateSegmentInputResult};
