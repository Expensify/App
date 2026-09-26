/**
 * Helpers for the guided date input, where the year, month and day are edited as separate segments. The segments hold
 * the digits the user has typed rather than a parsed date, so a half finished segment is representable and the
 * display text can be rebuilt from them at any point.
 */
import CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

import {endOfMonth, isValid, parse} from 'date-fns';

const DATE_SEGMENT_NAMES = ['year', 'month', 'day'] as const;

const YEAR_LENGTH = 4;
const SEGMENT_LENGTH = 2;

const FIRST_MONTH = 1;

/**
 * The highest a segment may read, and the highest its leading digit may be while still allowing a second one. The day
 * is capped at the longest month rather than the one that has been typed, so an impossible date such as the 31st of
 * February can be entered and is then rejected by validation, rather than being silently corrected mid-keystroke.
 */
const SEGMENT_LIMITS = {
    month: {max: 12, maxLeadingDigit: 1},
    day: {max: 31, maxLeadingDigit: 3},
} as const;

/** Mask characters standing in for a digit are letters, so anything else is a separator to copy through verbatim */
const MASK_LETTER_REGEX = /\p{L}/u;

const NON_DIGIT_REGEX = /\D/g;

type DateSegmentName = TupleToUnion<typeof DATE_SEGMENT_NAMES>;

/** The digits typed into each segment, empty when the segment has not been filled in yet */
type DateSegments = Record<DateSegmentName, string>;

type DateMaskPart = {
    name: DateSegmentName;

    /** The mask letters shown while the segment is empty, such as YYYY */
    placeholder: string;

    /** The characters the mask puts after this segment, such as a dash */
    separator: string;
};

const EMPTY_SEGMENTS: DateSegments = {year: '', month: '', day: ''};

function isMaskLetter(character: string): boolean {
    return MASK_LETTER_REGEX.test(character);
}

/**
 * Reads the localized mask into one part per segment. Every locale writes the segments in year, month, day order, so
 * the runs of letters are matched to the segments by position.
 */
function getDateMaskParts(mask: string): DateMaskPart[] {
    const parts: DateMaskPart[] = [];
    let index = 0;

    while (index < mask.length && parts.length < DATE_SEGMENT_NAMES.length) {
        let placeholder = '';
        while (index < mask.length && isMaskLetter(mask.charAt(index))) {
            placeholder += mask.charAt(index);
            index++;
        }

        if (!placeholder) {
            break;
        }

        let separator = '';
        while (index < mask.length && !isMaskLetter(mask.charAt(index))) {
            separator += mask.charAt(index);
            index++;
        }

        parts.push({name: DATE_SEGMENT_NAMES[parts.length], placeholder, separator});
    }

    return parts;
}

function getSegmentLength(name: DateSegmentName): number {
    return name === 'year' ? YEAR_LENGTH : SEGMENT_LENGTH;
}

/**
 * Whether a segment reads as a zero padded number, which the two digit ones do and the year does not. Their digits
 * therefore sit at the end of the segment, so a single typed digit shows as 02 rather than 2 followed by a mask letter.
 */
function isZeroPaddedSegment(name: DateSegmentName): name is keyof typeof SEGMENT_LIMITS {
    return name in SEGMENT_LIMITS;
}

/**
 * The text one segment shows. A zero padded segment fills from the right, so a day part way through reads as 02 and
 * becomes 23 on the next digit. An empty segment renders nothing and lets its own placeholder show through.
 */
function getSegmentDisplay(segments: DateSegments, name: DateSegmentName): string {
    const digits = segments[name].slice(0, getSegmentLength(name));

    if (!digits) {
        return '';
    }

    return isZeroPaddedSegment(name) ? digits.padStart(getSegmentLength(name), '0') : digits;
}

/** The segment that follows this one, or undefined for the last one, which has nowhere to hand a finished value on to */
function getFollowingSegmentName(name: DateSegmentName): DateSegmentName | undefined {
    return DATE_SEGMENT_NAMES.at(DATE_SEGMENT_NAMES.indexOf(name) + 1);
}

