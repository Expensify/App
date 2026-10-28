import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {ThemeColors} from '@styles/theme/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions, ReportMetadata, Rule, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {addMonths, format, isPast, parseISO, setDate} from 'date-fns';
import {Str} from 'expensify-common';

import Log from './Log';
import {getApprovalWorkflow, getCorrectedAutoReportingFrequency, getReimbursementChoice, getReimburserAccountID, hasDynamicExternalWorkflow, isArchivedPolicy} from './PolicyUtils';
import {getOriginalMessage} from './ReportActionMessageUtils';
import {hasPendingDEWApprove, hasPendingDEWSubmit} from './ReportActionsUtils';
import {isDynamicExternalWorkflowApproveFailedAction} from './ReportActionTypeGuards';
import {
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getDisplayNameForParticipant,
    getMoneyRequestSpendBreakdown,
    getNextApproverAccountID,
    getReasonAndReportActionThatRequiresAttention,
    isExpenseReport,
    isInvoiceReport,
    isOpenExpenseReport,
    isPayer,
    isReportOwner,
    shouldBlockSubmitDueToPreventSelfApproval,
    shouldBlockSubmitDueToStrictPolicyRules,
    shouldShowMarkAsDone,
} from './ReportUtils';
import {hasSubmissionBlockingViolationInList} from './TransactionUtils';

type BuildOptimisticNextStepParams = {
    report: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    currentUserAccountIDParam?: number;
    currentUserEmailParam?: string;
    hasViolations?: boolean;
    isASAPSubmitBetaEnabled?: boolean;
    predictedNextStatus: ValueOf<typeof CONST.REPORT.STATUS_NUM>;
    shouldFixViolations?: boolean;
    isUnapprove?: boolean;
    isReopen?: boolean;
    isRejectedReport?: boolean;
    /**
     * Bypass Next Approver ID is used when an approver is bypassed so that we can show the next approver in the chain.
     * This is necessary in the case where report actions are not yet updated to determine the bypass action.
     */
    bypassNextApproverID?: number;
    isTrackIntentUser: boolean | undefined;
    translate?: LocaleContextProps['translate'];
    rules: OnyxCollection<Rule>;
};

function buildNextStepMessage(
    nextStep: ReportNextStep,
    translate: LocaleContextProps['translate'],
    dateFnsLocale: DateFnsLocale | undefined,
    currentUserAccountID: number,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): string {
    if (!nextStep.messageKey) {
        Log.warn('NextStep missing messageKey', {nextStep});
        return '';
    }

    // Escape actor name to prevent HTML injection since this will be rendered as HTML
    const actor = Str.safeEscape(getDisplayNameForParticipant({accountID: nextStep.actorAccountID, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}) ?? '');
    let actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>;
    if (nextStep.actorAccountID === currentUserAccountID) {
        actorType = CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER;
    } else if (nextStep.actorAccountID === -1) {
        actorType = CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN;
    } else {
        actorType = CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER;
    }

    let eta: string | undefined;
    let etaType: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE> | undefined;
    if (nextStep.eta?.etaKey) {
        eta = translate(`nextStep.eta.${nextStep.eta.etaKey}`);
        etaType = CONST.NEXT_STEP.ETA_TYPE.KEY;
    } else if (nextStep.eta?.dateTime) {
        const formatString = nextStep.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT ? CONST.DATE.ORDINAL_DAY_OF_MONTH : CONST.DATE.LONG_DATE_FORMAT_WITH_WEEKDAY;
        // `eta.dateTime` is a date-only string (yyyy-MM-dd). Native `new Date(...)` parses it as UTC midnight,
        // which shifts the day back by one when formatted in a UTC-negative timezone. `parseISO` parses it as
        // local midnight so the rendered day matches the day set in the workspace settings.
        eta = format(parseISO(nextStep.eta.dateTime), formatString, {locale: dateFnsLocale});
        etaType = CONST.NEXT_STEP.ETA_TYPE.DATE_TIME;
    }

    const requiredDepositCurrency = nextStep.requiredDepositCurrency ? Str.htmlEncode(nextStep.requiredDepositCurrency) : undefined;

    const message = translate(`nextStep.message.${nextStep.messageKey}`, {actor, actorType, eta, etaType, requiredDepositCurrency});
    if (!message) {
        Log.warn('Built NextStep message is empty', {nextStep});
        return '';
    }
    return `<next-step>${message}</next-step>`;
}

