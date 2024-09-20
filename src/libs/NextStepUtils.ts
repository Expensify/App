import {format, lastDayOfMonth, setDate} from 'date-fns';
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStep} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportNextStep';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DateUtils from './DateUtils';
import EmailUtils from './EmailUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';

let currentUserAccountID = -1;
let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value) {
            return;
        }

        currentUserAccountID = value?.accountID ?? -1;
        currentUserEmail = value?.email ?? '';
    },
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';

    messages?.forEach((part, index) => {
        const isEmail = Str.isValidEmail(part.text);
        let tagType = part.type ?? 'span';
        let content = Str.safeEscape(part.text);

        const previousPart = messages?.at(index - 1);
        const nextPart = messages?.at(index + 1);

        if (currentUserEmail === part.text || part.clickToCopyText === currentUserEmail) {
            tagType = 'strong';
            content = nextPart?.text === `'s` ? 'Your' : 'You';
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

function getNextApproverDisplayName(policy: Policy, ownerAccountID: number, submitToAccountID: number, report: OnyxEntry<Report>) {
    const approvalChain = ReportUtils.getApprovalChain(policy, ownerAccountID, report?.total ?? 0);
    if (approvalChain.length === 0) {
        return ReportUtils.getDisplayNameForParticipant(submitToAccountID);
    }

    const nextApproverEmail = approvalChain.length === 1 ? approvalChain.at(0) : approvalChain[approvalChain.indexOf(currentUserEmail) + 1];
    if (!nextApproverEmail) {
        return ReportUtils.getDisplayNameForParticipant(submitToAccountID);
    }

    return PersonalDetailsUtils.getPersonalDetailByEmail(nextApproverEmail)?.displayName ?? nextApproverEmail;
}

/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 *
 * @param report
 * @param predictedNextStatus - a next expected status of the report
 * @param parameters.isPaidWithExpensify - Whether a report has been paid with Expensify or outside
 * @returns nextStep
 */
function buildNextStep(report: OnyxEntry<Report>, predictedNextStatus: ValueOf<typeof CONST.REPORT.STATUS_NUM>): ReportNextStep | null {
    if (!ReportUtils.isExpenseReport(report)) {
        return null;
    }

    const {policyID = '', ownerAccountID = -1} = report ?? {};
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? ({} as Policy);
    const {harvesting, autoReportingOffset} = policy;
    const autoReportingFrequency = PolicyUtils.getCorrectedAutoReportingFrequency(policy);
    const submitToAccountID = PolicyUtils.getSubmitToAccountID(policy, ownerAccountID);
    const ownerDisplayName = ReportUtils.getDisplayNameForParticipant(ownerAccountID);
    const nextApproverDisplayName = getNextApproverDisplayName(policy, ownerAccountID, submitToAccountID, report);

    const reimburserAccountID = PolicyUtils.getReimburserAccountID(policy);
    const reimburserDisplayName = ReportUtils.getDisplayNameForParticipant(reimburserAccountID);
    const type: ReportNextStep['type'] = 'neutral';
    let optimisticNextStep: ReportNextStep | null;

    switch (predictedNextStatus) {
        // Generates an optimistic nextStep once a report has been opened
        case CONST.REPORT.STATUS_NUM.OPEN:
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
                    let autoSubmissionDate: Date | null = null;
                    let formattedDate = '';

                    if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                        autoSubmissionDate = lastDayOfMonth(currentDate);
                    } else if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                        const lastBusinessDayOfMonth = DateUtils.getLastBusinessDayOfMonth(currentDate);
                        autoSubmissionDate = setDate(currentDate, lastBusinessDayOfMonth);
                    } else if (autoReportingOffset !== undefined) {
                        autoSubmissionDate = setDate(currentDate, autoReportingOffset);
                    }

                    if (autoSubmissionDate) {
                        formattedDate = format(autoSubmissionDate, CONST.DATE.ORDINAL_DAY_OF_MONTH);
                    }

                    const harvestingSuffixes: Record<DeepValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, string> = {
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: 'later today',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: 'on Sunday',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: 'on the 1st and 16th of each month',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: formattedDate ? `on the ${formattedDate} of each month` : '',
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

            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            // Another owner
            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: nextApproverDisplayName,
                        type: 'strong',
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
                ],
            };

            break;
        }

        // Generates an optimistic nextStep once a report has been closed for example in the case of Submit and Close approval flow
        case CONST.REPORT.STATUS_NUM.CLOSED:
            optimisticNextStep = {
                icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                type,
                message: [
                    {
                        text: 'No further action required!',
                    },
                ],
            };

            break;

        // Generates an optimistic nextStep once a report has been approved
        case CONST.REPORT.STATUS_NUM.APPROVED:
            if (
                ReportUtils.isInvoiceReport(report) ||
                !ReportUtils.isPayer(
                    {
                        accountID: currentUserAccountID,
                        email: currentUserEmail,
                    },
                    report,
                )
            ) {
                optimisticNextStep = {
                    type,
                    icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                    message: [
                        {
                            text: 'No further action required!',
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
                        text: reimburserDisplayName,
                        type: 'strong',
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
                ],
            };
            break;

        // Generates an optimistic nextStep once a report has been paid
        case CONST.REPORT.STATUS_NUM.REIMBURSED:
            // Paid with wallet
            optimisticNextStep = {
                type,
                icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                message: [
                    {
                        text: 'No further action required!',
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

export {parseMessage, buildNextStep};
