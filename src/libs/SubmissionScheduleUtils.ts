import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {AutoReportingOffset} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {getCorrectedAutoReportingFrequency} from './PolicyUtils';

type AutoReportingFrequency = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

type AutoReportingOffsets = {
    offset?: AutoReportingOffset;
    secondOffset?: AutoReportingOffset;
};

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const LAST_WEEKDAY_OFFSETS = [
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_MONDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_TUESDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_WEDNESDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_THURSDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_FRIDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_SATURDAY_OF_MONTH,
    CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_SUNDAY_OF_MONTH,
] as const;

const NAMED_OFFSETS = Object.values(CONST.POLICY.AUTO_REPORTING_OFFSET);

const FREQUENCIES = Object.values(CONST.POLICY.AUTO_REPORTING_FREQUENCIES);

/** Draft form values are strings, so numeric days come back as numbers and named offsets stay as they are. */
function parseAutoReportingOffset(value: string | number | undefined): AutoReportingOffset | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    if (typeof value === 'number') {
        return value;
    }
    const day = Number(value);
    if (Number.isInteger(day)) {
        return day;
    }
    return NAMED_OFFSETS.find((namedOffset) => namedOffset === value);
}

function isAutoReportingFrequency(value: string | undefined): value is AutoReportingFrequency {
    return FREQUENCIES.some((frequency) => frequency === value);
}

function isWeekdayOffset(offset: AutoReportingOffset | undefined): offset is number {
    return typeof offset === 'number' && offset >= CONST.POLICY.AUTO_REPORTING_WEEKDAYS.MONDAY && offset <= CONST.POLICY.AUTO_REPORTING_WEEKDAYS.SUNDAY;
}

function isSemiMonthlyOffset(offset: AutoReportingOffset | undefined): offset is number | typeof CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH {
    if (offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
        return true;
    }
    return typeof offset === 'number' && offset >= 1 && offset <= CONST.POLICY.AUTO_REPORTING_MAX_DAY_OF_MONTH;
}

/** Legacy policies can carry an offset left over from another frequency, so anything invalid for the frequency falls back to the backend default. */
function getAutoReportingOffsetsForFrequency(frequency: AutoReportingFrequency | undefined, offsets: AutoReportingOffsets): AutoReportingOffsets {
    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
            return {offset: isWeekdayOffset(offsets.offset) ? offsets.offset : CONST.POLICY.AUTO_REPORTING_WEEKDAYS.SUNDAY};
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
            return {
                offset: isSemiMonthlyOffset(offsets.offset) ? offsets.offset : CONST.POLICY.AUTO_REPORTING_DEFAULT_SEMI_MONTHLY_OFFSET,
                secondOffset: isSemiMonthlyOffset(offsets.secondOffset) ? offsets.secondOffset : CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
            };
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
            return {offset: offsets.offset ?? 1};
        default:
            return {};
    }
}

/** Workspaces created before timezones existed run on Pacific time, which the backend treats as the default. */
function getWorkspaceTimezone(policy: OnyxEntry<Policy>): string {
    return policy?.timeZone ?? CONST.DEFAULT_TIME_ZONE.selected;
}

function getPolicyAutoReportingOffsets(policy: OnyxEntry<Policy>): AutoReportingOffsets {
    return getAutoReportingOffsetsForFrequency(getCorrectedAutoReportingFrequency(policy), {
        offset: policy?.autoReportingOffset,
        secondOffset: policy?.autoReportingOffsetSecondSemiMonthly,
    });
}

function getSemiMonthlyOffsetRank(offset: AutoReportingOffset | undefined): number {
    // The 31st resolves to the last day in every month, so both rank as the latest date.
    return typeof offset === 'number' ? offset : 31;
}

function areSemiMonthlyOffsetsEqual(firstOffset: AutoReportingOffset | undefined, secondOffset: AutoReportingOffset | undefined): boolean {
    return getSemiMonthlyOffsetRank(firstOffset) === getSemiMonthlyOffsetRank(secondOffset);
}

/** The backend doesn't reorder the two dates, so the earlier one is always sent as the first submission. */
function sortSemiMonthlyOffsets(offsets: AutoReportingOffsets): AutoReportingOffsets {
    if (getSemiMonthlyOffsetRank(offsets.offset) <= getSemiMonthlyOffsetRank(offsets.secondOffset)) {
        return offsets;
    }
    return {offset: offsets.secondOffset, secondOffset: offsets.offset};
}

function getWeekdayKey(weekday: number): TupleToUnion<typeof WEEKDAY_KEYS> {
    return WEEKDAY_KEYS.at(weekday - 1) ?? 'sunday';
}

