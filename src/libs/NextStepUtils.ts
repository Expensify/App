import {format, setDate} from 'date-fns';
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStep, TransactionViolations} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportNextStep';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {getNextApproverAccountID} from './actions/IOU';
import EmailUtils from './EmailUtils';
import {getLoginsByAccountIDs, getPersonalDetailsByIDs} from './PersonalDetailsUtils';
import {getCorrectedAutoReportingFrequency, getReimburserAccountID} from './PolicyUtils';
import {getDisplayNameForParticipant, getPersonalDetailsForAccountID, hasViolations as hasViolationsReportUtils, isExpenseReport, isInvoiceReport, isPayer} from './ReportUtils';

let currentUserAccountID = -1;
let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value) {
            return;
        }

        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        currentUserEmail = value?.email ?? '';
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let transactionViolations: OnyxCollection<TransactionViolations>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        transactionViolations = value;
    },
});

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';
    messages?.forEach((part, index) => {
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
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'expense(s)')
        .replace(/%Expenses/g, 'Expense(s)')
        .replace(/%tobe/g, 'are');

    return `<next-step>${formattedHtml}</next-step>`;
}

function getNextApproverDisplayName(report: OnyxEntry<Report>, isUnapprove?: boolean) {
    const approverAccountID = getNextApproverAccountID(report, isUnapprove);

    return getDisplayNameForParticipant({accountID: approverAccountID}) ?? getPersonalDetailsForAccountID(approverAccountID).login;
}

function buildOptimisticNextStepForPreventSelfApprovalsEnabled() {
    const optimisticNextStep: ReportNextStep = {
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

/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 *
 * @param report
 * @param predictedNextStatus - a next expected status of the report
 * @param shouldFixViolations - whether to show `fix the issue` next step
 * @param isUnapprove - whether a report is being unapproved
 * @returns nextStep
 */
function buildNextStep(report: OnyxEntry<Report>, predictedNextStatus: ValueOf<typeof CONST.REPORT.STATUS_NUM>, shouldFixViolations?: boolean, isUnapprove?: boolean): ReportNextStep | null {
    if (!isExpenseReport(report)) {
        return null;
    }

    const {policyID = '', ownerAccountID = -1} = report ?? {};
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? ({} as Policy);
    const {harvesting, autoReportingOffset} = policy;
    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations);
    const shouldShowFixMessage = hasViolations && autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
    const [policyOwnerPersonalDetails, ownerPersonalDetails] = getPersonalDetailsByIDs({
        accountIDs: [policy.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, ownerAccountID],
        currentUserAccountID,
        shouldChangeUserDisplayName: true,
    });
    const ownerDisplayName = ownerPersonalDetails?.displayName ?? ownerPersonalDetails?.login ?? getDisplayNameForParticipant({accountID: ownerAccountID});
    const policyOwnerDisplayName = policyOwnerPersonalDetails?.displayName ?? policyOwnerPersonalDetails?.login ?? getDisplayNameForParticipant({accountID: policy.ownerAccountID});
    const nextApproverDisplayName = getNextApproverDisplayName(report, isUnapprove);
    const approverAccountID = getNextApproverAccountID(report, isUnapprove);
    const approvers = getLoginsByAccountIDs([approverAccountID ?? CONST.DEFAULT_NUMBER_ID]);

    const reimburserAccountID = getReimburserAccountID(policy);
    const hasValidAccount = !!policy?.achAccount?.accountNumber;
    const type: ReportNextStep['type'] = 'neutral';
    let optimisticNextStep: ReportNextStep | null;

    const nextStepPayExpense = {
        type,
        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: 'Waiting for ',
            },
            ownerAccountID === -1 || !policy.ownerAccountID
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
            ...(shouldShowFixMessage ? [{text: 'fix the issue(s)'}] : [{text: 'pay'}, {text: ' %expenses.'}]),
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
            if (shouldFixViolations) {
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
                            clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
                        },
                        {
                            text: ' to ',
                        },
                        {
                            text: 'fix the issue(s)',
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
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'add',
                    },
                    {
                        text: ' %expenses.',
                    },
                ],
            };

            // Scheduled submit enabled
            if (harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${ownerDisplayName}`,
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
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

                    if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                        monthlyText = 'on the last day of the month';
                    } else if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                        monthlyText = 'on the last business day of the month';
                    } else if (autoReportingOffset !== undefined) {
                        autoSubmissionDate = format(setDate(currentDate, autoReportingOffset), CONST.DATE.ORDINAL_DAY_OF_MONTH);
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
            if (report?.total !== 0 && !harvesting?.enabled && autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${ownerDisplayName}`,
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
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
            if (policy.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL) {
                optimisticNextStep = nextStepPayExpense;
                break;
            }
            // Another owner
            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
            };
            // We want to show pending approval next step for cases where the policy has approvals enabled
            if (autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT) {
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
                    isPayer(
                        {
                            accountID: currentUserAccountID,
                            email: currentUserEmail,
                        },
                        report,
                    )
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
        case CONST.REPORT.STATUS_NUM.APPROVED:
            if (
                isInvoiceReport(report) ||
                !isPayer(
                    {
                        accountID: currentUserAccountID,
                        email: currentUserEmail,
                    },
                    report,
                )
            ) {
                optimisticNextStep = noActionRequired;

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
                    reimburserAccountID === -1
                        ? {
                              text: 'an admin',
                          }
                        : {
                              text: getDisplayNameForParticipant({accountID: reimburserAccountID}),
                              type: 'strong',
                          },
                    {
                        text: ' to ',
                    },
                    {
                        text: hasValidAccount ? 'pay' : 'finish setting up',
                    },
                    {
                        text: hasValidAccount ? ' %expenses.' : ' a business bank account.',
                    },
                ],
            };
            break;

        // Resets a nextStep
        default:
            optimisticNextStep = null;
    }

    return optimisticNextStep;
}

export {parseMessage, buildNextStep, buildOptimisticNextStepForPreventSelfApprovalsEnabled};