function doesReportContainTransactions(report: OnyxEntry<Report>): boolean {
    return (report?.transactionCount ?? 0) > 0;
}

function buildOptimisticNextStep(params: BuildOptimisticNextStepParams): ReportNextStep | null {
    const {
        report,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        predictedNextStatus,
        shouldFixViolations,
        isUnapprove,
        isReopen,
        isRejectedReport: isRejectedReportParam,
        bypassNextApproverID,
        isTrackIntentUser,
        rules,
    } = params;

    if (!isExpenseReport(report)) {
        return null;
    }

    const {ownerAccountID = -1} = report ?? {};
    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);
    const isInstantSubmitEnabled = autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
    const shouldShowFixMessage = hasViolations && isInstantSubmitEnabled && !isASAPSubmitBetaEnabled;
    const hasTransactions = doesReportContainTransactions(report);
    const approverAccountID = bypassNextApproverID ?? getNextApproverAccountID(report, rules, isUnapprove);
    const reimburserAccountID = getReimburserAccountID(policy);
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    const nextStepFixOrPayExpense: ReportNextStep = {
        messageKey: shouldShowFixMessage ? CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES : CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        // eslint-disable-next-line rulesdir/no-default-id-values
        actorAccountID: shouldShowFixMessage ? ownerAccountID : (policy?.ownerAccountID ?? -1),
    };

    const nextStepNoActionRequired: ReportNextStep = {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
    };

    let nextStep: ReportNextStep | null;

    switch (predictedNextStatus) {
        // Generates an optimistic nextStep once a report has been opened
        case CONST.REPORT.STATUS_NUM.OPEN:
            if (isRejectedReportParam) {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };
                break;
            }
            if ((isASAPSubmitBetaEnabled && hasViolations && isInstantSubmitEnabled) || shouldFixViolations) {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };
                break;
            }
            if (isReopen) {
                nextStep = {
                    messageKey: shouldShowMarkAsDone({isTrackIntentUser, report, policy, rules})
                        ? CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE
                        : CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };
                break;
            }

            // Self review
            nextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: ownerAccountID,
            };

            // Scheduled submit enabled
            if (policy?.harvesting?.enabled && hasTransactions) {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };

                switch (autoReportingFrequency) {
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT:
                        nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.SHORTLY};
                        break;
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE:
                        nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.TODAY};
                        break;
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
                        nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK};
                        break;
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
                        nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY};
                        break;
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
                        if (policy?.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                            nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH};
                        } else if (policy?.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                            nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH};
                        } else if (policy?.autoReportingOffset !== undefined) {
                            let etaDateTime = setDate(new Date(), policy?.autoReportingOffset);
                            if (isPast(etaDateTime)) {
                                etaDateTime = addMonths(etaDateTime, 1);
                            }

                            nextStep.eta = {dateTime: format(etaDateTime, 'yyyy-MM-dd')};
                        }
                        break;
                    case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP:
                        nextStep.eta = {etaKey: CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP};
                        break;
                    default:
                        break;
                }
                break;
            }

            // Manual submission
            if (hasTransactions && !policy?.harvesting?.enabled) {
                nextStep = {
                    messageKey: shouldShowMarkAsDone({
                        isTrackIntentUser,
                        report,
                        policy,
                        rules,
                    })
                        ? CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE
                        : CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };
                break;
            }
            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            if (policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL) {
                nextStep = reimbursableSpend === 0 ? nextStepNoActionRequired : nextStepFixOrPayExpense;
                break;
            }

            // We want to show pending approval next step for cases where the policy has approvals enabled
            const policyApprovalMode = getApprovalWorkflow(policy);
            if ([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policyApprovalMode)) {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: approverAccountID,
                };
            } else {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: isPayer(currentUserAccountIDParam, currentUserEmailParam, report, undefined) ? currentUserAccountIDParam : -1,
                };
            }
            break;
        }

        // Generates an optimistic nextStep once a report has been closed for example in the case of Submit and Close approval flow
        case CONST.REPORT.STATUS_NUM.CLOSED:
            nextStep = nextStepNoActionRequired;
            break;

        // Generates an optimistic nextStep once a report has been paid
        case CONST.REPORT.STATUS_NUM.REIMBURSED:
            nextStep = nextStepNoActionRequired;
            break;

        // Generates an optimistic nextStep once a report has been approved
        case CONST.REPORT.STATUS_NUM.APPROVED: {
            const reimbursementChoice = getReimbursementChoice(policy);
            const isReimbursementDisabled = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

            // The server returns no further action for approved reports on workspaces that reimburse outside Expensify (Indirect)
            const isReimbursementManual = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
            if (isInvoiceReport(report) || reimbursableSpend === 0 || isReimbursementDisabled || isReimbursementManual) {
                nextStep = nextStepNoActionRequired;
                break;
            }

            // The report still needs to be paid whether or not the approver is the one who pays it.
            nextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: reimburserAccountID,
            };
            break;
        }

        // Clear nextStep
        default:
            nextStep = null;
    }

    return nextStep;
}

