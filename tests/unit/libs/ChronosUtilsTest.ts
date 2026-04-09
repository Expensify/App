import {buildOOOCommand} from '@libs/ChronosUtils';

describe('buildOOOCommand', () => {
    test('returns minimal command with only date', () => {
        expect(buildOOOCommand({date: '2025-04-09'})).toBe('ooo 2025-04-09');
    });

    test('appends time when provided', () => {
        expect(buildOOOCommand({date: '2025-04-09', time: '12:30'})).toBe('ooo 2025-04-09 12:30');
    });

    test('appends time period after time', () => {
        expect(buildOOOCommand({date: '2025-04-09', time: '12:30', timePeriod: 'PM'})).toBe('ooo 2025-04-09 12:30 PM');
    });

    test('does not append time period without time', () => {
        expect(buildOOOCommand({date: '2025-04-09', timePeriod: 'AM'})).toBe('ooo 2025-04-09');
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
                timePeriod: 'AM',
                durationAmount: '3',
                durationUnit: 'days',
                reason: 'in Portland',
                workingPercentage: '0',
            }),
        ).toBe('ooo 2025-04-09 9:00 AM for 3 days in Portland 0%');
    });

    test('builds command with time, duration, and percentage', () => {
        expect(
            buildOOOCommand({
                date: '2025-01-15',
                time: '1:30',
                timePeriod: 'PM',
                durationAmount: '1',
                durationUnit: 'hours',
                workingPercentage: '50',
            }),
        ).toBe('ooo 2025-01-15 1:30 PM for 1 hours 50%');
    });
});
