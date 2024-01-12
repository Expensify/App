import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportNextStep} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportNextStep';
import EmailUtils from './EmailUtils';
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

/**
 *
 * @param report
 * @param isPaidWithWallet - Whether a report has been paid with wallet or outside of Expensify
 * @returns next step
 */
function buildNextStep(report: Report, isPaidWithWallet = false): ReportNextStep | null {
    const {
        statusNum = CONST.REPORT.STATUS.OPEN,
        // TODO: Clarify default value
        isPreventSelfApprovalEnabled = false,
    } = report;
    const policy = ReportUtils.getPolicy(report.policyID ?? '');
    const isSelfApproval = policy.submitsTo === currentUserAccountID;
    const submitterDisplayName = isSelfApproval ? 'you' : ReportUtils.getDisplayNameForParticipant(policy.submitsTo, true) ?? '';
    const type: ReportNextStep['type'] = 'neutral';
    let optimisticNextStep: ReportNextStep | null;

    switch (statusNum) {
        case CONST.REPORT.STATUS.OPEN: {
            const message = [
                {
                    text: 'Waiting for',
                },
                {
                    text: submitterDisplayName,
                    type: 'strong',
                },
                {
                    text: 'to',
                },
                {
                    text: 'submit',
                    type: 'strong',
                },
                {
                    text: 'these expenses.',
                },
            ];
            const preventedSelfApprovalMessage = [
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

            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: isPreventSelfApprovalEnabled && isSelfApproval ? preventedSelfApprovalMessage : message,
            };
            break;
        }

        case CONST.REPORT.STATUS.SUBMITTED:
            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: [{text: 'Waiting for'}, {text: submitterDisplayName, type: 'strong'}, {text: 'to'}, {text: 'review', type: 'strong'}, {text: ' %expenses.'}],
            };
            break;

        case CONST.REPORT.STATUS.APPROVED: {
            const message = [
                {
                    text: isSelfApproval ? Str.recapitalize(submitterDisplayName) : submitterDisplayName,
                    type: 'strong',
                },
                {
                    text: 'have marked these expenses as',
                },
                {
                    text: 'paid',
                    type: 'strong',
                },
            ];

            if (!isPaidWithWallet) {
                message.push({text: 'outside of Expensify.'});
            }

            optimisticNextStep = {
                type,
                title: 'Finished!',
                message,
            };
            break;
        }

        default:
            optimisticNextStep = null;
    }

    return optimisticNextStep;
}

export {parseMessage, buildNextStep};
