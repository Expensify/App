import parseCSVDate from '@libs/CSVDateUtils';

import type * as DateFns from 'date-fns';

jest.mock('date-fns', () => {
    const actual = jest.requireActual<typeof DateFns>('date-fns');
    return {...actual, parse: jest.fn(actual.parse)};
});

const {parse: mockedParse} = jest.requireMock<typeof DateFns>('date-fns');

describe('CSVDateUtils', () => {
    describe('parseCSVDate', () => {
        it('parses common date formats to yyyy-MM-dd', () => {
            expect(parseCSVDate('2024-01-15')).toBe('2024-01-15');
            expect(parseCSVDate('01/20/2024')).toBe('2024-01-20');
            expect(parseCSVDate('20-01-2024')).toBe('2024-01-20');
            expect(parseCSVDate('Jan 25, 2024')).toBe('2024-01-25');
        });

        it('returns null for invalid input', () => {
            expect(parseCSVDate('not a date')).toBeNull();
            expect(parseCSVDate('')).toBeNull();
        });

        it('parses bare ISO date-only strings as local time instead of UTC midnight', () => {
            expect(parseCSVDate('2026-07-15')).toBe('2026-07-15');
            expect(mockedParse).toHaveBeenCalledWith('2026-07-15', 'yyyy-MM-dd', expect.any(Date));
        });

        it('falls back to native Date parsing for calendar-invalid ISO-shaped dates', () => {
            // Non-leap year
            expect(parseCSVDate('2026-02-30')).toBe('2026-03-02');
        });
    });
});
