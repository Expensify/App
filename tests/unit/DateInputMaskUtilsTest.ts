import {
    clearSegmentsUpTo,
    completeZeroSegments,
    getAdjacentSegmentName,
    getClipboardTextFromSegments,
    getDateMaskParts,
    getFirstUnfilledSegmentName,
    getISODateFromSegments,
    getPastedText,
    getSegmentDisplay,
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

        it('settles a zero that starts a filled segment over on the first month or day', () => {
            expect(typeDigitIntoSegments(segments('2026', '09', '05'), 'day', '0')).toEqual({segments: segments('2026', '09', '01'), nextSegmentName: undefined});
            expect(typeDigitIntoSegments(segments('2026', '12', ''), 'month', '0')).toEqual({segments: segments('2026', '01', ''), nextSegmentName: undefined});
        });

        it('lets the next digit replace a zero that settled that way, so 0 then 5 still reads as the fifth', () => {
            expect(typeDigitIntoSegments(segments('2026', '09', '01'), 'day', '5')).toEqual({segments: segments('2026', '09', '05'), nextSegmentName: undefined});
        });

        it('keeps a day the month that was typed does not have, rather than reading it as another day', () => {
            // Given February, which has no 31st, so the entry is left to be reported instead of answered with the 3rd
            expect(typeDigitIntoSegments(segments('2026', '02', '3'), 'day', '1')).toEqual({segments: segments('2026', '02', '31'), nextSegmentName: undefined});

            // Given January, where the same keystrokes read the same way
            expect(typeDigitIntoSegments(segments('2026', '01', '3'), 'day', '1')).toEqual({segments: segments('2026', '01', '31'), nextSegmentName: undefined});
        });

        it('waits for a second digit after a 3 whichever month was typed', () => {
            // Given February, where a 3 could still be meant to become the 31st the user is about to be told about
            expect(typeDigitIntoSegments(segments('2026', '02', ''), 'day', '3')).toEqual({segments: segments('2026', '02', '3'), nextSegmentName: undefined});
            expect(typeDigitIntoSegments(segments('2026', '03', ''), 'day', '3')).toEqual({segments: segments('2026', '03', '3'), nextSegmentName: undefined});
        });

        it('keeps February 29 whether or not the year is a leap year', () => {
            expect(typeDigitIntoSegments(segments('2024', '02', '2'), 'day', '9')).toEqual({segments: segments('2024', '02', '29'), nextSegmentName: undefined});
            expect(typeDigitIntoSegments(segments('2026', '02', '2'), 'day', '9')).toEqual({segments: segments('2026', '02', '29'), nextSegmentName: undefined});
        });

        it('caps the day at the longest month there is', () => {
            expect(typeDigitIntoSegments(segments('2026', '', '3'), 'day', '1')).toEqual({segments: segments('2026', '', '31'), nextSegmentName: undefined});
            expect(typeDigitIntoSegments(segments('2026', '', '3'), 'day', '2')).toEqual({segments: segments('2026', '', '03'), nextSegmentName: undefined});
        });

        it('leaves the day alone when the month typed after it does not have that day', () => {
            // Given the 31st typed before February, which the user is told about rather than moved off
            expect(typeDigitIntoSegments(segments('2026', '0', '31'), 'month', '2').segments).toEqual(segments('2026', '02', '31'));
        });

        it('leaves the day alone when the year typed after it takes the leap day away', () => {
            expect(typeDigitIntoSegments(segments('202', '02', '29'), 'year', '6').segments).toEqual(segments('2026', '02', '29'));
        });

        it('has nothing to carry into past the day, so a rejected pair restarts it', () => {
            expect(typeDigitIntoSegments(segments('2026', '09', '3'), 'day', '9')).toEqual({segments: segments('2026', '09', '03'), nextSegmentName: undefined});
        });
    });

    describe('getViewDateFromSegments', () => {
        /** September 2026, standing in for the month and year the calendar happens to be showing */
        const FALLBACK_DATE = new Date(2026, 8, 1);
        const MIN_DATE = new Date(1876, 8, 17);
        const MAX_DATE = new Date(2126, 8, 17);
        const viewDateFor = (dateSegments: DateSegments) => getViewDateFromSegments(dateSegments, FALLBACK_DATE, MIN_DATE, MAX_DATE);

        it('leaves the calendar alone while the year is unfinished and no month has been typed', () => {
            expect(viewDateFor(segments('202', '', ''))).toBeUndefined();
            expect(viewDateFor(EMPTY)).toBeUndefined();
        });

        it('moves the month typed before a year, keeping the year on screen', () => {
            // Given a month typed into a field whose year is still empty
            // When the calendar is asked where to go
            // Then it follows the month rather than waiting for a year it may not be given next
            expect(viewDateFor(segments('', '03', ''))).toEqual(new Date(2026, 2, 1));
            expect(viewDateFor(segments('19', '03', ''))).toEqual(new Date(2026, 2, 1));
        });

        it('pulls the year on screen into range for a month typed before a year', () => {
            // Given a field that only accepts dates up to September 2008, such as a date of birth, while the calendar
            // starts from today and is therefore showing a year that can never be picked
            const maxDate = new Date(2008, 8, 27);

            // When a month is typed before any year
            // Then the month lands in the newest year that can be picked, rather than being refused as out of range
            expect(getViewDateFromSegments(segments('', '03', ''), FALLBACK_DATE, MIN_DATE, maxDate)).toEqual(new Date(2008, 2, 1));
        });

        it('moves the year while keeping the month on screen', () => {
            expect(viewDateFor(segments('2030', '', ''))).toEqual(new Date(2030, 8, 1));
            expect(viewDateFor(segments('2030', '1', ''))).toEqual(new Date(2030, 8, 1));
        });

        it('moves the month once both of its digits read as a real month', () => {
            expect(viewDateFor(segments('2030', '02', ''))).toEqual(new Date(2030, 1, 1));
            expect(viewDateFor(segments('2030', '00', ''))).toEqual(new Date(2030, 8, 1));
        });

        it('carries the day, so a month or year picked from the calendar keeps it', () => {
            // Given a day already in the field
            // When the calendar is asked where to go
            // Then the day comes along, since the calendar builds a month or year pick from the date it is showing
            expect(viewDateFor(segments('2030', '02', '28'))).toEqual(new Date(2030, 1, 28));
        });

        it('holds a day to the month it lands in, which would otherwise carry the view into the next one', () => {
            // Given the 31st, typed while the month still read as a longer one
            // When the month that is typed next only has 30 days
            // Then the view stays in that month on its last day rather than moving on to the first of the next
            expect(viewDateFor(segments('2030', '04', '31'))).toEqual(new Date(2030, 3, 30));
        });

        it('leaves the day out while it reads as nothing to go to', () => {
            expect(viewDateFor(segments('2030', '02', ''))).toEqual(new Date(2030, 1, 1));
            expect(viewDateFor(segments('2030', '02', '0'))).toEqual(new Date(2030, 1, 1));
        });

        it('leaves the calendar alone for a year below the hundreds, which no date can carry', () => {
            // Given a year the Date constructor would read as a shorthand for the twentieth century
            // When the calendar is asked where to go
            // Then it stays where it is, rather than claiming the 1999 that year would have arrived as
            expect(viewDateFor(segments('0099', '', ''))).toBeUndefined();

            // Given a month typed alongside it, which is somewhere the calendar can go
            // Then the month is followed in the year already on screen
            expect(viewDateFor(segments('0099', '03', ''))).toEqual(new Date(2026, 2, 1));
        });

        it('follows a year outside the range, which validation is what reports', () => {
            // Given a year nowhere near the dates the field accepts
            // When the calendar is asked where to go
            // Then it follows all the same, so it does not sit on a month that disagrees with what the field shows
            expect(viewDateFor(segments('1111', '01', '03'))).toEqual(new Date(1111, 0, 3));
            expect(viewDateFor(segments('9999', '01', ''))).toEqual(new Date(9999, 0, 1));
        });

        it('follows a month at either limit, including one with no day left to select', () => {
            expect(viewDateFor(segments('1876', '09', ''))).toEqual(new Date(1876, 8, 1));
            expect(viewDateFor(segments('1876', '08', ''))).toEqual(new Date(1876, 7, 1));
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

    describe('clearSegmentsUpTo', () => {
        it('empties the segment and everything before it, leaving the rest alone', () => {
            // Given the day, which is the last segment, so there is nothing after it to keep
            expect(clearSegmentsUpTo(segments('2026', '09', '02'), 'day')).toEqual(EMPTY);

            // Given the month, which leaves the day the user has already entered
            expect(clearSegmentsUpTo(segments('2026', '09', '02'), 'month')).toEqual(segments('', '', '02'));

            // Given the year, which is the first segment, so only it is emptied
            expect(clearSegmentsUpTo(segments('2026', '09', '02'), 'year')).toEqual(segments('', '09', '02'));
        });

        it('leaves an already empty date empty', () => {
            expect(clearSegmentsUpTo(EMPTY, 'day')).toEqual(EMPTY);
        });
    });

    describe('getSegmentDisplay', () => {
        it('shows nothing for an empty segment, leaving its own placeholder to show through', () => {
            expect(getSegmentDisplay(EMPTY, 'year')).toBe('');
            expect(getSegmentDisplay(EMPTY, 'month')).toBe('');
        });

        it('shows the year as far as it has been typed', () => {
            expect(getSegmentDisplay(segments('2', '', ''), 'year')).toBe('2');
            expect(getSegmentDisplay(segments('20', '', ''), 'year')).toBe('20');
            expect(getSegmentDisplay(segments('2026', '', ''), 'year')).toBe('2026');
        });

        it('zero pads a half typed month or day, which fill from the right', () => {
            expect(getSegmentDisplay(segments('2026', '1', ''), 'month')).toBe('01');
            expect(getSegmentDisplay(segments('2026', '09', '2'), 'day')).toBe('02');
        });

        it('shows a finished month or day as typed', () => {
            expect(getSegmentDisplay(segments('2026', '09', '18'), 'month')).toBe('09');
            expect(getSegmentDisplay(segments('2026', '09', '18'), 'day')).toBe('18');
        });
    });

    describe('getDateMaskParts', () => {
        it('reads the segment order, placeholders and separators out of the mask', () => {
            expect(getDateMaskParts(MASK)).toEqual([
                {name: 'year', placeholder: 'YYYY', separator: '-'},
                {name: 'month', placeholder: 'MM', separator: '-'},
                {name: 'day', placeholder: 'DD', separator: ''},
            ]);
        });

        it('uses the letters and separators of the localized mask', () => {
            expect(getDateMaskParts('AAAA/MM/JJ').map((part) => part.placeholder)).toEqual(['AAAA', 'MM', 'JJ']);
            expect(getDateMaskParts('AAAA/MM/JJ').map((part) => part.separator)).toEqual(['/', '/', '']);
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

    describe('getFirstUnfilledSegmentName', () => {
        it('points at the year on an untouched date', () => {
            expect(getFirstUnfilledSegmentName(EMPTY)).toBe('year');
        });

        it('skips the segments already holding all of their digits', () => {
            expect(getFirstUnfilledSegmentName(segments('2026', '', ''))).toBe('month');
            expect(getFirstUnfilledSegmentName(segments('2026', '09', ''))).toBe('day');
        });

        it('counts a half typed segment as unfilled', () => {
            expect(getFirstUnfilledSegmentName(segments('202', '09', '18'))).toBe('year');
            expect(getFirstUnfilledSegmentName(segments('2026', '1', ''))).toBe('month');
        });

        it('reports nothing once the whole date is filled in', () => {
            expect(getFirstUnfilledSegmentName(segments('2026', '09', '18'))).toBeUndefined();
        });
    });

    describe('getPastedText', () => {
        it('reads a whole year pasted beside the digits the segment was showing', () => {
            // Given a year reading 1990 with the caret resting between the 19 and the 90
            // When a year is pasted there
            // Then only the pasted year is read back, rather than the digits it was dropped between
            expect(getPastedText('year', '1990', '19199890', false)).toBe('1998');
        });

        it('reads a whole year pasted at either end of the segment', () => {
            expect(getPastedText('year', '1990', '19901998', false)).toBe('1998');
            expect(getPastedText('year', '1990', '19981990', false)).toBe('1998');
        });

        it('reads a paste too short to fill the segment into the digits already there', () => {
            // Given a year reading 1990 with the caret resting between the 19 and the 90
            // When two digits are pasted there, which say nothing about the rest of the year
            // Then they are read in where they landed, the way typing them there would be
            expect(getPastedText('year', '1990', '198890', false)).toBe('1988');
            expect(getPastedText('year', '1990', '881990', false)).toBe('8819');
            expect(getPastedText('month', '05', '085', false)).toBe('08');
        });

        it('extends a segment that still has room for the paste', () => {
            expect(getPastedText('year', '19', '1988', false)).toBe('1988');
        });

        it('starts a full segment over for a paste that lands after its last digit', () => {
            // Given a year with no room left, which typing into starts over rather than extending
            // When two digits are pasted after it
            // Then they start the year over too, rather than being dropped for want of anywhere to go
            expect(getPastedText('year', '1990', '199088', false)).toBe('88');
            expect(getPastedText('month', '05', '057', false)).toBe('7');
        });

        it('reads a paste carrying separators of its own as the date it describes', () => {
            expect(getPastedText('year', '1990', '192026-09-1890', false)).toBe('2026-09-18');
        });

        it('reads a paste over a segment that was selected', () => {
            // Given a year whose digits were all selected, so none of them are left in what the input now reports
            // When a year is pasted over them
            // Then the whole of what the input reports is read back as the paste
            expect(getPastedText('year', '1990', '1998', false)).toBe('1998');
            expect(getPastedText('year', '1990', '12', false)).toBe('12');
        });

        it('replaces rather than merges while the whole date is selected', () => {
            // Given the whole date selected, which no selection in the segment's own input stands for
            // When two digits are pasted into the year
            // Then they replace the date rather than being read into the year that is being replaced
            expect(getPastedText('year', '1990', '881990', true)).toBe('88');
        });

        it('replaces the whole date with a paste that starts with the digits it lands beside', () => {
            // Given the whole date selected, with the caret resting after the year's own digits
            // When a date beginning with that same year is pasted
            // Then the year is not read as part of what was pasted, which would shift every segment along
            expect(getPastedText('year', '2002', '20022002-12-02', true)).toBe('2002-12-02');
        });

        it('reads a paste into an empty segment', () => {
            expect(getPastedText('year', '', '1998', false)).toBe('1998');
            expect(getPastedText('year', '', '88', false)).toBe('88');
        });
    });

    describe('getSegmentsFromText', () => {
        it('fills the segments from a pasted date', () => {
            expect(getSegmentsFromText('2026-09-18', 'year', EMPTY)).toEqual(segments('2026', '09', '18'));
            expect(getSegmentsFromText('20260918', 'year', EMPTY)).toEqual(segments('2026', '09', '18'));
        });

        it('stops once every segment is full', () => {
            expect(getSegmentsFromText('20260918123', 'year', EMPTY)).toEqual(segments('2026', '09', '18'));
        });

        it('fills what it can from a partial date', () => {
            expect(getSegmentsFromText('2026-09', 'year', EMPTY)).toEqual(segments('2026', '09', ''));
            expect(getSegmentsFromText('', 'year', EMPTY)).toEqual(EMPTY);
        });

        it('starts at the pasted-into segment rather than at the year', () => {
            // Given a year that is already filled in
            // When a month is pasted into the month segment
            // Then the year is left alone, rather than being overwritten by the pasted digits
            expect(getSegmentsFromText('12', 'month', segments('1990', '', ''))).toEqual(segments('1990', '12', ''));
        });

        it('keeps the segments the pasted digits never reach', () => {
            // Given a date that is filled in
            // When a single digit is pasted into the year
            // Then only the year is started over, because the paste never reached the month or the day
            expect(getSegmentsFromText('1', 'year', segments('1990', '12', '04'))).toEqual(segments('1', '12', '04'));
        });

        it('replaces a segment the digits reach rather than extending it', () => {
            // Given a full date, and a whole date pasted over it starting at the year
            // When the digits carry through every segment
            // Then each one holds only the pasted digits, rather than the old ones with the new appended
            expect(getSegmentsFromText('2026-09-18', 'year', segments('1990', '12', '04'))).toEqual(segments('2026', '09', '18'));
        });

        it('returns the segments it was given when the text holds no digits', () => {
            // Given text that is not a date at all, which is how a caller tells that nothing was pasted
            const baseSegments = segments('1990', '12', '04');

            expect(getSegmentsFromText('hello', 'year', baseSegments)).toBe(baseSegments);
            expect(getSegmentsFromText('', 'month', baseSegments)).toBe(baseSegments);
        });

        it('keeps a pasted day its month does not have, rather than reading it as another day', () => {
            // Given the 31st of a February, which is not a date
            // When it is pasted
            // Then the segments hold what was pasted, so the field can report it instead of showing the 3rd
            expect(getSegmentsFromText('1990-02-31', 'year', EMPTY)).toEqual(segments('1990', '02', '31'));
            expect(getSegmentsFromText('19900231', 'year', EMPTY)).toEqual(segments('1990', '02', '31'));
        });

        it('keeps a pasted number no segment could hold', () => {
            // Given a month that cannot read as 13
            // When it is pasted
            // Then the month holds it and reads as the impossible date it is, rather than becoming January the 3rd
            expect(getSegmentsFromText('13', 'month', EMPTY)).toEqual(segments('', '13', ''));
        });

        it('reads a separated date that pads neither its month nor its day', () => {
            // Given a date written the short way
            // When it is pasted
            // Then the separators say where each segment ends, so the month and the day are not run together
            expect(getSegmentsFromText('1990-2-3', 'year', EMPTY)).toEqual(segments('1990', '2', '3'));
        });
    });

    describe('getISODateFromSegments', () => {
        it('returns the stored format once every segment is filled in', () => {
            expect(getISODateFromSegments(segments('2026', '09', '18'))).toBe('2026-09-18');
        });

        it('reads a zero padded segment from one digit, since that is what it already shows', () => {
            expect(getISODateFromSegments(segments('2026', '9', '18'))).toBe('2026-09-18');
            expect(getISODateFromSegments(segments('2026', '09', '3'))).toBe('2026-09-03');
        });

        it('returns undefined while a segment is empty or the year is unfinished', () => {
            expect(getISODateFromSegments(segments('202', '09', '18'))).toBeUndefined();
            expect(getISODateFromSegments(segments('2026', '', '18'))).toBeUndefined();
            expect(getISODateFromSegments(segments('2026', '09', ''))).toBeUndefined();
            expect(getISODateFromSegments(EMPTY)).toBeUndefined();
        });

        it('refuses a segment that cannot be a month or a day, which only a zero can be', () => {
            expect(getISODateFromSegments(segments('2026', '0', '18'))).toBeUndefined();
            expect(getISODateFromSegments(segments('2026', '09', '0'))).toBeUndefined();
        });

        it('refuses a day the typed month does not have', () => {
            expect(getISODateFromSegments(segments('2026', '02', '31'))).toBeUndefined();
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

    describe('getClipboardTextFromSegments', () => {
        it('copies a finished date in the format the app stores', () => {
            // Given every segment filled in
            // When the date is cut or copied
            // Then the clipboard carries the same text any other field would be given
            expect(getClipboardTextFromSegments(segments('1990', '02', '03'))).toBe('1990-02-03');
        });

        it('copies a date that does not exist in the shape it was written in', () => {
            // Given digits the field is holding back because they do not read as a date
            // When they are cut or copied
            // Then they arrive elsewhere looking the way they looked here rather than as a run of digits
            expect(getClipboardTextFromSegments(segments('2003', '02', '31'))).toBe('2003-02-31');
        });

        it('copies the segments filled in so far while the date is unfinished', () => {
            // Given a date the user has only started
            // When it is cut or copied
            // Then what was filled in is carried over, so pasting it back fills the same segments again
            expect(getClipboardTextFromSegments(segments('1990', '', ''))).toBe('1990');
            expect(getClipboardTextFromSegments(segments('1990', '2', ''))).toBe('1990-02');
        });

        it('copies digits with a segment skipped over on their own', () => {
            // Given a month filled in with no year before it, so no separator says which segment the digits came from
            // When it is cut or copied
            // Then they are handed over to be read back by position
            expect(getClipboardTextFromSegments(segments('', '09', ''))).toBe('09');
        });

        it('has nothing to offer when no digit has been typed', () => {
            // Given a field showing nothing but its mask
            // When it is cut or copied
            // Then the clipboard is left alone rather than being emptied
            expect(getClipboardTextFromSegments(EMPTY)).toBe('');
        });
    });

    describe('hasAnySegment', () => {
        it('reports whether anything has been filled in', () => {
            expect(hasAnySegment(EMPTY)).toBe(false);
            expect(hasAnySegment(segments('', '09', ''))).toBe(true);
        });
    });

    describe('completeZeroSegments', () => {
        it('settles a segment left reading as zero on the first month or day', () => {
            // Given a month or day the user moved on from after typing only its zero
            // When the field is left
            // Then it settles on the first one, since no date has a zeroth month or day
            expect(completeZeroSegments(segments('2026', '0', '15'))).toEqual(segments('2026', '01', '15'));
            expect(completeZeroSegments(segments('2026', '09', '0'))).toEqual(segments('2026', '09', '01'));
            expect(completeZeroSegments(segments('2026', '0', '0'))).toEqual(segments('2026', '01', '01'));
        });

        it('settles a segment whose digits are all zeroes', () => {
            // Given both digits typed as zeroes, which reads as the same unusable number
            // When the field is left
            // Then it settles the same way as a single zero does
            expect(completeZeroSegments(segments('2026', '00', '15'))).toEqual(segments('2026', '01', '15'));
        });

        it('returns the segments themselves when there is nothing to settle', () => {
            // Given segments that already read as numbers a date can hold
            // When the field is left
            // Then the very same object comes back, which is how the caller tells nothing was filled out
            const filled = segments('2026', '09', '15');
            expect(completeZeroSegments(filled)).toBe(filled);
            expect(completeZeroSegments(EMPTY)).toBe(EMPTY);
        });

        it('leaves an empty segment empty', () => {
            // Given a segment nothing was typed into, as opposed to one holding a zero
            // When the field is left
            // Then it stays empty, since the user never started a number there to finish
            expect(completeZeroSegments(segments('2026', '', '0'))).toEqual(segments('2026', '', '01'));
        });

        it('leaves a year of zeroes alone', () => {
            // Given a year reading as zero, which is four digits rather than a number cut short
            // When the field is left
            // Then it is left as it is, and the date it cannot make is reported instead
            expect(completeZeroSegments(segments('0000', '09', '15'))).toEqual(segments('0000', '09', '15'));
        });
    });
});
