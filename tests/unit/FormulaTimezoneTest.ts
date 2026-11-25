/**
 * @jest-environment ./jest/TimezoneEnvironment.ts
 * @jest-environment-options {"timezone": "America/Los_Angeles"}
 */
import type {FormulaContext} from '@libs/Formula';
import {compute} from '@libs/Formula';

import type {Policy, Report, Transaction} from '@src/types/onyx';

import createMock from '../utils/createMock';
import {getCurrencyDecimalsLocal} from '../utils/TestHelper';

describe('Formula west of UTC', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('expense dates without a time', () => {
        // Given a user west of UTC, on a workspace with no auto-reporting period, with expense dates stored without a time
        const context: FormulaContext = {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            report: createMock<Report>({reportID: '123'}),
            policy: createMock<Policy>({autoReporting: false}),
            allTransactions: {
                trans1: createMock<Transaction>({transactionID: 'trans1', reportID: '123', created: '2025-01-15', merchant: 'Hotel', amount: 5000}),
                trans2: createMock<Transaction>({transactionID: 'trans2', reportID: '123', created: '2025-01-20', merchant: 'Restaurant', amount: 3000}),
            },
        };

        // When the date parts of a title are computed
        const autoReportingTitle = compute('{report:autoreporting:start} to {report:autoreporting:end}', context);
        const expenseDatesTitle = compute('{report:startdate} to {report:enddate}', context);

        // Then they show the stored dates, not the day before, which is what reading them as midnight UTC would give
        expect(autoReportingTitle).toBe('2025-01-15 to 2025-01-20');
        expect(expenseDatesTitle).toBe('2025-01-15 to 2025-01-20');
    });

    test('week number of a local date that is the next day in UTC', () => {
        // Given an expense on Sunday, January 19 at 8pm local time, which is already Monday in UTC
        const context: FormulaContext = {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            report: createMock<Report>({reportID: '123'}),
            policy: createMock<Policy>({}),
            allTransactions: {
                trans1: createMock<Transaction>({transactionID: 'trans1', reportID: '123', created: '2025-01-19 20:00:00', merchant: 'Hotel', amount: 5000}),
            },
        };

        // When the date and its ISO week number are computed
        const title = compute('{report:startdate:yyyy-MM-dd} week {report:startdate:W}', context);

        // Then the week number is the week of the day shown (ISO week 3), not of the next UTC day (week 4)
        expect(title).toBe('2025-01-19 week 03');
    });

    test('time of a date stored without a time zone', () => {
        // Given a report created at 3:30pm, stored without a time zone, and an expense dated without a time
        const context: FormulaContext = {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            report: createMock<Report>({reportID: '123', created: '2025-01-08 15:30:45'}),
            policy: createMock<Policy>({}),
            allTransactions: {
                trans1: createMock<Transaction>({transactionID: 'trans1', reportID: '123', created: '2025-01-20', merchant: 'Hotel', amount: 5000}),
            },
        };

        // When their times are computed
        const submitTime = compute('{report:submit:date:yyyy-MM-dd HH:mm:ss}', context);
        const expenseTime = compute('{report:startdate:yyyy-MM-dd HH:mm}', context);
        const expenseISOTime = compute('{report:startdate:c}', context);
        const expenseUnixTime = compute('{report:startdate:U}', context);
        const expenseRFC2822Time = compute('{report:startdate:r}', context);

        // Then they show the stored time, like the backend, rather than shifting it by the user's distance from UTC.
        // The backend reads stored times as UTC, so the ISO and Unix times treat them as UTC too.
        expect(submitTime).toBe('2025-01-08 15:30:45');
        expect(expenseTime).toBe('2025-01-20 00:00');
        expect(expenseISOTime).toBe('2025-01-20T00:00:00.000Z');
        expect(expenseUnixTime).toBe('1737331200');
        expect(expenseRFC2822Time).toBe('Mon, 20 Jan 2025 00:00:00 +0000');
    });

    test('dates of a report without expenses', () => {
        // Given a report without expenses, computed at 3:30pm UTC, which is 7:30am for this user
        jest.useFakeTimers().setSystemTime(new Date('2025-01-08T15:30:45.123Z'));
        const context: FormulaContext = {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            report: createMock<Report>({reportID: '123'}),
            policy: createMock<Policy>({}),
            allTransactions: {},
        };

        // When its expense dates are computed, which fall back to the current time
        const time = compute('{report:startdate:yyyy-MM-dd HH:mm}', context);
        const isoTime = compute('{report:startdate:c}', context);
        const unixTime = compute('{report:enddate:U}', context);

        // Then they show the current time in UTC, the way stored times are shown
        expect(time).toBe('2025-01-08 15:30');
        expect(isoTime).toBe('2025-01-08T15:30:45.123Z');
        expect(unixTime).toBe('1736350245');
    });

    test('day of the year during daylight saving time', () => {
        // Given an expense dated during daylight saving time, when a day since January 1 is an hour short
        const context: FormulaContext = {
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            report: createMock<Report>({reportID: '123'}),
            policy: createMock<Policy>({}),
            allTransactions: {
                trans1: createMock<Transaction>({transactionID: 'trans1', reportID: '123', created: '2025-07-04', merchant: 'Hotel', amount: 5000}),
            },
        };

        // When its day of the year is computed
        const dayOfYear = compute('{report:startdate:z}', context);

        // Then it counts whole days from January 1, starting at 0, like the backend
        expect(dayOfYear).toBe('184');
    });
});
