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
});
