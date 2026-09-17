import {
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
import type {DateSegments} from '@libs/DateInputMaskUtils';

const MASK = 'YYYY-MM-DD';
const EMPTY: DateSegments = {year: '', month: '', day: ''};

function segments(year: string, month: string, day: string): DateSegments {
    return {year, month, day};
}

describe('DateInputMaskUtils', () => {
    describe('typeDigitIntoSegment', () => {
        it('rejects a leading zero in the year', () => {
            expect(typeDigitIntoSegment(EMPTY, 'year', '0')).toEqual({segments: EMPTY, isSegmentComplete: false});
        });

        it('completes the year on the fourth digit', () => {
            expect(typeDigitIntoSegment(segments('202', '', ''), 'year', '6')).toEqual({segments: segments('2026', '', ''), isSegmentComplete: true});
            expect(typeDigitIntoSegment(segments('20', '', ''), 'year', '2')).toEqual({segments: segments('202', '', ''), isSegmentComplete: false});
        });

        it('starts the year over when it is already full', () => {
            expect(typeDigitIntoSegment(segments('2026', '', ''), 'year', '1')).toEqual({segments: segments('1', '', ''), isSegmentComplete: false});
        });

        it('zero pads a month that cannot start a two digit month', () => {
            expect(typeDigitIntoSegment(segments('2026', '', ''), 'month', '9')).toEqual({segments: segments('2026', '09', ''), isSegmentComplete: true});
        });

        it('waits for a second digit when the month could still be a teen month', () => {
            expect(typeDigitIntoSegment(segments('2026', '', ''), 'month', '1')).toEqual({segments: segments('2026', '1', ''), isSegmentComplete: false});
            expect(typeDigitIntoSegment(segments('2026', '1', ''), 'month', '2')).toEqual({segments: segments('2026', '12', ''), isSegmentComplete: true});
        });

        it('restarts the month when the two digit number is out of range', () => {
            expect(typeDigitIntoSegment(segments('2026', '1', ''), 'month', '3')).toEqual({segments: segments('2026', '03', ''), isSegmentComplete: true});
            expect(typeDigitIntoSegment(segments('2026', '0', ''), 'month', '0')).toEqual({segments: segments('2026', '0', ''), isSegmentComplete: false});
        });

        it('limits the day to the typed month', () => {
            expect(typeDigitIntoSegment(segments('2026', '01', '3'), 'day', '1')).toEqual({segments: segments('2026', '01', '31'), isSegmentComplete: true});

            // February has no 31st, so the keystroke starts the day over instead
            expect(typeDigitIntoSegment(segments('2026', '02', '3'), 'day', '1')).toEqual({segments: segments('2026', '02', '1'), isSegmentComplete: false});
        });

        it('allows February 29 in a leap year only', () => {
            expect(typeDigitIntoSegment(segments('2024', '02', '2'), 'day', '9')).toEqual({segments: segments('2024', '02', '29'), isSegmentComplete: true});
            expect(typeDigitIntoSegment(segments('2026', '02', '2'), 'day', '9')).toEqual({segments: segments('2026', '02', '09'), isSegmentComplete: true});
        });

        it('allows any day up to 31 before the month is known', () => {
            expect(typeDigitIntoSegment(segments('', '', '3'), 'day', '1')).toEqual({segments: segments('', '', '31'), isSegmentComplete: true});
        });

        it('trims a day the newly typed month cannot have', () => {
            expect(typeDigitIntoSegment(segments('2026', '1', '31'), 'month', '1').segments).toEqual(segments('2026', '11', '30'));
        });

        it('trims a day the newly typed year cannot have', () => {
            expect(typeDigitIntoSegment(segments('202', '02', '29'), 'year', '6').segments).toEqual(segments('2026', '02', '28'));
        });
    });

    describe('stepSegment', () => {
        it('wraps the month at both ends', () => {
            expect(stepSegment(segments('2026', '12', ''), 'month', 1)).toEqual(segments('2026', '01', ''));
            expect(stepSegment(segments('2026', '01', ''), 'month', -1)).toEqual(segments('2026', '12', ''));
        });

        it('wraps the day within the typed month', () => {
            expect(stepSegment(segments('2026', '02', '28'), 'day', 1)).toEqual(segments('2026', '02', '01'));
        });

        it('steps the year without wrapping', () => {
            expect(stepSegment(segments('2026', '', ''), 'year', 1)).toEqual(segments('2027', '', ''));
        });

        it('trims the day when stepping into a shorter month', () => {
            expect(stepSegment(segments('2026', '01', '31'), 'month', 1)).toEqual(segments('2026', '02', '28'));
        });
    });

    describe('getDateDisplay', () => {
        it('shows the mask while every segment is empty', () => {
            expect(getDateDisplay(EMPTY, MASK).value).toBe(MASK);
        });

        it('keeps the mask for the segments still to be filled in', () => {
            expect(getDateDisplay(segments('2026', '', ''), MASK).value).toBe('2026-MM-DD');
            expect(getDateDisplay(segments('2026', '09', ''), MASK).value).toBe('2026-09-DD');
            expect(getDateDisplay(segments('2026', '09', '18'), MASK).value).toBe('2026-09-18');
        });

        it('keeps the mask letters of the digit places a half typed segment has not reached', () => {
            expect(getDateDisplay(segments('2', '', ''), MASK).value).toBe('2YYY-MM-DD');
            expect(getDateDisplay(segments('20', '', ''), MASK).value).toBe('20YY-MM-DD');
            expect(getDateDisplay(segments('2026', '1', ''), MASK).value).toBe('2026-1M-DD');
        });

        it('reports where each segment sits in the text', () => {
            expect(getDateDisplay(segments('2026', '09', '18'), MASK).ranges).toEqual({
                year: {start: 0, end: 4},
                month: {start: 5, end: 7},
                day: {start: 8, end: 10},
            });
        });

        it('holds the ranges still while a segment is half typed, so a caret position keeps its meaning', () => {
            const {ranges} = getDateDisplay(segments('2026', '1', ''), MASK);

            expect(ranges.month).toEqual({start: 5, end: 7});
            expect(ranges.day).toEqual({start: 8, end: 10});
        });

        it('uses the letters and separators of the localized mask', () => {
            expect(getDateDisplay(segments('2026', '', ''), 'AAAA-MM-JJ').value).toBe('2026-MM-JJ');
        });
    });

    describe('getSegmentNameAtPosition', () => {
        const {ranges} = getDateDisplay(segments('2026', '09', '18'), MASK);

        it('maps a position to the segment that covers it', () => {
            expect(getSegmentNameAtPosition(0, ranges)).toBe('year');
            expect(getSegmentNameAtPosition(4, ranges)).toBe('year');
            expect(getSegmentNameAtPosition(6, ranges)).toBe('month');
            expect(getSegmentNameAtPosition(9, ranges)).toBe('day');
        });

        it('falls back to the last segment past the end of the text', () => {
            expect(getSegmentNameAtPosition(99, ranges)).toBe('day');
        });
    });

    describe('getAdjacentSegmentName', () => {
        it('moves between segments', () => {
            expect(getAdjacentSegmentName('year', 1)).toBe('month');
            expect(getAdjacentSegmentName('month', -1)).toBe('year');
        });

        it('stays on the outermost segment rather than wrapping', () => {
            expect(getAdjacentSegmentName('year', -1)).toBe('year');
            expect(getAdjacentSegmentName('day', 1)).toBe('day');
        });
    });

    describe('getSegmentsFromText', () => {
        it('fills the segments from a pasted date', () => {
            expect(getSegmentsFromText('2026-09-18')).toEqual(segments('2026', '09', '18'));
            expect(getSegmentsFromText('20260918')).toEqual(segments('2026', '09', '18'));
        });

        it('stops once every segment is full', () => {
            expect(getSegmentsFromText('20260918123')).toEqual(segments('2026', '09', '18'));
        });

        it('fills what it can from a partial date', () => {
            expect(getSegmentsFromText('2026-09')).toEqual(segments('2026', '09', ''));
            expect(getSegmentsFromText('')).toEqual(EMPTY);
        });
    });

    describe('getISODateFromSegments', () => {
        it('returns the stored format once every segment is filled in', () => {
            expect(getISODateFromSegments(segments('2026', '09', '18'))).toBe('2026-09-18');
        });

        it('returns undefined while a segment is unfinished', () => {
            expect(getISODateFromSegments(segments('2026', '9', '18'))).toBeUndefined();
            expect(getISODateFromSegments(segments('202', '09', '18'))).toBeUndefined();
            expect(getISODateFromSegments(EMPTY)).toBeUndefined();
        });
    });

    describe('getSegmentsFromISODate', () => {
        it('reads back a stored date', () => {
            expect(getSegmentsFromISODate('2026-09-18')).toEqual(segments('2026', '09', '18'));
        });

        it('returns empty segments for a value it cannot parse', () => {
            expect(getSegmentsFromISODate('')).toEqual(EMPTY);
            expect(getSegmentsFromISODate(undefined)).toEqual(EMPTY);
            expect(getSegmentsFromISODate('not a date')).toEqual(EMPTY);
        });
    });

    describe('clearSegment', () => {
        it('empties only the named segment', () => {
            expect(clearSegment(segments('2026', '09', '18'), 'month')).toEqual(segments('2026', '', '18'));
        });
    });

    describe('hasAnySegment', () => {
        it('reports whether anything has been filled in', () => {
            expect(hasAnySegment(EMPTY)).toBe(false);
            expect(hasAnySegment(segments('', '09', ''))).toBe(true);
        });
    });
});