function buildOptimisticNextStepForPreventSelfApprovalsEnabled(): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
    };
}

function buildOptimisticFixIssueNextStep(ownerAccountID: number): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        actorAccountID: ownerAccountID,
    };
}

function buildChangeWorkspaceNextStep(): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.CHANGE_WORKSPACE,
        icon: CONST.NEXT_STEP.ICONS.BOX,
    };
}

function buildOptimisticNoFurtherActionNextStep(): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
    };
}

function buildOptimisticNextStepForStrictPolicyRuleViolations(): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.STRICT_POLICY_RULE_VIOLATIONS,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
    };
}

function buildOptimisticNextStepForDynamicExternalWorkflowSubmitError(iconFill?: string): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.DYNAMIC_EXTERNAL_WORKFLOW_SUBMIT_ERROR,
        icon: CONST.NEXT_STEP.ICONS.DOT_INDICATOR,
        iconFill,
    };
}
function buildOptimisticNextStepForDynamicExternalWorkflowApproveError(iconFill?: string): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.DYNAMIC_EXTERNAL_WORKFLOW_APPROVE_ERROR,
        icon: CONST.NEXT_STEP.ICONS.DOT_INDICATOR,
        iconFill,
    };
}

function buildOptimisticNextStepForDEWOffline(): ReportNextStep {
    return {
        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.DYNAMIC_EXTERNAL_WORKFLOW_OFFLINE,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
    };
}

type GetReportNextStepParams = {
    currentUserLogin: string;
    currentUserEmail: string;
    currentUserAccountID: number;
    report: OnyxEntry<Report>;
    reportMetadata: ReportMetadata | undefined;
    reportActions: ReportAction[];
    transactions: Record<string, Transaction>;
    violations: Record<string, TransactionViolations>;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    areStrictPolicyRulesEnabled: boolean;
    isReportArchived: boolean;
    theme: ThemeColors | undefined;
    isOffline: boolean;
};

