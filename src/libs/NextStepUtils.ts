import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
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
 * @param parameters
 * @param parameters.isPaidWithWallet - Whether a report has been paid with wallet or outside of Expensify
 * @returns nextStep
 */
function buildNextStep(report: Report, {isPaidWithWallet}: BuildNextStepParameters = {}): ReportNextStep | null {
    const {
        statusNum = CONST.REPORT.STATUS_NUM.OPEN,
        // TODO: Clarify default value
        isPreventSelfApprovalEnabled = false,
        ownerAccountID = -1,
    } = report;
    const policy = ReportUtils.getPolicy(report.policyID ?? '');
    const isOwner = currentUserAccountID === ownerAccountID;
    const ownerLogin = PersonalDetailsUtils.getLoginsByAccountIDs([ownerAccountID])[0] ?? '';
    const isSelfApproval = currentUserAccountID === policy.submitsTo;
    const submitterDisplayName = isSelfApproval ? 'you' : ReportUtils.getDisplayNameForParticipant(policy.submitsTo, true) ?? '';
    const type: ReportNextStep['type'] = 'neutral';
    let optimisticNextStep: ReportNextStep | null;

    switch (statusNum) {
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
                        text: ' these expenses. This report may be selected at random for manual approval.',
                    },
                ],
            };

            // TODO: Clarify date
            // Scheduled submit enabled
            if (policy.isHarvestingEnabled) {
                optimisticNextStep.message = [
                    {
                        text: 'These expenses are scheduled to ',
                    },
                    {
                        text: 'automatically submit!',
                        type: 'strong',
                    },
                    {
                        text: ' No further action required!',
                    },
                ];
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

            break;

        // Generates an optimistic nextStep once a report has been submitted
        case CONST.REPORT.STATUS_NUM.SUBMITTED:
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
                        text: 'review',
                        type: 'strong',
                    },
                    {
                        text: ' these %expenses.',
                    },
                ];
            }

            break;

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