function getAutoReportingOffsetDisplayName(
    offset: AutoReportingOffset | undefined,
    translate: LocaleContextProps['translate'],
    toLocaleOrdinal: LocaleContextProps['toLocaleOrdinal'],
): string {
    if (offset === undefined) {
        return '';
    }
    if (typeof offset === 'number') {
        return toLocaleOrdinal(offset);
    }
    return translate(`workflowsPage.frequencies.${offset}`);
}

function getFrequencyDisplayName(frequency: AutoReportingFrequency, translate: LocaleContextProps['translate']): string {
    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT:
            return translate('workflowsPage.frequencies.instant');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE:
            return translate('workflowsPage.frequencies.daily');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
            return translate('workflowsPage.frequencies.weekly');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
            return translate('workflowsPage.frequencies.twiceAMonth');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
            return translate('workflowsPage.frequencies.monthly');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP:
            return translate('workflowsPage.frequencies.byTrip');
        default:
            return translate('workflowsPage.frequencies.manually');
    }
}

function getMonthlyScheduleSummary(offset: AutoReportingOffset | undefined, translate: LocaleContextProps['translate'], toLocaleOrdinal: LocaleContextProps['toLocaleOrdinal']): string {
    if (typeof offset === 'number' || offset === undefined) {
        return translate('workflowsPage.frequencySummary.monthly', {day: toLocaleOrdinal(offset ?? 1)});
    }
    if (offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
        return translate('workflowsPage.frequencySummary.monthlyLastDay');
    }
    if (offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
        return translate('workflowsPage.frequencySummary.monthlyLastBusinessDay');
    }
    const lastWeekdayIndex = LAST_WEEKDAY_OFFSETS.findIndex((lastWeekdayOffset) => lastWeekdayOffset === offset);
    return translate(`workflowsPage.frequencySummary.monthlyLastWeekday.${getWeekdayKey(lastWeekdayIndex + 1)}`);
}

/** The resolved schedule shown as the Frequency row value, such as "Weekly on Fridays". */
function getSubmissionScheduleSummary(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate'], toLocaleOrdinal: LocaleContextProps['toLocaleOrdinal']): string {
    const frequency = getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY;
    const {offset, secondOffset} = getPolicyAutoReportingOffsets(policy);

    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
            return translate(`workflowsPage.frequencySummary.weekly.${getWeekdayKey(Number(offset))}`);
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY: {
            const sortedOffsets = sortSemiMonthlyOffsets({offset, secondOffset});
            const firstDay = getAutoReportingOffsetDisplayName(sortedOffsets.offset, translate, toLocaleOrdinal);
            if (sortedOffsets.secondOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                return translate('workflowsPage.frequencySummary.twiceAMonthAndLastDay', {firstDay});
            }
            return translate('workflowsPage.frequencySummary.twiceAMonth', {firstDay, secondDay: getAutoReportingOffsetDisplayName(sortedOffsets.secondOffset, translate, toLocaleOrdinal)});
        }
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
            return getMonthlyScheduleSummary(offset, translate, toLocaleOrdinal);
        default:
            return getFrequencyDisplayName(frequency, translate);
    }
}

/** Only the frequencies whose name doesn't explain itself get a description line under the Frequency row. */
function getSubmissionScheduleDescription(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): string | undefined {
    switch (getCorrectedAutoReportingFrequency(policy)) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT:
            return translate('workflowsPage.frequencyRowDescription.instant');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP:
            return translate('workflowsPage.frequencyRowDescription.byTrip');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL:
            return translate('workflowsPage.frequencyRowDescription.manually');
        default:
            return undefined;
    }
}

function getSubmissionFrequencyHelperText(frequency: AutoReportingFrequency, timezoneLink: string, translate: LocaleContextProps['translate']): string {
    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT:
            return translate('workflowsPage.frequencyHelperText.instant');
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE:
            return translate('workflowsPage.frequencyHelperText.daily', {timezoneLink});
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
            return translate('workflowsPage.frequencyHelperText.weekly', {timezoneLink});
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
            return translate('workflowsPage.frequencyHelperText.twiceAMonth', {timezoneLink});
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
            return translate('workflowsPage.frequencyHelperText.monthly', {timezoneLink});
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP:
            return translate('workflowsPage.frequencyHelperText.byTrip');
        default:
            return translate('workflowsPage.frequencyHelperText.manually');
    }
}

export {
    LAST_WEEKDAY_OFFSETS,
    WEEKDAY_KEYS,
    areSemiMonthlyOffsetsEqual,
    getAutoReportingOffsetDisplayName,
    getAutoReportingOffsetsForFrequency,
    getFrequencyDisplayName,
    getPolicyAutoReportingOffsets,
    getSubmissionFrequencyHelperText,
    getSubmissionScheduleDescription,
    getSubmissionScheduleSummary,
    getWeekdayKey,
    getWorkspaceTimezone,
    isAutoReportingFrequency,
    parseAutoReportingOffset,
    sortSemiMonthlyOffsets,
};
export type {AutoReportingFrequency, AutoReportingOffsets};
