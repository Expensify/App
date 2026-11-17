import {toLocaleOrdinal} from '@libs/LocaleDigitUtils';
import {
    areSemiMonthlyOffsetsEqual,
    getAutoReportingOffsetsForFrequency,
    getPolicyAutoReportingOffsets,
    getSubmissionScheduleSummary,
    getWorkspaceTimezone,
    parseAutoReportingOffset,
    sortSemiMonthlyOffsets,
    isSemiMonthlyOffsetOrderValid,
} from '@libs/SubmissionScheduleUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const {AUTO_REPORTING_FREQUENCIES, AUTO_REPORTING_OFFSET, AUTO_REPORTING_WEEKDAYS} = CONST.POLICY;

const toEnglishOrdinal = (number: number) => toLocaleOrdinal(CONST.LOCALES.EN, number);

function buildPolicy(overrides: Partial<Policy>): Policy {
    return {...createRandomPolicy(0), harvesting: {enabled: true}, ...overrides};
}

describe('SubmissionScheduleUtils', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    describe('parseAutoReportingOffset', () => {
        it('reads numeric draft strings as days and keeps named offsets', () => {
            // Given draft form values, which are always stored as strings
            // When they are parsed
            // Then numeric days become numbers, named offsets pass through and anything else is dropped
            expect(parseAutoReportingOffset('15')).toBe(15);
            expect(parseAutoReportingOffset(3)).toBe(3);
            expect(parseAutoReportingOffset(AUTO_REPORTING_OFFSET.LAST_FRIDAY_OF_MONTH)).toBe(AUTO_REPORTING_OFFSET.LAST_FRIDAY_OF_MONTH);
            expect(parseAutoReportingOffset('')).toBeUndefined();
            expect(parseAutoReportingOffset(undefined)).toBeUndefined();
            expect(parseAutoReportingOffset('firstBusinessDayOfMonth')).toBeUndefined();
        });
    });

    describe('getAutoReportingOffsetsForFrequency', () => {
        it('falls back to Sunday when a weekly policy has an offset left over from another frequency', () => {
            // Given a weekly frequency with a monthly offset still saved
            // When the offsets are resolved
            const offsets = getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.WEEKLY, {offset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH});

            // Then the backend default weekday is used
            expect(offsets).toEqual({offset: AUTO_REPORTING_WEEKDAYS.SUNDAY});
        });

        it('keeps a valid weekday for weekly', () => {
            // Given a weekly frequency on Friday
            // When the offsets are resolved
            // Then Friday is kept
            expect(getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.WEEKLY, {offset: AUTO_REPORTING_WEEKDAYS.FRIDAY})).toEqual({offset: AUTO_REPORTING_WEEKDAYS.FRIDAY});
        });

        it('defaults twice a month to the 15th and the last day when the saved dates are not allowed', () => {
            // Given a twice a month frequency with a last weekday offset and a day past the 28th
            // When the offsets are resolved
            const offsets = getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY, {offset: AUTO_REPORTING_OFFSET.LAST_MONDAY_OF_MONTH, secondOffset: 30});

            // Then both dates fall back to the backend defaults
            expect(offsets).toEqual({offset: CONST.POLICY.AUTO_REPORTING_DEFAULT_SEMI_MONTHLY_OFFSET, secondOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH});
        });

        it('keeps any monthly offset and defaults a missing one to the 1st', () => {
            // Given monthly frequencies with and without a saved offset
            // When the offsets are resolved
            // Then the saved offset is kept and a missing one becomes the 1st
            expect(getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.MONTHLY, {offset: AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH})).toEqual({
                offset: AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
            });
            expect(getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.MONTHLY, {})).toEqual({offset: 1});
        });

        it('returns no offsets for frequencies without a day', () => {
            // Given a frequency that does not run on a specific day
            // When the offsets are resolved
            // Then nothing is returned so no stale offset is shown
            expect(getAutoReportingOffsetsForFrequency(AUTO_REPORTING_FREQUENCIES.INSTANT, {offset: 5})).toEqual({});
        });
    });

    describe('getPolicyAutoReportingOffsets', () => {
        it('reads the second twice a month date from the policy', () => {
            // Given a twice a month policy on the 1st and 16th
            const policy = buildPolicy({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY, autoReportingOffset: 1, autoReportingOffsetSecondSemiMonthly: 16});

            // When the policy offsets are read
            // Then both dates are returned
            expect(getPolicyAutoReportingOffsets(policy)).toEqual({offset: 1, secondOffset: 16});
        });
    });

    describe('sortSemiMonthlyOffsets', () => {
        it('puts the earlier date first because saved schedules can hold either order', () => {
            // Given the later date picked as the first submission
            // When the dates are sorted
            // Then they swap, with the last day of the month ranked latest
            expect(sortSemiMonthlyOffsets({offset: 20, secondOffset: 5})).toEqual({offset: 5, secondOffset: 20});
            expect(sortSemiMonthlyOffsets({offset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH, secondOffset: 28})).toEqual({offset: 28, secondOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH});
            expect(sortSemiMonthlyOffsets({offset: 5, secondOffset: 20})).toEqual({offset: 5, secondOffset: 20});
        });
    });

    describe('isSemiMonthlyOffsetOrderValid', () => {
        it('accepts only a first date that comes before the second', () => {
            // Given pairs of twice a month dates, since the Frequency page blocks saving them out of order
            // When their order is checked
            // Then only an earlier first date passes, with the 31st and the last day ranked as the same date
            expect(isSemiMonthlyOffsetOrderValid({offset: 5, secondOffset: 20})).toBe(true);
            expect(isSemiMonthlyOffsetOrderValid({offset: 28, secondOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH})).toBe(true);
            expect(isSemiMonthlyOffsetOrderValid({offset: 20, secondOffset: 5})).toBe(false);
            expect(isSemiMonthlyOffsetOrderValid({offset: 31, secondOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH})).toBe(false);
        });

        it('passes while either date is still unset', () => {
            // Given a schedule where the admin hasn't picked both dates yet
            // When its order is checked
            // Then it passes, since there is nothing to compare
            expect(isSemiMonthlyOffsetOrderValid({offset: 20, secondOffset: undefined})).toBe(true);
        });
    });

    describe('areSemiMonthlyOffsetsEqual', () => {
        it('matches only the same date', () => {
            // Given pairs of twice a month dates
            // When they are compared
            // Then only identical dates match
            expect(areSemiMonthlyOffsetsEqual(AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH, AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH)).toBe(true);
            expect(areSemiMonthlyOffsetsEqual(10, 10)).toBe(true);
            expect(areSemiMonthlyOffsetsEqual(28, AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH)).toBe(false);
        });
    });

    describe('getWorkspaceTimezone', () => {
        it('uses the saved timezone and falls back to Pacific time', () => {
            // Given one workspace with a timezone and one created before timezones existed
            // When the timezone is read
            // Then the saved value wins and the older workspace uses the backend default
            expect(getWorkspaceTimezone(buildPolicy({timeZone: 'Europe/London'}))).toBe('Europe/London');
            expect(getWorkspaceTimezone(buildPolicy({timeZone: undefined}))).toBe(CONST.DEFAULT_TIME_ZONE.selected);
        });
    });

    describe('getSubmissionScheduleSummary', () => {
        it('describes each schedule shown in the Frequency row', () => {
            // Given workspaces on each scheduled frequency
            const summaryFor = (overrides: Partial<Policy>) => getSubmissionScheduleSummary(buildPolicy(overrides), translateLocal, toEnglishOrdinal);

            // When the summary is built
            // Then it names the resolved day
            expect(summaryFor({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.WEEKLY, autoReportingOffset: AUTO_REPORTING_WEEKDAYS.FRIDAY})).toBe('Weekly on Fridays');
            expect(summaryFor({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.MONTHLY, autoReportingOffset: 3})).toBe('Monthly on the 3rd');
            expect(summaryFor({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.MONTHLY, autoReportingOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH})).toBe('Monthly on the last day');
            expect(summaryFor({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.MONTHLY, autoReportingOffset: AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH})).toBe(
                'Monthly on the last business day',
            );
            expect(summaryFor({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.MONTHLY, autoReportingOffset: AUTO_REPORTING_OFFSET.LAST_FRIDAY_OF_MONTH})).toBe(
                'Monthly on the last Friday',
            );
        });

        it('lists twice a month dates in order', () => {
            // Given twice a month workspaces saved with the later date first
            const summaryFor = (overrides: Partial<Policy>) =>
                getSubmissionScheduleSummary(buildPolicy({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY, ...overrides}), translateLocal, toEnglishOrdinal);

            // When the summary is built
            // Then the earlier date is named first
            expect(summaryFor({autoReportingOffset: 20, autoReportingOffsetSecondSemiMonthly: 5})).toBe('Twice a month on the 5th and 20th');
            expect(summaryFor({autoReportingOffset: AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH, autoReportingOffsetSecondSemiMonthly: 15})).toBe('Twice a month on the 15th and the last day');
        });

        it('treats daily without harvesting as manual', () => {
            // Given an immediate frequency with harvesting turned off
            const policy = buildPolicy({autoReportingFrequency: AUTO_REPORTING_FREQUENCIES.IMMEDIATE, harvesting: {enabled: false}});

            // When the summary is built
            // Then it reads as manual, since that is how the backend stores it
            expect(getSubmissionScheduleSummary(policy, translateLocal, toEnglishOrdinal)).toBe('Manually');
        });
    });
});