function getReportNextStep({
    currentUserLogin,
    currentUserEmail,
    currentUserAccountID,
    report,
    reportMetadata,
    reportActions,
    transactions,
    violations,
    policy,
    rules,
    areStrictPolicyRulesEnabled,
    isReportArchived,
    theme,
    isOffline,
}: GetReportNextStepParams): ReportNextStep | undefined {
    // Reports on an archived workspace can't be acted on until they're moved to another workspace
    if (isArchivedPolicy(policy)) {
        return buildChangeWorkspaceNextStep();
    }

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    if (isDEWPolicy && (report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN || report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED)) {
        if (report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
            const reportActionsObject = reportActions.reduce<ReportActions>((acc, action) => {
                if (action.reportActionID) {
                    acc[action.reportActionID] = action;
                }
                return acc;
            }, {});
            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActionsObject, transactions, currentUserAccountID);
            if (errors?.dewSubmitFailed) {
                return buildOptimisticNextStepForDynamicExternalWorkflowSubmitError(theme?.danger);
            }
            if (isOffline && hasPendingDEWSubmit(reportMetadata, isDEWPolicy)) {
                return buildOptimisticNextStepForDEWOffline();
            }
        } else if (report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            const gbrResult = getReasonAndReportActionThatRequiresAttention({
                optionOrReport: report,
                currentUserLogin,
                currentUserAccountID,
                transactionViolations: violations,
                isReportArchived,
                reportMetadata,
            });
            const hasDEWApproveFailed = gbrResult?.reason === CONST.REQUIRES_ATTENTION_REASONS.HAS_DEW_APPROVE_FAILED;
            if (shouldShowDynamicExternalWorkflowApproveErrorNextStep(gbrResult?.reportAction, hasDEWApproveFailed)) {
                return buildOptimisticNextStepForDynamicExternalWorkflowApproveError(theme?.danger);
            }
            if (isOffline && hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
                return buildOptimisticNextStepForDEWOffline();
            }
        }
    }

    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        report?.reportID,
        violations,
        areStrictPolicyRulesEnabled,
        currentUserAccountID,
        currentUserEmail,
        Object.values(transactions),
    );
    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(report) && isOpenExpenseReport(report)) {
        return buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    if (
        isOpenExpenseReport(report) &&
        Object.values(transactions).length > 0 &&
        Object.values(transactions).every(
            (transaction) => !!transaction && hasSubmissionBlockingViolationInList(violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]),
        )
    ) {
        // eslint-disable-next-line rulesdir/no-default-id-values -- actorAccountID can be -1 for unspecified owner
        return buildOptimisticFixIssueNextStep(report?.ownerAccountID ?? -1);
    }

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    if (shouldBlockSubmitDueToPreventSelfApproval(report, policy, rules)) {
        return buildOptimisticNextStepForPreventSelfApprovalsEnabled();
    }

    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const shouldShowNoFurtherAction =
        reimbursableSpend === 0 &&
        (report?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED || (report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED && policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL));
    if (shouldShowNoFurtherAction) {
        return buildOptimisticNoFurtherActionNextStep();
    }

    return report?.nextStep;
}

/**
 * Whether to show the DEW approve-error next step.
 * Only manual approve failures (`automaticAction` false/absent) should show it. Auto-approval blocks keep the normal
 * workflow next step. The approver check is not repeated here: `hasDEWApproveFailed` comes from the
 * `HAS_DEW_APPROVE_FAILED` reason, which is already gated on the current user being the report manager.
 */
function shouldShowDynamicExternalWorkflowApproveErrorNextStep(reportAction: OnyxEntry<ReportAction>, hasDEWApproveFailed: boolean): boolean {
    if (!hasDEWApproveFailed || !isDynamicExternalWorkflowApproveFailedAction(reportAction)) {
        return false;
    }

    const {automaticAction} = getOriginalMessage(reportAction) ?? {};
    return !automaticAction;
}

export {getReportNextStep, buildNextStepMessage, buildOptimisticNextStep, buildOptimisticNextStepForPreventSelfApprovalsEnabled, shouldShowDynamicExternalWorkflowApproveErrorNextStep};
