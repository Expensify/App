/**
 * Helpers for the guided date input, where the year, month and day are edited as separate segments. The segments hold
 * the digits the user has typed rather than a parsed date, so a half finished segment is representable and the
 * display text can be rebuilt from them at any point.
 */
import CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

import {getDaysInMonth, isValid, parse} from 'date-fns';

const DATE_SEGMENT_NAMES = ['year', 'month', 'day'] as const;

const YEAR_LENGTH = 4;
const SEGMENT_LENGTH = 2;

const FIRST_MONTH = 1;
const LAST_MONTH = 12;
const FIRST_DAY = 1;

/** The longest month, used as the day limit until the typed month says otherwise */
const MAX_DAYS_IN_MONTH = 31;

/** A leading month digit above this cannot start a two digit month, so the segment is zero padded and completed early */
const MAX_LEADING_MONTH_DIGIT = 1;

/** A leading day digit above this cannot start a two digit day, so the segment is zero padded and completed early */
const MAX_LEADING_DAY_DIGIT = 3;

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

function getDaysInTypedMonth(segments: DateSegments): number {
    if (segments.month.length !== SEGMENT_LENGTH || segments.year.length !== YEAR_LENGTH) {
        return MAX_DAYS_IN_MONTH;
    }

    return getDaysInMonth(new Date(Number(segments.year), Number(segments.month) - 1));
}

/** Trims a day the newly typed year or month cannot have, so February never keeps a 30th from the month before */
function withDayInMonth(segments: DateSegments): DateSegments {
    if (segments.day.length !== SEGMENT_LENGTH) {
        return segments;
    }

    const daysInMonth = getDaysInTypedMonth(segments);
    return Number(segments.day) > daysInMonth ? {...segments, day: String(daysInMonth).padStart(SEGMENT_LENGTH, '0')} : segments;
}

function getDateDisplay(segments: DateSegments, mask: string): DateDisplay {
    let value = '';
    const ranges: Record<DateSegmentName, DateSegmentRange> = {year: {start: 0, end: 0}, month: {start: 0, end: 0}, day: {start: 0, end: 0}};

    for (const part of getDateMaskParts(mask)) {
        const text = segments[part.name] || part.placeholder;

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

/** The segment `offset` places away, clamped so moving past either end keeps the outermost segment selected */
function getAdjacentSegmentName(name: DateSegmentName, offset: number): DateSegmentName {
    const nextIndex = DATE_SEGMENT_NAMES.indexOf(name) + offset;
    const clampedIndex = Math.min(Math.max(nextIndex, 0), DATE_SEGMENT_NAMES.length - 1);

    return DATE_SEGMENT_NAMES[clampedIndex];
}

/**
 * Adds one typed digit to a segment. A digit that cannot extend what is already there starts the segment over, which
 * is what makes typing over a filled in date feel like overwriting it.
 */
function typeDigitIntoSegment(segments: DateSegments, name: DateSegmentName, digit: string): {segments: DateSegments; isSegmentComplete: boolean} {
    const current = segments[name].length >= getSegmentLength(name) ? '' : segments[name];

    if (name === 'year') {
        // No year we support starts with a zero, so swallow the keystroke rather than start a year that cannot resolve
        if (!current && digit === '0') {
            return {segments, isSegmentComplete: false};
        }

        const year = `${current}${digit}`;
        return {segments: withDayInMonth({...segments, year}), isSegmentComplete: year.length === YEAR_LENGTH};
    }

    const isMonth = name === 'month';
    const maxLeadingDigit = isMonth ? MAX_LEADING_MONTH_DIGIT : MAX_LEADING_DAY_DIGIT;
    const lowest = isMonth ? FIRST_MONTH : FIRST_DAY;
    const highest = isMonth ? LAST_MONTH : getDaysInTypedMonth(segments);

    if (!current) {
        if (Number(digit) > maxLeadingDigit) {
            const padded = `0${digit}`;
            return {segments: withDayInMonth({...segments, [name]: padded}), isSegmentComplete: true};
        }

        return {segments: {...segments, [name]: digit}, isSegmentComplete: false};
    }

    const candidate = Number(`${current}${digit}`);
    if (candidate >= lowest && candidate <= highest) {
        return {segments: withDayInMonth({...segments, [name]: `${current}${digit}`}), isSegmentComplete: true};
    }

    // The two digit number is out of range, so treat the keystroke as the start of a new segment instead
    return typeDigitIntoSegment({...segments, [name]: ''}, name, digit);
}

/** Moves a segment up or down by `offset`, wrapping months and days and starting from today when the segment is empty */
function stepSegment(segments: DateSegments, name: DateSegmentName, offset: number): DateSegments {
    const today = new Date();

    if (name === 'year') {
        const current = segments.year.length === YEAR_LENGTH ? Number(segments.year) : today.getFullYear();
        const year = Math.min(Math.max(current + offset, CONST.CALENDAR_PICKER.MIN_YEAR), CONST.CALENDAR_PICKER.MAX_YEAR);

        return withDayInMonth({...segments, year: String(year)});
    }

    const isMonth = name === 'month';
    const highest = isMonth ? LAST_MONTH : getDaysInTypedMonth(segments);
    const fallback = isMonth ? today.getMonth() + FIRST_MONTH : today.getDate();
    const current = segments[name].length === SEGMENT_LENGTH ? Number(segments[name]) : fallback;
    const stepped = ((current - 1 + offset + highest) % highest) + 1;

    return withDayInMonth({...segments, [name]: String(stepped).padStart(SEGMENT_LENGTH, '0')});
}

function clearSegment(segments: DateSegments, name: DateSegmentName): DateSegments {
    return {...segments, [name]: ''};
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

        filled = typeDigitIntoSegment(filled, name, digit).segments;
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
};
export type {DateSegmentName, DateSegmentRange, DateSegments};
