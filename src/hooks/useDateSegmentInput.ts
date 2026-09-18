/**
 * Drives the guided date input, where the year, month and day are edited in one input each. Every keystroke is handled
 * here and the raw keystroke is prevented, so a segment can only ever hold digits it is allowed to hold.
 *
 * Focus belongs to the browser. Each segment reports its own focus, and this hook only ever asks for a move when a
 * keystroke calls for one, which is why nothing here has to arbitrate against a caret it does not control.
 */
import {
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    getAdjacentSegmentName,
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

import type {TextInputKeyPressEvent} from 'react-native';

import {useState} from 'react';

const LAST_SEGMENT_NAME = DATE_SEGMENT_NAMES[DATE_SEGMENT_NAMES.length - 1];

const BACKSPACE_KEY = 'Backspace';
const DELETE_KEY = 'Delete';
const MOVE_KEYS = {ArrowLeft: -1, ArrowRight: 1} as const;

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

    /** Called with a stored format date once every segment holds a valid value */
    onCommit: (isoDate: string) => void;
};

/** A request for a segment to take focus. The count is what carries it, so asking twice for the same segment works */
type SegmentFocusRequest = {
    name: DateSegmentName;
    version: number;
};

/** Everything one segment's input needs. The segment itself is stateless and reports back through these */
type DateSegmentProps = {
    value: string;
    onKeyPress: (event: TextInputKeyPressEvent) => void;
    onChangeText: (text: string) => void;
    onFocus: () => void;
};

type UseDateSegmentInputResult = {
    /** The committed date, shown while the field is not being edited */
    displayValue: string;

    /** Whether the user is inside the field, so the segments rather than the committed date are what to render */
    isEditing: boolean;

    /** The segment the caller should move focus to, or undefined when no move has been asked for */
    focusRequest: SegmentFocusRequest | undefined;

    /** The month the calendar should show, so it follows the date being typed. Undefined leaves the calendar alone */
    viewDate: Date | undefined;

    /** Counts how many times the input has asked the calendar to follow it, so asking twice for the same month counts twice */
    viewDateVersion: number;

    /** Whether any digit has been typed, so the field is showing more than an untouched mask */
    hasTypedDigits: boolean;

    getSegmentProps: (name: DateSegmentName) => DateSegmentProps;

    /** Called once focus has left the field altogether rather than moved between segments */
    onFieldBlur: () => void;
};

function isMoveKey(key: string): key is keyof typeof MOVE_KEYS {
    return key in MOVE_KEYS;
}

