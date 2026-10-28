/**
 * Builds the ordered list of completed and upcoming workflow steps shown on the ReportHistoryPage.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getNextStepETA, getUpcomingStepActionForNextStep} from '@libs/NextStepUtils';
import Parser from '@libs/Parser';
import {
    getChangedApproverActionMessage,
    getDelegateSubmitMessage,
    getSortedReportActions,
    hasPendingDEWApprove,
    hasPendingDEWSubmit,
    isActionOfType,
    isApprovedAction,
    isForwardedAction,
    isPayAction,
    isReopenedAction,
    isRetractedAction,
    isSubmittedAction,
    isSubmittedAndClosedAction,
    isUnapprovedAction,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {ReportAction, ReportActions, ReportMetadata} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type {ReportUpcomingStep, ReportUpcomingStepAction} from '@src/types/onyx/ReportUpcomingSteps';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';

import type {ReportHistoryStep} from './types';

type GetReportHistoryStepsParams = {
    translate: LocalizedTranslate;
    dateFnsLocale: DateFnsLocale | undefined;
    currentUserEmail: string | undefined;
    currentUserAccountID: number | undefined;
    reportID: string | undefined;

    /** Shown as the creator when the created action has no actor */
    reportOwnerAccountID: number | undefined;
    reportActions: OnyxEntry<ReportActions>;
    upcomingSteps: ReportUpcomingStep[];
    nextStep: ReportNextStep | undefined;
    isOpenReport: boolean;
    isDEWPolicy: boolean;
    reportMetadata: OnyxEntry<ReportMetadata>;
};

function getCompletedStep(
    translate: LocalizedTranslate,
    reportAction: ReportAction,
    currentUserEmail: string | undefined,
    reportOwnerAccountID: number | undefined,
): ReportHistoryStep | undefined {
    const step = {key: reportAction.reportActionID, accountID: reportAction.actorAccountID, created: reportAction.created, isUpcoming: false};

    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED)) {
        return {...step, accountID: reportAction.actorAccountID ?? reportOwnerAccountID, icon: 'Receipt', label: translate('reportHistoryPage.created')};
    }
    if (isSubmittedAction(reportAction) || isSubmittedAndClosedAction(reportAction)) {
        return {...step, icon: 'Send', label: translate('reportHistoryPage.submitted')};
    }
    if (isApprovedAction(reportAction) || isForwardedAction(reportAction)) {
        return {...step, icon: 'ThumbsUp', label: translate('reportHistoryPage.approved')};
    }
    if (isUnapprovedAction(reportAction)) {
        return {...step, icon: 'CircularArrowBackwards', label: translate('iou.unapproved')};
    }
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REJECTED) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REJECTED_TO_SUBMITTER)) {
        return {...step, icon: 'ThumbsDown', label: translate('iou.rejectedThisReport')};
    }
    if (isRetractedAction(reportAction)) {
        return {...step, icon: 'CircularArrowBackwards', label: translate('iou.retracted')};
    }
    if (isReopenedAction(reportAction)) {
        return {...step, icon: 'CircularArrowBackwards', label: translate('iou.reopened')};
    }
    if (isPayAction(reportAction) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return {...step, icon: 'MoneyBag', label: translate('reportHistoryPage.paid')};
    }
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED)) {
        return {...step, icon: 'Clear', label: translate('iou.adminCanceledRequest')};
    }
    if (
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
    ) {
        return {...step, icon: 'Workflows', label: Parser.htmlToText(getChangedApproverActionMessage(translate, reportAction))};
    }
    if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT)) {
        const message = getDelegateSubmitMessage(translate, reportAction, currentUserEmail);
        return message ? {...step, accountID: undefined, icon: 'Workflows', label: Parser.htmlToText(message)} : undefined;
    }
    return undefined;
}

function getUpcomingStep(
    translate: LocalizedTranslate,
    dateFnsLocale: DateFnsLocale | undefined,
    upcomingStep: ReportUpcomingStep,
    index: number,
    nextStep: ReportNextStep | undefined,
): ReportHistoryStep | undefined {
    const step = {key: `${upcomingStep.action}_${upcomingStep.actorAccountID}_${index}`, accountID: upcomingStep.actorAccountID, isUpcoming: true};

    if (upcomingStep.action === CONST.REPORT.UPCOMING_STEP_ACTION.SUBMIT) {
        // The backend doesn't send the automatic submit date with the step, so it comes from the next step
        if (nextStep?.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT) {
            const {eta, etaType} = getNextStepETA(nextStep, translate, dateFnsLocale);
            return {...step, icon: 'Send', label: translate('reportHistoryPage.toSubmitAutomatically', eta, etaType)};
        }
        return {...step, icon: 'Send', label: translate('reportHistoryPage.toSubmit')};
    }
    if (upcomingStep.action === CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE) {
        return {...step, icon: 'ThumbsUp', label: translate('reportHistoryPage.toApprove')};
    }
    if (upcomingStep.action === CONST.REPORT.UPCOMING_STEP_ACTION.PAY) {
        return {...step, icon: 'MoneyBag', label: translate('reportHistoryPage.toPay')};
    }
    return undefined;
}

