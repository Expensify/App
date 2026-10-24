/**
 * Builds the ordered list of completed and upcoming workflow steps shown on the ReportHistoryPage.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getNextStepETA} from '@libs/NextStepUtils';
import Parser from '@libs/Parser';
import {
    getChangedApproverActionMessage,
    getDelegateSubmitMessage,
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
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type {ReportUpcomingStep} from '@src/types/onyx/ReportUpcomingSteps';

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
): ReportHistoryStep {
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
    return {...step, icon: 'MoneyBag', label: translate('reportHistoryPage.toPay')};
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
}: GetReportHistoryStepsParams): ReportHistoryStep[] {
    const completedSteps: ReportHistoryStep[] = [];
    for (const [key, reportAction] of Object.entries(reportActions ?? {})) {
        // The backend writes companion actions next to some steps, like a MARKED_REIMBURSED beside the PAY, and the report hides them
        if (
            reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
            !shouldReportActionBeVisible(reportAction, key, undefined, currentUserAccountID, reportID, false, reportActions)
        ) {
            continue;
        }
        const step = getCompletedStep(translate, reportAction, currentUserEmail, reportOwnerAccountID);
        if (step) {
            completedSteps.push(step);
        }
    }
    completedSteps.sort((a, b) => ((a.created ?? '') < (b.created ?? '') ? -1 : 1));

    return [...completedSteps, ...upcomingSteps.map((upcomingStep, index) => getUpcomingStep(translate, dateFnsLocale, upcomingStep, index, nextStep))];
}

export default getReportHistorySteps;
