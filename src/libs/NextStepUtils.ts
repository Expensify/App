import {addMonths, format, isPast, setDate} from 'date-fns';
import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Policy, Report, ReportNextStepDeprecated} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type {Message} from '@src/types/onyx/ReportNextStepDeprecated';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DateUtils from './DateUtils';
import EmailUtils from './EmailUtils';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
import {getLoginsByAccountIDs, getPersonalDetailsByIDs} from './PersonalDetailsUtils';
import {getApprovalWorkflow, getCorrectedAutoReportingFrequency, getReimburserAccountID} from './PolicyUtils';
import {
    getDisplayNameForParticipant,
    getMoneyRequestSpendBreakdown,
    getNextApproverAccountID,
    getPersonalDetailsForAccountID,
    isExpenseReport,
    isInvoiceReport,
    isPayer,
} from './ReportUtils';

type BuildNextStepNewParams = {
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
    /**
     * Bypass Next Approver ID is used when an approver is bypassed so that we can show the next approver in the chain.
     * This is necessary in the case where report actions are not yet updated to determine the bypass action.
     */
    bypassNextApproverID?: number;
};

function buildNextStepMessage(nextStep: ReportNextStep, translate: LocaleContextProps['translate'], currentUserAccountID: number): string {
    const actor = getDisplayNameForParticipant({accountID: nextStep.actorAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils});
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
        eta = DateUtils.formatToLongDateWithWeekday(nextStep.eta.dateTime);
        etaType = CONST.NEXT_STEP.ETA_TYPE.DATE_TIME;
    }

    return `<next-step>${translate(`nextStep.message.${nextStep.messageKey}`, {actor, actorType, eta, etaType})}</next-step>`;
}

function buildOptimisticNextStep(params: BuildNextStepNewParams): ReportNextStep | null {
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
        bypassNextApproverID,
    } = params;

    if (!isExpenseReport(report)) {
        return null;
    }

    const {ownerAccountID = -1} = report ?? {};
    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);
    const isInstantSubmitEnabled = autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
    const shouldShowFixMessage = hasViolations && isInstantSubmitEnabled && !isASAPSubmitBetaEnabled;
    const isReportContainingTransactions =
        report &&
        ((report.total !== 0 && report.total !== undefined) ||
            (report.unheldTotal !== 0 && report.unheldTotal !== undefined) ||
            (report.unheldNonReimbursableTotal !== 0 && report.unheldNonReimbursableTotal !== undefined));
    const approverAccountID = bypassNextApproverID ?? getNextApproverAccountID(report, isUnapprove);
    const reimburserAccountID = getReimburserAccountID(policy);
    const hasValidAccount = !!policy?.achAccount?.accountNumber || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

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
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
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
            if (policy?.harvesting?.enabled && isReportContainingTransactions) {
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
            if (report?.total !== 0 && !policy?.harvesting?.enabled) {
                nextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: ownerAccountID,
                };
                break;
            }
            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            if (policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL) {
                nextStep = nextStepFixOrPayExpense;
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
        case CONST.REPORT.STATUS_NUM.APPROVED:
            if (isInvoiceReport(report) || !isPayer(currentUserAccountIDParam, currentUserEmailParam, report, undefined)) {
                nextStep = nextStepNoActionRequired;
                break;
            }

            // Self review
            nextStep = {
                messageKey: hasValidAccount ? CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY : CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: reimburserAccountID,
            };
            break;

        // Clear nextStep
        default:
            nextStep = null;
    }

    return nextStep;
}

function parseMessage(messages: Message[] | undefined, currentUserEmail: string) {
    let nextStepHTML = '';
    if (messages) {
        for (const [index, part] of messages.entries()) {
            const isEmail = Str.isValidEmail(part.text);
            let tagType = part.type ?? 'span';
            let content = Str.safeEscape(part.text);

            const previousPart = index !== 0 ? messages.at(index - 1) : undefined;
            const nextPart = messages.at(index + 1);

            if (currentUserEmail === part.text || part.clickToCopyText === currentUserEmail) {
                tagType = 'strong';
                content = nextPart?.text === `'s` ? 'your' : 'you';
            } else if (part.text === `'s` && (previousPart?.text === currentUserEmail || previousPart?.clickToCopyText === currentUserEmail)) {
                content = '';
            } else if (isEmail) {
                tagType = 'next-step-email';
                content = EmailUtils.prefixMailSeparatorsWithBreakOpportunities(content);
            }

            nextStepHTML += `<${tagType}>${content}</${tagType}>`;
        }
    }

    const formattedHtml = nextStepHTML.replaceAll('%expenses', 'expenses').replaceAll('%Expenses', 'Expenses').replaceAll('%tobe', 'are');

    return `<next-step>${formattedHtml}</next-step>`;
}

/**
 * @private
 */