/** The segment `offset` places away, clamped so moving past either end keeps the outermost segment selected */
function getAdjacentSegmentName(name: DateSegmentName, offset: number): DateSegmentName {
    const nextIndex = DATE_SEGMENT_NAMES.indexOf(name) + offset;
    const clampedIndex = Math.min(Math.max(nextIndex, 0), DATE_SEGMENT_NAMES.length - 1);

    return DATE_SEGMENT_NAMES[clampedIndex];
}

type SegmentDigitResult = {
    /** What the segment now reads */
    value: string;

    /** Whether the segment is finished with, so the caret belongs in the next one */
    shouldAdvance: boolean;

    /** A digit this segment could not take, which the next one receives instead */
    carry?: string;
};

/**
 * Adds one typed digit to a single segment, without knowing about the others. A digit that cannot extend what is
 * already there is handed on rather than dropped, so typing 1 then 3 into the month reads as January and starts the
 * day off with the 3.
 */
function typeDigitIntoOneSegment(name: DateSegmentName, typedSoFar: string, digit: string): SegmentDigitResult {
    const current = typedSoFar.length >= getSegmentLength(name) ? '' : typedSoFar;

    if (name === 'year') {
        const year = `${current}${digit}`.slice(0, YEAR_LENGTH);

        return {value: year, shouldAdvance: year.length === YEAR_LENGTH};
    }

    const limits = SEGMENT_LIMITS[name];

    if (current.length === 1) {
        const combined = `${current}${digit}`;
        const combinedNumber = Number(combined);

        if (combinedNumber >= FIRST_MONTH && combinedNumber <= limits.max) {
            return {value: combined, shouldAdvance: true};
        }

        // Finishing the segment early only works while what it already holds can stand on its own. A leading zero
        // cannot, so the keystroke is dropped and the segment keeps waiting for a digit that completes it.
        if (Number(current) < FIRST_MONTH) {
            return {value: current, shouldAdvance: false};
        }

        return {value: current.padStart(SEGMENT_LENGTH, '0'), shouldAdvance: true, carry: digit};
    }

    // A leading digit this high cannot start a two digit number, so the segment is zero padded and finished early
    if (digit !== '0' && Number(digit) > limits.maxLeadingDigit) {
        return {value: digit.padStart(SEGMENT_LENGTH, '0'), shouldAdvance: true};
    }

    return {value: digit, shouldAdvance: false};
}

/**
 * Adds one typed digit, following a carried digit into the following segments for as long as they keep handing one on.
 * `nextSegmentName` is where the caret belongs afterwards, and is undefined while the segment is unfinished.
 */
function typeDigitIntoSegments(
    segments: DateSegments,
    name: DateSegmentName,
    digit: string,
    shouldOverwrite = false,
): {segments: DateSegments; nextSegmentName: DateSegmentName | undefined} {
    const filled = {...segments};
    let currentName = name;
    let typedSoFar = shouldOverwrite ? '' : segments[name];
    let currentDigit = digit;
    let nextSegmentName: DateSegmentName | undefined;

    for (;;) {
        const result = typeDigitIntoOneSegment(currentName, typedSoFar, currentDigit);
        filled[currentName] = result.value;

        const followingName = getFollowingSegmentName(currentName);
        if (!result.shouldAdvance || !followingName) {
            break;
        }

        nextSegmentName = followingName;
        if (!result.carry) {
            break;
        }

        currentName = followingName;
        typedSoFar = '';
        currentDigit = result.carry;
    }

    return {segments: filled, nextSegmentName};
}

/**
 * Which month the calendar should show for the date being typed, or undefined when there is nowhere useful to go and
 * the calendar should stay where it is. A month only counts once both its digits read as a real month, so the calendar
 * does not lurch to January while the user is still on the first digit.
 *
 * A month outside the allowed range is refused rather than clamped. Every year is out of range while it is being
 * typed, since 1985 passes through 1, 19 and 198, and clamping those would drag the calendar to the limit and back on
 * every keystroke.
 */
