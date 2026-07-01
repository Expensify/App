import {buildOOOCommand, computeDurationDays, computeEndDate} from '@libs/ChronosUtils';
import CONST from '@src/CONST';

describe('buildOOOCommand', () => {
    test('returns minimal command with only date', () => {
        expect(buildOOOCommand({date: '2025-04-09'})).toBe('ooo 2025-04-09');
    });

    test('appends time when provided', () => {
        expect(buildOOOCommand({date: '2025-04-09', time: '14:30'})).toBe('ooo 2025-04-09 14:30');
    });

    test('appends duration when both amount and unit provided', () => {
        expect(buildOOOCommand({date: '2025-04-09', durationAmount: '2', durationUnit: 'days'})).toBe('ooo 2025-04-09 for 2 days');
    });

    test('does not append duration when only amount provided', () => {
        expect(buildOOOCommand({date: '2025-04-09', durationAmount: '2'})).toBe('ooo 2025-04-09');
    });

    test('does not append duration when only unit provided', () => {
        expect(buildOOOCommand({date: '2025-04-09', durationUnit: 'days'})).toBe('ooo 2025-04-09');
    });

    test('appends reason', () => {
        expect(buildOOOCommand({date: '2025-04-09', reason: 'on vacation'})).toBe('ooo 2025-04-09 on vacation');
    });

    test('appends working percentage with % sign', () => {
        expect(buildOOOCommand({date: '2025-04-09', workingPercentage: '50'})).toBe('ooo 2025-04-09 50%');
    });

    test('strips existing % from working percentage', () => {
        expect(buildOOOCommand({date: '2025-04-09', workingPercentage: '50%'})).toBe('ooo 2025-04-09 50%');
    });

    test('strips multiple % signs from working percentage', () => {
        expect(buildOOOCommand({date: '2025-04-09', workingPercentage: '50%%'})).toBe('ooo 2025-04-09 50%');
    });

    test('ignores working percentage that is only %', () => {
        expect(buildOOOCommand({date: '2025-04-09', workingPercentage: '%'})).toBe('ooo 2025-04-09');
    });

    test('ignores empty working percentage', () => {
        expect(buildOOOCommand({date: '2025-04-09', workingPercentage: ''})).toBe('ooo 2025-04-09');
    });

    test('builds full command with all fields', () => {
        expect(
            buildOOOCommand({
                date: '2025-04-09',
                time: '9:00',
                durationAmount: '3',
                durationUnit: 'days',
                reason: 'in Portland',
                workingPercentage: '0',
            }),
        ).toBe('ooo 2025-04-09 9:00 for 3 days in Portland 0%');
    });

    test('builds command with time, duration, and percentage', () => {
        expect(
            buildOOOCommand({
                date: '2025-01-15',
                time: '13:30',
                durationAmount: '1',
                durationUnit: 'hours',
                workingPercentage: '50',
            }),
        ).toBe('ooo 2025-01-15 13:30 for 1 hours 50%');
    });
});

describe('computeEndDate', () => {
    const {DAY, WEEK, MONTH, HOUR} = CONST.CHRONOS.OOO_DURATION_UNITS;

    test('returns the inclusive last day for a whole-day duration', () => {
        // 3 days starting on the 9th covers the 9th, 10th and 11th
        expect(computeEndDate('2025-04-09', '3', DAY)).toBe('2025-04-11');
    });

    test('returns the start date for a single-day duration', () => {
        expect(computeEndDate('2025-04-09', '1', DAY)).toBe('2025-04-09');
    });

    test('carries the remaining hours of a fractional day into the end day', () => {
        // 1.5 days = start + 1 day + 12h, which lands on the next calendar day
        expect(computeEndDate('2025-04-09', '1.5', DAY)).toBe('2025-04-10');
    });

    test('normalizes a comma decimal separator', () => {
        expect(computeEndDate('2025-04-09', '1,5', DAY)).toBe('2025-04-10');
    });

    test('computes whole-week durations', () => {
        // 2 weeks = 14 days inclusive, ending 13 days after the start
        expect(computeEndDate('2025-04-09', '2', WEEK)).toBe('2025-04-22');
    });

    test('computes whole-month durations', () => {
        expect(computeEndDate('2025-01-15', '1', MONTH)).toBe('2025-02-14');
    });

    test('clamps month rollover to the end of a shorter month', () => {
        // Jan 31 + 1 month clamps to Feb 28 (2025 is not a leap year), then minus one day
        expect(computeEndDate('2025-01-31', '1', MONTH)).toBe('2025-02-27');
    });

    test('returns the start date for hour durations', () => {
        expect(computeEndDate('2025-04-09', '5', HOUR)).toBe('2025-04-09');
    });

    test('returns an empty string for an invalid start date', () => {
        expect(computeEndDate('', '3', DAY)).toBe('');
        expect(computeEndDate('not-a-date', '3', DAY)).toBe('');
    });

    test('returns the start date for a non-positive or empty duration', () => {
        expect(computeEndDate('2025-04-09', '0', DAY)).toBe('2025-04-09');
        expect(computeEndDate('2025-04-09', '', DAY)).toBe('2025-04-09');
    });
});

describe('computeDurationDays', () => {
    test('counts both the start and end day (inclusive)', () => {
        expect(computeDurationDays('2025-04-09', '2025-04-11')).toBe(3);
    });

    test('returns 1 when start and end are the same day', () => {
        expect(computeDurationDays('2025-04-09', '2025-04-09')).toBe(1);
    });

    test('returns null when the end date precedes the start date', () => {
        expect(computeDurationDays('2025-04-11', '2025-04-09')).toBeNull();
    });

    test('returns null when a date is missing', () => {
        expect(computeDurationDays('', '2025-04-09')).toBeNull();
        expect(computeDurationDays('2025-04-09', '')).toBeNull();
    });

    test('returns null when a date is invalid', () => {
        expect(computeDurationDays('2025-04-09', 'not-a-date')).toBeNull();
    });

    test('is the inverse of computeEndDate for whole-day durations', () => {
        const start = '2025-04-09';
        expect(computeDurationDays(start, computeEndDate(start, '5', CONST.CHRONOS.OOO_DURATION_UNITS.DAY))).toBe(5);
    });
});
