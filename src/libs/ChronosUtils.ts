import {addDays, addHours, addMinutes, addMonths, differenceInCalendarDays, format, parseISO} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';
import {replaceCommasWithPeriod} from './MoneyRequestUtils';
import {getReportActionText} from './ReportActionsUtils';

type GetReportActionTextArg = Parameters<typeof getReportActionText>[0];

/**
 * Next visible report action after `actionIndex` in a newest-first list (same behavior as `findPreviousAction` in ReportActionsUtils).
 */
function findPreviousVisibleReportAction(reportActions: ReportAction[], actionIndex: number, isOffline: boolean): OnyxEntry<ReportAction> {
    for (let i = actionIndex + 1; i < reportActions.length; i++) {
        const action = reportActions.at(i);

        if (!isOffline && action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        if (action?.shouldShow === false) {
            continue;
        }

        return action;
    }

    return undefined;
}

function isChronosOOOListAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST> {
    const action = reportAction as {actionName?: string} | null | undefined;
    return action?.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST;
}

// The entire trimmed message must be a timer command (not a word embedded in normal chat). Case-insensitive.
// "at ..." is only allowed after past-tense "started"/"stopped" so phrases like "stop at the corner" do not match.
const CHRONOS_TIMER_COMMAND_STOP_REGEX = /^(?:stop(?:ping)?(?:\s+now)?|stopped(?:\s+now)?(?:\s+at\b.*)?)$/i;
const CHRONOS_TIMER_COMMAND_START_REGEX = /^(?:start(?:ing)?(?:\s+now)?|started(?:\s+now)?(?:\s+at\b.*)?)$/i;

type ChronosTimerCommandValue = ValueOf<typeof CONST.CHRONOS.TIMER_COMMAND>;

/**
 * Returns `CONST.CHRONOS.TIMER_COMMAND.START`, `CONST.CHRONOS.TIMER_COMMAND.STOP`, or `null` when the trimmed text is only a Chronos timer command (e.g. "start", "stop now", "started at …", "stopped at …"), not when "start"/"stop" appear inside a sentence.
 */
function isChronosStartOrStopMessage(text: string): ChronosTimerCommandValue | null {
    const trimmedText = text.trim();
    if (CHRONOS_TIMER_COMMAND_STOP_REGEX.test(trimmedText)) {
        return CONST.CHRONOS.TIMER_COMMAND.STOP;
    }
    if (CHRONOS_TIMER_COMMAND_START_REGEX.test(trimmedText)) {
        return CONST.CHRONOS.TIMER_COMMAND.START;
    }
    return null;
}

function isChronosAutomaticTimerAction(reportAction: OnyxEntry<ReportAction>, isChronosReport: boolean): boolean {
    return isChronosReport && isChronosStartOrStopMessage(getReportActionText(reportAction as GetReportActionTextArg)) !== null;
}

function getTimeOfChronosTimerRunningFromVisibleActions(sortedVisibleReportActionsDesc: ReportAction[], currentUserAccountID: number): string | null {
    for (const action of sortedVisibleReportActionsDesc) {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            continue;
        }
        if (action.actorAccountID !== currentUserAccountID) {
            continue;
        }
        const kind = isChronosStartOrStopMessage(getReportActionText(action as GetReportActionTextArg));
        if (kind === CONST.CHRONOS.TIMER_COMMAND.START) {
            return action.created;
        }
        if (kind !== null) {
            return null;
        }
    }
    return null;
}

/**
 * If the user sends consecutive actions to Chronos to automatically start/stop the timer,
 * then detect that and show each individually so that the user can easily see when they were sent.
 */
function isConsecutiveChronosAutomaticTimerAction(reportActions: ReportAction[], actionIndex: number, isChronosReport: boolean, isOffline: boolean): boolean {
    const previousAction = findPreviousVisibleReportAction(reportActions, actionIndex, isOffline);
    const currentAction = reportActions?.at(actionIndex);
    return isChronosAutomaticTimerAction(currentAction, isChronosReport) && isChronosAutomaticTimerAction(previousAction, isChronosReport);
}

/**
 * Parse a YYYY-MM-DD string into a Date, returning null when invalid.
 */
function parseDate(value: string): Date | null {
    if (!value) {
        return null;
    }
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Computes the calendar end date to display for a start date and duration, matching how the chronos
 * backend turns "ooo {start} for N {unit}" into an end date: whole day, week, and month durations end
 * on the last covered calendar day, while fractional day and hour durations carry the remaining time
 * into the end day. Returns an empty string for an invalid start date and the start date itself
 * for a non-positive duration.
 */
function computeEndDate(startDate: string, durationAmount: string, durationUnit: string): string {
    const start = parseDate(startDate);
    if (!start) {
        return '';
    }
    const sanitized = replaceCommasWithPeriod(durationAmount.trim());
    const amount = Number.parseFloat(sanitized);
    if (!Number.isFinite(amount) || amount <= 0) {
        return startDate;
    }
    const whole = Math.floor(amount);
    const fraction = amount - whole;
    switch (durationUnit) {
        case CONST.CHRONOS.OOO_DURATION_UNITS.DAY:
            // Whole-day durations end on the last covered calendar day; a fractional day carries the remaining hours into the end day.
            if (fraction === 0) {
                return format(addDays(start, Math.max(0, whole - 1)), CONST.DATE.FNS_FORMAT_STRING);
            }
            return format(addHours(addDays(start, whole), Math.ceil(fraction * 24)), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.WEEK:
            // The backend uses whole weeks only.
            return format(addDays(start, Math.max(0, whole * 7 - 1)), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.MONTH:
            // The backend uses whole months only.
            return format(addDays(addMonths(start, whole), -1), CONST.DATE.FNS_FORMAT_STRING);
        case CONST.CHRONOS.OOO_DURATION_UNITS.HOUR:
        default:
            // Hours add to the start time; the end day only advances once the added time crosses midnight.
            return format(addMinutes(addHours(start, whole), Math.ceil(fraction * 60)), CONST.DATE.FNS_FORMAT_STRING);
    }
}

/**
 * Inverse of `computeEndDate` for the day unit: end - start + 1 (inclusive of both days).
 * Returns null when the dates are missing or the end precedes the start.
 */
function computeDurationDays(startDate: string, endDate: string): number | null {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) {
        return null;
    }
    const diff = differenceInCalendarDays(end, start);
    if (diff < 0) {
        return null;
    }
    return diff + 1;
}

type OOOCommandParams = {
    date: string;
    time?: string;
    durationAmount?: string;
    durationUnit?: string;
    reason?: string;
    workingPercentage?: string;
};

function buildOOOCommand({date, time, durationAmount, durationUnit, reason, workingPercentage}: OOOCommandParams): string {
    let command = `ooo ${date}`;

    if (time) {
        command += ` ${time}`;
    }

    if (durationAmount && durationUnit) {
        command += ` for ${durationAmount} ${durationUnit}`;
    }

    if (reason) {
        command += ` ${reason}`;
    }

    if (workingPercentage) {
        const sanitized = workingPercentage.replaceAll('%', '').trim();
        if (sanitized) {
            command += ` ${sanitized}%`;
        }
    }

    return command;
}

export {
    buildOOOCommand,
    computeDurationDays,
    computeEndDate,
    getTimeOfChronosTimerRunningFromVisibleActions,
    isChronosOOOListAction,
    isChronosStartOrStopMessage,
    isConsecutiveChronosAutomaticTimerAction,
    parseDate,
};
