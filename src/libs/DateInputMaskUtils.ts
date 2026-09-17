/**
 * Helpers for the guided date input, where the year, month and day are edited as separate segments. The segments hold
 * the digits the user has typed rather than a parsed date, so a half finished segment is representable and the
 * display text can be rebuilt from them at any point.
 */
import CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

import {isValid, parse} from 'date-fns';

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

type DateSegmentRange = {
    start: number;
    end: number;
};

type DateMaskPart = {
    name: DateSegmentName;

    /** The mask letters shown while the segment is empty, such as YYYY */
    placeholder: string;

    /** The characters the mask puts after this segment, such as a dash */
    separator: string;
};

type DateDisplay = {
    /** The text to show in the input */
    value: string;

    /** Where each segment sits inside that text, so a segment can be selected as a whole */
    ranges: Record<DateSegmentName, DateSegmentRange>;
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

function getDateDisplay(segments: DateSegments, mask: string): DateDisplay {
    let value = '';
    const ranges: Record<DateSegmentName, DateSegmentRange> = {year: {start: 0, end: 0}, month: {start: 0, end: 0}, day: {start: 0, end: 0}};

    for (const part of getDateMaskParts(mask)) {
        // Typed digits replace the mask letters one at a time, so a half typed year reads as 2YYY rather than 2. This
        // keeps every segment the width of its mask, which is what lets a caret position mean the same thing twice.
        const digits = segments[part.name].slice(0, part.placeholder.length);
        const text = `${digits}${part.placeholder.slice(digits.length)}`;

        ranges[part.name] = {start: value.length, end: value.length + text.length};
        value += `${text}${part.separator}`;
    }

    return {value, ranges};
}

/** Which segment a caret position falls in, so clicking into the text selects the segment that was clicked */
function getSegmentNameAtPosition(position: number, ranges: Record<DateSegmentName, DateSegmentRange>): DateSegmentName {
    const name = DATE_SEGMENT_NAMES.find((segmentName) => position <= ranges[segmentName].end);

    return name ?? DATE_SEGMENT_NAMES[DATE_SEGMENT_NAMES.length - 1];
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

function getNextUnfilledSegmentName(segments: DateSegments): DateSegmentName | undefined {
    return DATE_SEGMENT_NAMES.find((name) => segments[name].length < getSegmentLength(name));
}

/** Fills the segments from arbitrary text, so pasting a date works without going through it a keystroke at a time */
function getSegmentsFromText(text: string): DateSegments {
    const digits = text.replaceAll(NON_DIGIT_REGEX, '');
    let filled = EMPTY_SEGMENTS;

    for (const digit of digits) {
        const name = getNextUnfilledSegmentName(filled);
        if (!name) {
            break;
        }

        filled = typeDigitIntoSegments(filled, name, digit).segments;
    }

    return filled;
}

/** Returns the date in the format the rest of the app stores, or undefined while any segment is still unfinished */
function getISODateFromSegments(segments: DateSegments): string | undefined {
    if (segments.year.length !== YEAR_LENGTH || segments.month.length !== SEGMENT_LENGTH || segments.day.length !== SEGMENT_LENGTH) {
        return undefined;
    }

    const isoDate = `${segments.year}-${segments.month}-${segments.day}`;

    return isValid(parse(isoDate, CONST.DATE.FNS_FORMAT_STRING, new Date())) ? isoDate : undefined;
}

function hasAnySegment(segments: DateSegments): boolean {
    return DATE_SEGMENT_NAMES.some((name) => !!segments[name]);
}

export {
    DATE_SEGMENT_NAMES,
    EMPTY_SEGMENTS,
    getAdjacentSegmentName,
    getDateDisplay,
    getISODateFromSegments,
    getSegmentNameAtPosition,
    getSegmentsFromISODate,
    getSegmentsFromText,
    hasAnySegment,
    removeLastDigit,
    typeDigitIntoSegments,
};
export type {DateSegmentName, DateSegmentRange, DateSegments};
