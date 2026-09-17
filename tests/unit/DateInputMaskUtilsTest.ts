import {
    getAdjacentSegmentName,
    getDateDisplay,
    getISODateFromSegments,
    getSegmentNameAtPosition,
    getSegmentsFromISODate,
    getSegmentsFromText,
    getViewDateFromSegments,
    hasAnySegment,
    removeLastDigit,
    typeDigitIntoSegments,
} from '@libs/DateInputMaskUtils';
import type {DateSegments} from '@libs/DateInputMaskUtils';

const MASK = 'YYYY-MM-DD';
const EMPTY: DateSegments = {year: '', month: '', day: ''};

function segments(year: string, month: string, day: string): DateSegments {
    return {year, month, day};
}

describe('DateInputMaskUtils', () => {
    describe('typeDigitIntoSegments', () => {
        it('completes the year on the fourth digit', () => {
            expect(typeDigitIntoSegments(segments('202', '', ''), 'year', '6')).toEqual({segments: segments('2026', '', ''), nextSegmentName: 'month'});
            expect(typeDigitIntoSegments(segments('20', '', ''), 'year', '2')).toEqual({segments: segments('202', '', ''), nextSegmentName: undefined});
        });

        it('takes a leading zero in the year, which only validation can reject', () => {
            expect(typeDigitIntoSegments(EMPTY, 'year', '0')).toEqual({segments: segments('0', '', ''), nextSegmentName: undefined});
        });

        it('starts the year over when it is already full', () => {
            expect(typeDigitIntoSegments(segments('2026', '', ''), 'year', '1')).toEqual({segments: segments('1', '', ''), nextSegmentName: undefined});
        });

        it('replaces the segment rather than extending it when told to overwrite', () => {
            expect(typeDigitIntoSegments(segments('202', '', ''), 'year', '9', true)).toEqual({segments: segments('9', '', ''), nextSegmentName: undefined});
        });

        it('zero pads a month that cannot start a two digit month', () => {
            expect(typeDigitIntoSegments(segments('2026', '', ''), 'month', '9')).toEqual({segments: segments('2026', '09', ''), nextSegmentName: 'day'});
        });

        it('waits for a second digit when the month could still be a teen month', () => {
            expect(typeDigitIntoSegments(segments('2026', '', ''), 'month', '1')).toEqual({segments: segments('2026', '1', ''), nextSegmentName: undefined});
            expect(typeDigitIntoSegments(segments('2026', '1', ''), 'month', '2')).toEqual({segments: segments('2026', '12', ''), nextSegmentName: 'day'});
        });

        it('carries a digit the month cannot take into the day', () => {
            expect(typeDigitIntoSegments(segments('2026', '1', ''), 'month', '3')).toEqual({segments: segments('2026', '01', '3'), nextSegmentName: 'day'});
        });

        it('waits on a zero rather than padding it, since 0 is not a month', () => {
            expect(typeDigitIntoSegments(segments('2026', '0', ''), 'month', '0')).toEqual({segments: segments('2026', '0', ''), nextSegmentName: undefined});
        });

        it('caps the day at the longest month rather than the one that was typed', () => {
            expect(typeDigitIntoSegments(segments('2026', '01', '3'), 'day', '1')).toEqual({segments: segments('2026', '01', '31'), nextSegmentName: undefined});

            // February has no 31st, but the field takes it and validation is what rejects the date
            expect(typeDigitIntoSegments(segments('2026', '02', '3'), 'day', '1')).toEqual({segments: segments('2026', '02', '31'), nextSegmentName: undefined});
        });

        it('keeps a day the newly typed month cannot have, leaving it to validation', () => {
            expect(typeDigitIntoSegments(segments('2026', '1', '31'), 'month', '1').segments).toEqual(segments('2026', '11', '31'));
        });

        it('has nothing to carry into past the day, so a rejected pair restarts it', () => {
            expect(typeDigitIntoSegments(segments('2026', '09', '3'), 'day', '9')).toEqual({segments: segments('2026', '09', '03'), nextSegmentName: undefined});
        });
    });

    describe('getViewDateFromSegments', () => {
        /** September, standing in for the month the calendar happens to be showing */
        const FALLBACK_MONTH_INDEX = 8;
        const MIN_DATE = new Date(1876, 8, 17);
        const MAX_DATE = new Date(2126, 8, 17);
        const viewDateFor = (dateSegments: DateSegments) => getViewDateFromSegments(dateSegments, FALLBACK_MONTH_INDEX, MIN_DATE, MAX_DATE);

        it('leaves the calendar alone while the year is unfinished', () => {
            expect(viewDateFor(segments('202', '', ''))).toBeUndefined();
            expect(viewDateFor(EMPTY)).toBeUndefined();
        });

        it('moves the year while keeping the month on screen', () => {
            expect(viewDateFor(segments('2030', '', ''))).toEqual(new Date(2030, 8, 1));
            expect(viewDateFor(segments('2030', '1', ''))).toEqual(new Date(2030, 8, 1));
        });

        it('moves the month once both of its digits read as a real month', () => {
            expect(viewDateFor(segments('2030', '02', ''))).toEqual(new Date(2030, 1, 1));
            expect(viewDateFor(segments('2030', '00', ''))).toEqual(new Date(2030, 8, 1));
        });

        it('ignores the day, which picks a date rather than a month to show', () => {
            expect(viewDateFor(segments('2030', '02', '28'))).toEqual(new Date(2030, 1, 1));
        });

        it('stays put for a year outside the range rather than jumping to the limit', () => {
            expect(viewDateFor(segments('1111', '01', '03'))).toBeUndefined();
            expect(viewDateFor(segments('9999', '01', ''))).toBeUndefined();
        });

        it('moves to the month holding the limit itself, which still has days to select', () => {
            expect(viewDateFor(segments('1876', '09', ''))).toEqual(new Date(1876, 8, 1));
            expect(viewDateFor(segments('1876', '08', ''))).toBeUndefined();
        });
    });

    describe('removeLastDigit', () => {
        it('drops one digit at a time', () => {
            expect(removeLastDigit(segments('2026', '', ''), 'year')).toEqual(segments('202', '', ''));
            expect(removeLastDigit(segments('2', '', ''), 'year')).toEqual(EMPTY);
        });

        it('reports that an empty segment had nothing to drop', () => {
            expect(removeLastDigit(EMPTY, 'year')).toBeUndefined();
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

    describe('hasAnySegment', () => {
        it('reports whether anything has been filled in', () => {
            expect(hasAnySegment(EMPTY)).toBe(false);
            expect(hasAnySegment(segments('', '09', ''))).toBe(true);
        });
    });
});