function getNextApproverDisplayName(report: OnyxEntry<Report>, isUnapprove?: boolean) {
    const approverAccountID = getNextApproverAccountID(report, isUnapprove);

    return getDisplayNameForParticipant({accountID: approverAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? getPersonalDetailsForAccountID(approverAccountID).login;
}

function buildOptimisticNextStepForPreventSelfApprovalsEnabled() {
    const optimisticNextStep: ReportNextStepDeprecated = {
        type: 'alert',
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: "Oops! Looks like you're submitting to ",
            },
            {
                text: 'yourself',
                type: 'next-step-email',
            },
            {
                text: '. Approving your own reports is ',
            },
            {
                text: 'forbidden',
                type: 'next-step-email',
            },
            {
                text: ' by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.',
            },
        ],
    };

    return optimisticNextStep;
}

function buildOptimisticNextStepForStrictPolicyRuleViolations() {
    const optimisticNextStep: ReportNextStepDeprecated = {
        type: 'alert',
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: 'Waiting for you to fix the issues. Your admins have restricted submission of expenses with violations.',
            },
        ],
    };

    return optimisticNextStep;
}

function buildOptimisticNextStepForDynamicExternalWorkflowError(iconFill?: string) {
    const optimisticNextStep: ReportNextStepDeprecated = {
        type: 'alert',
        icon: CONST.NEXT_STEP.ICONS.DOT_INDICATOR,
        iconFill,
        message: [
            {
                text: "This report can't be submitted. Please review the comments to resolve.",
                type: 'alert-text',
            },
        ],
    };

    return optimisticNextStep;
}

function buildOptimisticNextStepForDEWOfflineSubmission() {
    const optimisticNextStep: ReportNextStepDeprecated = {
        type: 'neutral',
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: 'Waiting for you to come back online to determine next steps.',
            },
        ],
    };

    return optimisticNextStep;
}

/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 * Need to rename this function and remove the buildNextStep function above after migrating to this function
 * @deprecated This function will be removed soon. You should still use it though but also use buildOptimisticNextStep in parallel.
 */