function getUpcomingStepActionForReportAction(reportAction: ReportAction): ReportUpcomingStepAction | undefined {
    if (isSubmittedAction(reportAction) || isSubmittedAndClosedAction(reportAction)) {
        return CONST.REPORT.UPCOMING_STEP_ACTION.SUBMIT;
    }
    if (isApprovedAction(reportAction) || isForwardedAction(reportAction)) {
        return CONST.REPORT.UPCOMING_STEP_ACTION.APPROVE;
    }
    if (isPayAction(reportAction)) {
        return CONST.REPORT.UPCOMING_STEP_ACTION.PAY;
    }
    return undefined;
}

/**
 * The upcoming steps are a backend snapshot that no action updates, so they go stale once the report moves on, including offline.
 * The next step is updated optimistically, so it decides which upcoming step is the current one.
 */
function getCurrentUpcomingSteps(
    upcomingSteps: ReportUpcomingStep[],
    nextStep: ReportNextStep | undefined,
    isOpenReport: boolean,
    queuedDEWAction: ReportAction | undefined,
): ReportUpcomingStep[] {
    if (nextStep?.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION) {
        return [];
    }

    let steps = upcomingSteps;
    const currentAction = getUpcomingStepActionForNextStep(nextStep, isOpenReport);
    const currentActorAccountID = nextStep?.actorAccountID !== undefined && nextStep.actorAccountID > 0 ? nextStep.actorAccountID : undefined;
    if (currentAction) {
        const currentIndex = steps.findIndex((step) => step.action === currentAction && (currentActorAccountID === undefined || step.actorAccountID === currentActorAccountID));
        if (currentIndex !== -1) {
            steps = steps.slice(currentIndex);
        } else if (currentActorAccountID !== undefined) {
            // The report moved back a step, e.g. a retract, so the current step is missing from the snapshot
            steps = [{action: currentAction, actorAccountID: currentActorAccountID}, ...steps];
        }
    }

    // Dynamic External Workflow actions don't update the next step optimistically, so the queued action marks its step as done
    const [firstStep] = steps;
    if (queuedDEWAction && firstStep?.actorAccountID === queuedDEWAction.actorAccountID && firstStep.action === getUpcomingStepActionForReportAction(queuedDEWAction)) {
        steps = steps.slice(1);
    }

    return steps;
}

function getReportHistorySteps({
    translate,
    dateFnsLocale,
    currentUserEmail,
    currentUserAccountID,
    reportID,
    reportOwnerAccountID,
    reportActions,
    upcomingSteps,
    nextStep,
    isOpenReport,
    isDEWPolicy,
    reportMetadata,
}: GetReportHistoryStepsParams): ReportHistoryStep[] {
    const completedSteps: ReportHistoryStep[] = [];
    let lastStepAction: ReportAction | undefined;
    for (const reportAction of getSortedReportActions(Object.values(reportActions ?? {}))) {
        // The backend writes companion actions next to some steps, like a MARKED_REIMBURSED beside the PAY, and the report hides them
        if (
            reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
            !shouldReportActionBeVisible(reportAction, reportAction.reportActionID, undefined, currentUserAccountID, reportID, false, reportActions)
        ) {
            continue;
        }
        const step = getCompletedStep(translate, reportAction, currentUserEmail, reportOwnerAccountID);
        if (step) {
            completedSteps.push(step);
            lastStepAction = reportAction;
        }
    }

    // Only the latest step can still be queued, because a later step like an unapprove or a retract undoes it
    const isLastStepQueuedForDEW =
        lastStepAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        ((hasPendingDEWSubmit(reportMetadata, isDEWPolicy) && isSubmittedAction(lastStepAction)) ||
            (hasPendingDEWApprove(reportMetadata, isDEWPolicy) && (isApprovedAction(lastStepAction) || isForwardedAction(lastStepAction))));

    const currentUpcomingSteps = getCurrentUpcomingSteps(upcomingSteps, nextStep, isOpenReport, isLastStepQueuedForDEW ? lastStepAction : undefined)
        .map((upcomingStep, index) => getUpcomingStep(translate, dateFnsLocale, upcomingStep, index, nextStep))
        .filter((step): step is ReportHistoryStep => !!step);

    return [...completedSteps, ...currentUpcomingSteps];
}

export default getReportHistorySteps;
