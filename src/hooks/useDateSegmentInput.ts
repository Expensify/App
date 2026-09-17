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

import {useState} from 'react';

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
    const [isEditing, setIsEditing] = useState(false);

    const {value: editingValue, ranges} = getDateDisplay(segments, mask);
    // A caret parked at the start of the segment reads as three fields sharing one box. Selecting the whole segment
    // instead would highlight it as a block, which is not what the design asks for.
    const activeSegmentStart = ranges[activeSegmentName].start;

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

            if (result.isSegmentComplete) {
                setActiveSegmentName(getAdjacentSegmentName(activeSegmentName, 1));
            }
            return;
        }

        if (isStepKey(key)) {
            event.preventDefault();
            applySegments(stepSegment(segments, activeSegmentName, STEP_KEYS[key]));
            return;
        }

        if (isMoveKey(key)) {
            event.preventDefault();
            setActiveSegmentName(getAdjacentSegmentName(activeSegmentName, MOVE_KEYS[key]));
            return;
        }

        if (key === BACKSPACE_KEY || key === DELETE_KEY) {
            event.preventDefault();
            setSegments(clearSegment(segments, activeSegmentName));
            return;
        }

        if (!isSeparatorKey(key)) {
            return;
        }

        // A separator means the user is finished with this segment even if they only typed one digit into it
        event.preventDefault();
        setActiveSegmentName(getAdjacentSegmentName(activeSegmentName, 1));
    };

    // Clicking into the text lands the caret anywhere, so snap the selection out to whichever segment was clicked
    const handleSelectionChange = (event: TextInputSelectionChangeEvent) => {
        const clickedSegmentName = getSegmentNameAtPosition(event.nativeEvent.selection.start, ranges);
        if (clickedSegmentName === activeSegmentName) {
            return;
        }

        setActiveSegmentName(clickedSegmentName);
    };

    // Every keystroke is prevented, so this only runs for text the user pasted in
    const handleChangeText = (text: string) => {
        const pastedSegments = getSegmentsFromText(text);
        if (!hasAnySegment(pastedSegments)) {
            return;
        }

        applySegments(pastedSegments);
    };

    const handleFocus = () => {
        setSegments(getSegmentsFromISODate(value));
        setActiveSegmentName(FIRST_SEGMENT_NAME);
        setIsEditing(true);
    };

    // An unfinished edit is dropped rather than cleared, so leaving the field restores the last committed date
    const handleBlur = () => {
        setIsEditing(false);
        setSegments(EMPTY_SEGMENTS);
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
        selection: isEditing ? {start: activeSegmentStart, end: activeSegmentStart} : undefined,
        onKeyPress: handleKeyPress,
        onSelectionChange: handleSelectionChange,
        onChangeText: handleChangeText,
        onFocus: handleFocus,
        onBlur: handleBlur,
    };
}

export type {UseDateSegmentInputParams, UseDateSegmentInputResult};