function buildNextStepNew(params: BuildNextStepNewParams): ReportNextStepDeprecated | null {
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
        bypassNextApproverID,
    } = params;

    if (!isExpenseReport(report)) {
        return null;
    }

    const {ownerAccountID = -1} = report ?? {};
    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);
    const isInstantSubmitEnabled = autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
    const shouldShowFixMessage = hasViolations && isInstantSubmitEnabled && !isASAPSubmitBetaEnabled;
    const [policyOwnerPersonalDetails, ownerPersonalDetails] = getPersonalDetailsByIDs({
        accountIDs: [policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, ownerAccountID],
        currentUserAccountID: currentUserAccountIDParam ?? CONST.DEFAULT_NUMBER_ID,
        shouldChangeUserDisplayName: true,
    });
    const isReportContainingTransactions =
        report &&
        ((report.total !== 0 && report.total !== undefined) ||
            (report.unheldTotal !== 0 && report.unheldTotal !== undefined) ||
            (report.unheldNonReimbursableTotal !== 0 && report.unheldNonReimbursableTotal !== undefined));
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    const ownerDisplayName =
        ownerPersonalDetails?.displayName ?? ownerPersonalDetails?.login ?? getDisplayNameForParticipant({accountID: ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils});
    const policyOwnerDisplayName =
        policyOwnerPersonalDetails?.displayName ??
        policyOwnerPersonalDetails?.login ??
        getDisplayNameForParticipant({accountID: policy?.ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils});
    const nextApproverDisplayName = bypassNextApproverID
        ? (getDisplayNameForParticipant({accountID: bypassNextApproverID, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? getPersonalDetailsForAccountID(bypassNextApproverID).login)
        : getNextApproverDisplayName(report, isUnapprove);
    const approverAccountID = bypassNextApproverID ?? getNextApproverAccountID(report, isUnapprove);
    const approvers = getLoginsByAccountIDs([approverAccountID ?? CONST.DEFAULT_NUMBER_ID]);

    const reimburserAccountID = getReimburserAccountID(policy);
    const type: ReportNextStepDeprecated['type'] = 'neutral';
    let optimisticNextStep: ReportNextStepDeprecated | null;

    const nextStepPayExpense = {
        type,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: 'Waiting for ',
            },
            ownerAccountID === -1 || !policy?.ownerAccountID
                ? {
                      text: 'an admin',
                  }
                : {
                      text: shouldShowFixMessage ? ownerDisplayName : policyOwnerDisplayName,
                      type: 'strong',
                  },
            {
                text: ' to ',
            },
            ...(shouldShowFixMessage ? [{text: 'fix the issues'}] : [{text: 'pay'}, {text: ' %expenses.'}]),
        ],
    };

    const noActionRequired = {
        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
        type,
        message: [
            {
                text: 'No further action required!',
            },
        ],
    };

    switch (predictedNextStatus) {
        // Generates an optimistic nextStep once a report has been opened
        case CONST.REPORT.STATUS_NUM.OPEN:
            if ((isASAPSubmitBetaEnabled && hasViolations && isInstantSubmitEnabled) || shouldFixViolations) {
                optimisticNextStep = {
                    type,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    message: [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${ownerDisplayName}`,
                            type: 'strong',
                            clickToCopyText: ownerAccountID === currentUserAccountIDParam ? currentUserEmailParam : '',
                        },
                        {
                            text: ' to ',
                        },
                        {
                            text: 'fix the issues',
                        },
                    ],
                };
                break;
            }
            if (isReopen) {
                optimisticNextStep = {
                    type,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    message: [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${ownerDisplayName}`,
                            type: 'strong',
                            clickToCopyText: ownerAccountID === currentUserAccountIDParam ? currentUserEmailParam : '',
                        },
                        {
                            text: ' to ',
                        },
                        {
                            text: 'submit',
                        },
                        {
                            text: ' %expenses.',
                        },
                    ],
                };
                break;
            }

            // Self review
            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${ownerDisplayName}`,
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountIDParam ? currentUserEmailParam : '',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: isReportContainingTransactions ? 'submit' : 'add',
                    },
                    {
                        text: ' %expenses.',
                    },
                ],
            };

            // Scheduled submit enabled
            if (policy?.harvesting?.enabled && isReportContainingTransactions) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${ownerDisplayName}`,
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountIDParam ? currentUserEmailParam : '',
                    },
                    {
                        text: `'s`,
                        type: 'strong',
                    },
                    {
                        text: ' %expenses to automatically submit',
                    },
                ];
                let harvestingSuffix = '';

                if (autoReportingFrequency) {
                    const currentDate = new Date();
                    let autoSubmissionDate = '';
                    let monthlyText = '';

                    if (policy?.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                        monthlyText = 'on the last day of the month';
                    } else if (policy?.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                        monthlyText = 'on the last business day of the month';
                    } else if (policy?.autoReportingOffset !== undefined) {
                        autoSubmissionDate = format(setDate(currentDate, policy?.autoReportingOffset), CONST.DATE.ORDINAL_DAY_OF_MONTH);
                    }

                    const harvestingSuffixes: Record<DeepValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, string> = {
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: 'later today',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: 'on Sunday',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: 'on the 1st and 16th of each month',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: autoSubmissionDate ? `on the ${autoSubmissionDate} of each month` : monthlyText,
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: 'at the end of their trip',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]: '',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: '',
                    };

                    if (harvestingSuffixes[autoReportingFrequency]) {
                        harvestingSuffix = `${harvestingSuffixes[autoReportingFrequency]}`;
                    }
                }

                optimisticNextStep.message.push({
                    text: ` ${harvestingSuffix}`,
                });
            }

            // Manual submission
            if (report?.total !== 0 && !policy?.harvesting?.enabled) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${ownerDisplayName}`,
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountIDParam ? currentUserEmailParam : '',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'submit',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];
            }

            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            if (policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL) {
                optimisticNextStep = reimbursableSpend === 0 ? noActionRequired : nextStepPayExpense;
                break;
            }
            // Another owner
            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
            };
            // We want to show pending approval next step for cases where the policy has approvals enabled
            const policyApprovalMode = getApprovalWorkflow(policy);
            if ([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policyApprovalMode)) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: nextApproverDisplayName,
                        type: 'strong',
                        clickToCopyText: approvers.at(0),
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'approve',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];
            } else {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    isPayer(currentUserAccountIDParam, currentUserEmailParam, report, undefined)
                        ? {
                              text: `you`,
                              type: 'strong',
                          }
                        : {
                              text: `an admin`,
                          },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'pay',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];
            }

            break;
        }

        // Generates an optimistic nextStep once a report has been closed for example in the case of Submit and Close approval flow
        case CONST.REPORT.STATUS_NUM.CLOSED:
            optimisticNextStep = noActionRequired;

            break;

        // Generates an optimistic nextStep once a report has been paid
        case CONST.REPORT.STATUS_NUM.REIMBURSED:
            optimisticNextStep = noActionRequired;

            break;

        // Generates an optimistic nextStep once a report has been approved
        case CONST.REPORT.STATUS_NUM.APPROVED: {
            if (isInvoiceReport(report) || !isPayer(currentUserAccountIDParam, currentUserEmailParam, report, undefined) || reimbursableSpend === 0) {
                optimisticNextStep = noActionRequired;

                break;
            }
            // Self review
            let payerMessage: Message;
            if (isPayer(currentUserAccountIDParam, currentUserEmailParam, report, undefined)) {
                payerMessage = {text: 'you', type: 'strong'};
            } else if (reimburserAccountID === -1) {
                payerMessage = {text: 'an admin'};
            } else {
                payerMessage = {text: getDisplayNameForParticipant({accountID: reimburserAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}), type: 'strong'};
            }

            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    payerMessage,
                    {
                        text: ' to ',
                    },
                    {
                        text: 'pay',
                    },
                    {
                        text: ' %expenses.',
                    },
                ],
            };
            break;
        }

        // Resets a nextStep
        default:
            optimisticNextStep = null;
    }

    return optimisticNextStep;
}

export {
    buildNextStepMessage,
    buildOptimisticNextStep,
    parseMessage,
    buildOptimisticNextStepForPreventSelfApprovalsEnabled,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    buildOptimisticNextStepForDynamicExternalWorkflowError,
    buildOptimisticNextStepForDEWOfflineSubmission,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    buildNextStepNew,
};