export default function useDateSegmentInput({value, isEnabled, minDate, maxDate, onCommit}: UseDateSegmentInputParams): UseDateSegmentInputResult {
    // The segments only describe an edit in progress, so they are seeded on focus rather than synced with the value
    const [segments, setSegments] = useState<DateSegments>(EMPTY_SEGMENTS);
    const [isEditing, setIsEditing] = useState(false);
    const [focusRequest, setFocusRequest] = useState<SegmentFocusRequest | undefined>(undefined);
    // The month the calendar should show, which follows the typed date once the year is complete
    const [viewDate, setViewDate] = useState<Date | undefined>(undefined);
    const [viewDateVersion, setViewDateVersion] = useState(0);
    // Whether the next digit replaces the segment instead of extending it, set on arriving at a segment
    const [shouldOverwrite, setShouldOverwrite] = useState(false);
    const [appliedValue, setAppliedValue] = useState(value);

    // A date set from outside, by the calendar or by a restored draft, has to reach the segments as well. Without this
    // an edit in progress would keep showing the date it started from, since the segments are what the field renders.
    if (value !== appliedValue) {
        setAppliedValue(value);

        // A date this field has just committed already agrees with the segments, and seeding from it would replace a
        // half typed segment with the padded form it is showing. The next digit would then start the segment over.
        if (isEditing && value !== getISODateFromSegments(segments)) {
            setSegments(getSegmentsFromISODate(value));
        }
    }

    const requestFocus = (name: DateSegmentName) => {
        setFocusRequest((previous) => ({name, version: (previous?.version ?? 0) + 1}));
    };

    /** Landing on a segment arms the overwrite, so the next digit replaces what is there rather than extending it */
    const enterSegment = (name: DateSegmentName) => {
        setShouldOverwrite(true);
        requestFocus(name);
    };

    const commitIfComplete = (newSegments: DateSegments) => {
        const isoDate = getISODateFromSegments(newSegments);
        if (!isoDate) {
            return;
        }

        onCommit(isoDate);
    };

    /**
     * Asks the calendar to follow the input. The count is what carries the request, since the user can have moved the
     * calendar elsewhere with its arrows or its month picker and then typed the month it was already showing.
     */
    const assertViewDate = (nextViewDate: Date | undefined) => {
        if (!nextViewDate) {
            return;
        }

        setViewDate(nextViewDate);
        setViewDateVersion((version) => version + 1);
    };

    /**
     * The one place segments are written, so the calendar cannot fall out of step with them. The month already on
     * screen is the fallback while the typed month is unfinished, which keeps the calendar where the user left it.
     */
    const applySegments = (newSegments: DateSegments) => {
        setSegments(newSegments);
        assertViewDate(getViewDateFromSegments(newSegments, (viewDate ?? new Date()).getMonth(), minDate, maxDate));
        commitIfComplete(newSegments);
    };

    const handleKeyPress = (name: DateSegmentName, event: TextInputKeyPressEvent) => {
        const key = event.nativeEvent.key;

        if (isNumeric(key)) {
            event.preventDefault();
            const result = typeDigitIntoSegments(segments, name, key, shouldOverwrite);
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

        if (key === BACKSPACE_KEY || key === DELETE_KEY) {
            event.preventDefault();
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
    const handleChangeText = (text: string) => {
        const pastedSegments = getSegmentsFromText(text);
        if (!hasAnySegment(pastedSegments)) {
            return;
        }

        applySegments(pastedSegments);
        enterSegment(LAST_SEGMENT_NAME);
    };

    /**
     * A segment reporting that it now holds focus, whether the user clicked it or a keystroke sent them there. Arriving
     * at a segment always arms the overwrite, so the first digit replaces what is already in it.
     */
    const handleSegmentFocus = () => {
        setShouldOverwrite(true);

        if (isEditing) {
            return;
        }

        const seededSegments = getSegmentsFromISODate(value);
        setSegments(seededSegments);
        assertViewDate(getViewDateFromSegments(seededSegments, new Date().getMonth(), minDate, maxDate));
        setIsEditing(true);
    };

    // An unfinished edit is dropped rather than cleared, so leaving the field restores the last committed date
    const handleFieldBlur = () => {
        setIsEditing(false);
        setSegments(EMPTY_SEGMENTS);
        setViewDate(undefined);
        setFocusRequest(undefined);
        setShouldOverwrite(false);
    };

    if (!isEnabled) {
        return {
            displayValue: value,
            isEditing: false,
            focusRequest: undefined,
            viewDate: undefined,
            viewDateVersion: 0,
            hasTypedDigits: false,
            getSegmentProps: () => ({value: '', onKeyPress: () => {}, onChangeText: () => {}, onFocus: () => {}}),
            onFieldBlur: () => {},
        };
    }

    // The segments describe an edit in progress, so outside of one the committed date is what the field has to show
    const displayedSegments = isEditing ? segments : getSegmentsFromISODate(value);

    return {
        displayValue: value,
        isEditing,
        focusRequest,
        viewDate: isEditing ? viewDate : undefined,
        viewDateVersion,
        hasTypedDigits: isEditing && hasAnySegment(segments),
        getSegmentProps: (name: DateSegmentName) => ({
            value: getSegmentDisplay(displayedSegments, name),
            onKeyPress: (event: TextInputKeyPressEvent) => handleKeyPress(name, event),
            onChangeText: handleChangeText,
            onFocus: handleSegmentFocus,
        }),
        onFieldBlur: handleFieldBlur,
    };
}

export type {UseDateSegmentInputParams, UseDateSegmentInputResult};
