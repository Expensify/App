import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';
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

/**
 * From visible report actions sorted newest-first, returns the latest ADD_COMMENT from the current user that looks like a Chronos timer command.
 */
function getLatestUserChronosTimerCommand(sortedVisibleReportActionsDesc: ReportAction[], currentUserAccountID: number): ChronosTimerCommandValue | null {
    for (const action of sortedVisibleReportActionsDesc) {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            continue;
        }
        if (action.actorAccountID !== currentUserAccountID) {
            continue;
        }
        const kind = isChronosStartOrStopMessage(getReportActionText(action as GetReportActionTextArg));
        if (kind !== null) {
            return kind;
        }
    }
    return null;
}

function isChronosTimerRunningFromVisibleActions(sortedVisibleReportActionsDesc: ReportAction[], currentUserAccountID: number): boolean {
    return getLatestUserChronosTimerCommand(sortedVisibleReportActionsDesc, currentUserAccountID) === CONST.CHRONOS.TIMER_COMMAND.START;
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

export type {ChronosTimerCommandValue};
export {
    buildOOOCommand,
    getLatestUserChronosTimerCommand,
    isChronosOOOListAction,
    isChronosStartOrStopMessage,
    isChronosTimerRunningFromVisibleActions,
    isConsecutiveChronosAutomaticTimerAction,
};