function getViewDateFromSegments(segments: DateSegments, fallbackMonthIndex: number, minDate: Date, maxDate: Date): Date | undefined {
    if (segments.year.length !== YEAR_LENGTH) {
        return undefined;
    }

    const monthNumber = Number(segments.month);
    const hasMonth = segments.month.length === SEGMENT_LENGTH && monthNumber >= FIRST_MONTH && monthNumber <= SEGMENT_LIMITS.month.max;
    const viewDate = new Date(Number(segments.year), hasMonth ? monthNumber - 1 : fallbackMonthIndex, 1);

    // A month holding no selectable day at all is not worth moving to
    return endOfMonth(viewDate) < minDate || viewDate > maxDate ? undefined : viewDate;
}

/** Drops the last digit of a segment. Returns undefined when there was nothing left to drop */
function removeLastDigit(segments: DateSegments, name: DateSegmentName): DateSegments | undefined {
    if (!segments[name]) {
        return undefined;
    }

    return {...segments, [name]: segments[name].slice(0, -1)};
}

function getSegmentsFromISODate(value: string | undefined): DateSegments {
    if (!value || !isValid(parse(value, CONST.DATE.FNS_FORMAT_STRING, new Date()))) {
        return EMPTY_SEGMENTS;
    }

    const digits = value.replaceAll(NON_DIGIT_REGEX, '');

    return {
        year: digits.slice(0, YEAR_LENGTH),
        month: digits.slice(YEAR_LENGTH, YEAR_LENGTH + SEGMENT_LENGTH),
        day: digits.slice(YEAR_LENGTH + SEGMENT_LENGTH),
    };
}

/** The first segment still short of its digits, which is where a click on the field rather than on a segment lands */
function getFirstUnfilledSegmentName(segments: DateSegments): DateSegmentName | undefined {
    return DATE_SEGMENT_NAMES.find((name) => segments[name].length < getSegmentLength(name));
}

/** Fills the segments from arbitrary text, so pasting a date works without going through it a keystroke at a time */
function getSegmentsFromText(text: string): DateSegments {
    const digits = text.replaceAll(NON_DIGIT_REGEX, '');
    let filled = EMPTY_SEGMENTS;

    for (const digit of digits) {
        const name = getFirstUnfilledSegmentName(filled);
        if (!name) {
            break;
        }

        filled = typeDigitIntoSegments(filled, name, digit).segments;
    }

    return filled;
}

/**
 * Returns the date in the format the rest of the app stores, or undefined while a segment is empty or reads as an
 * impossible date.
 *
 * A zero padded segment counts from one digit, since that is already what it shows. A day of 3 therefore reads as the
 * third rather than waiting to find out whether it was going to be the 30th, and typing that second digit revises it.
 */
function getISODateFromSegments(segments: DateSegments): string | undefined {
    if (segments.year.length !== YEAR_LENGTH || !segments.month || !segments.day) {
        return undefined;
    }

    const isoDate = `${segments.year}-${getSegmentDisplay(segments, 'month')}-${getSegmentDisplay(segments, 'day')}`;

    return isValid(parse(isoDate, CONST.DATE.FNS_FORMAT_STRING, new Date())) ? isoDate : undefined;
}

function hasAnySegment(segments: DateSegments): boolean {
    return DATE_SEGMENT_NAMES.some((name) => !!segments[name]);
}

export {
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    getAdjacentSegmentName,
    getDateMaskParts,
    getFirstUnfilledSegmentName,
    getISODateFromSegments,
    getSegmentDisplay,
    getSegmentsFromISODate,
    getSegmentsFromText,
    getViewDateFromSegments,
    hasAnySegment,
    removeLastDigit,
    typeDigitIntoSegments,
};
export type {DateSegmentName, DateSegments};
