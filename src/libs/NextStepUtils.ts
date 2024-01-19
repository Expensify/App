import {format, lastDayOfMonth} from 'date-fns';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNextStep} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportNextStep';
import EmailUtils from './EmailUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as ReportUtils from './ReportUtils';

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value) {
            return;
        }

        currentUserAccountID = value.accountID;
    },
});

function parseMessage(messages: Message[] | undefined) {
    let nextStepHTML = '';

    messages?.forEach((part) => {
        const isEmail = Str.isValidEmail(part.text);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        let tagType = part.type ?? 'span';
        let content = Str.safeEscape(part.text);

        if (isEmail) {
            tagType = 'next-step-email';
            content = EmailUtils.prefixMailSeparatorsWithBreakOpportunities(content);
        }

        nextStepHTML += `<${tagType}>${content}</${tagType}>`;
    });

    const formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'these expenses')
        .replace(/%Expenses/g, 'These expenses')
        .replace(/%tobe/g, 'are');

    return `<next-step>${formattedHtml}</next-step>`;
}

type BuildNextStepParameters = {
    isPaidWithWallet?: boolean;
};

/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 *
 * @param report
 * @param predictedNextStatus - a next expected status of the report
 * @param parameters.isPaidWithWallet - Whether a report has been paid with wallet or outside of Expensify
 * @returns nextStep
 */
function buildNextStep(report: Report, predictedNextStatus: ValueOf<typeof CONST.REPORT.STATUS_NUM>, {isPaidWithWallet}: BuildNextStepParameters = {}): ReportNextStep | null {
    const {isPreventSelfApprovalEnabled = false, ownerAccountID = -1, managerID} = report;
    const policy = ReportUtils.getPolicy(report.policyID ?? '');
    const isManager = currentUserAccountID === managerID;
    const isOwner = currentUserAccountID === ownerAccountID;
    const ownerLogin = PersonalDetailsUtils.getLoginsByAccountIDs([ownerAccountID])[0] ?? '';
    const isSelfApproval = currentUserAccountID === policy.submitsTo;
    const submitterDisplayName = isSelfApproval ? 'you' : ReportUtils.getDisplayNameForParticipant(policy.submitsTo, true) ?? '';
    const type: ReportNextStep['type'] = 'neutral';
    let optimisticNextStep: ReportNextStep | null;

    switch (predictedNextStatus) {
        // Generates an optimistic nextStep once a report has been opened
        case CONST.REPORT.STATUS_NUM.OPEN:
            // Self review
            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: 'you',
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'submit',
                        type: 'strong',
                    },
                    {
                        text: ' these expenses.',
                    },
                ],
            };

            // Scheduled submit enabled
            if (policy.isHarvestingEnabled) {
                optimisticNextStep.message = [
                    {
                        text: 'These expenses are scheduled to ',
                    },
                ];
                let harvestingSuffix = '';

                if (policy.autoReportingFrequency) {
                    const currentDate = new Date();

                    let autoSubmissionDate: string;

                    if (policy.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                        const currentDateWithLastDayOfMonth = lastDayOfMonth(currentDate);

                        autoSubmissionDate = format(currentDateWithLastDayOfMonth, CONST.DATE.ORDINAL_DAY_OF_MONTH);
                    } else if (policy.autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                        // TODO: Implement calculation
                        autoSubmissionDate = '';
                    } else if (policy.autoReportingOffset !== undefined) {
                        autoSubmissionDate = format(currentDate.setDate(policy.autoReportingOffset), CONST.DATE.ORDINAL_DAY_OF_MONTH);
                    } else {
                        autoSubmissionDate = '';
                    }

                    const harvestingSuffixes = {
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: 'later today',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: 'on Sunday',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: 'on the 1st and 16th of each month',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: autoSubmissionDate ? `on the ${autoSubmissionDate} of each month` : '',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: 'at the end of your trip',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: '',
                    };

                    if (harvestingSuffixes[policy.autoReportingFrequency]) {
                        harvestingSuffix = ` ${harvestingSuffixes[policy.autoReportingFrequency]}`;
                    }
                }

                optimisticNextStep.message.push({
                    text: `automatically submit${harvestingSuffix}!`,
                    type: 'strong',
                });

                optimisticNextStep.message.push({
                    text: ' No further action required!',
                });
            }

            // Prevented self submitting
            if (isPreventSelfApprovalEnabled && isSelfApproval) {
                optimisticNextStep.message = [
                    {
                        text: "Oops! Looks like you're submitting to ",
                    },
                    {
                        text: 'yourself',
                        type: 'strong',
                    },
                    {
                        text: '. Approving your own reports is ',
                    },
                    {
                        text: 'forbidden',
                        type: 'strong',
                    },
                    {
                        text: ' by your policy. Please submit this report to someone else or contact your admin to change the person you submit to.',
                    },
                ];
            }

            // Self review and auto approval enabled
            if (isOwner && policy.isAutoApprovalEnabled) {
                optimisticNextStep.message?.push({
                    text: ' This report may be selected at random for manual approval.',
                });
            }

            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            const verb = isManager ? 'review' : 'approve';

            // Self review & another reviewer
            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: submitterDisplayName,
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: verb,
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
                    },
                ],
            };

            // Another owner
            if (!isOwner) {
                optimisticNextStep.message = [
                    {
                        text: ownerLogin,
                        type: 'strong',
                    },
                    {
                        text: ' is waiting for ',
                    },
                    {
                        text: 'you',
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: verb,
                        type: 'strong',
                    },
                    {
                        text: ' these %expenses.',
                    },
                ];
            }

            break;
        }

        // Generates an optimistic nextStep once a report has been approved
        case CONST.REPORT.STATUS_NUM.APPROVED:
            // Self review
            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: 'you',
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'review',
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
                    },
                ],
            };

            // Another owner
            if (!isOwner) {
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];
            }

            break;

        // Generates an optimistic nextStep once a report has been paid
        case CONST.REPORT.STATUS_NUM.REIMBURSED:
            // Paid with wallet
            optimisticNextStep = {
                type,
                title: 'Finished!',
                message: [
                    {
                        text: 'You',
                        type: 'strong',
                    },
                    {
                        text: ' have marked these expenses as ',
                    },
                    {
                        text: 'paid',
                        type: 'strong',
                    },
                ],
            };

            // Paid outside of Expensify
            if (typeof isPaidWithWallet === 'boolean' && !isPaidWithWallet) {
                optimisticNextStep.message?.push({text: ' outside of Expensify'});
            }

            optimisticNextStep.message?.push({text: '.'});

            break;

        // Resets a nextStep
        default:
            optimisticNextStep = null;
    }

    return optimisticNextStep;
}

export {parseMessage, buildNextStep};
