import {format, lastDayOfMonth, setDate} from 'date-fns';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStep} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportNextStep';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import DateUtils from './DateUtils';
import EmailUtils from './EmailUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as ReportUtils from './ReportUtils';

let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value) {
            return;
        }

        currentUserAccountID = value?.accountID ?? -1;
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
    isPaidWithExpensify?: boolean;
};

/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 *
 * @param report
 * @param predictedNextStatus - a next expected status of the report
 * @param parameters.isPaidWithExpensify - Whether a report has been paid with Expensify or outside
 * @returns nextStep
 */
function buildNextStep(
    report: Report | EmptyObject,
    predictedNextStatus: ValueOf<typeof CONST.REPORT.STATUS_NUM>,
    {isPaidWithExpensify}: BuildNextStepParameters = {},
): ReportNextStep | null {
    if (!ReportUtils.isExpenseReport(report)) {
        return null;
    }

    const {policyID = '', ownerAccountID = -1, managerID = -1} = report;
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? ({} as Policy);
    const {submitsTo, harvesting, preventSelfApproval, autoReportingFrequency, autoReportingOffset} = policy;
    const isOwner = currentUserAccountID === ownerAccountID;
    const isManager = currentUserAccountID === managerID;
    const isSelfApproval = currentUserAccountID === submitsTo;
    const ownerLogin = PersonalDetailsUtils.getLoginsByAccountIDs([ownerAccountID])[0] ?? '';
    const managerDisplayName = isSelfApproval ? 'you' : ReportUtils.getDisplayNameForParticipant(submitsTo) ?? '';
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
            if (harvesting?.enabled && autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL) {
                optimisticNextStep.message = [
                    {
                        text: 'These expenses are scheduled to ',
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
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: 'at the end of your trip',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]: '',
                        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: '',
                    };

                    if (harvestingSuffixes[autoReportingFrequency]) {
                        harvestingSuffix = ` ${harvestingSuffixes[autoReportingFrequency]}`;
                    }
                }

                optimisticNextStep.message.push(
                    {
                        text: `automatically submit${harvestingSuffix}!`,
                        type: 'strong',
                    },
                    {
                        text: ' No further action required!',
                    },
                );
            }

            // Prevented self submitting
            if (preventSelfApproval && isSelfApproval) {
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
        case CONST.REPORT.STATUS_NUM.SUBMITTED: {
            const verb = isManager ? 'review' : 'approve';

            // Another owner
            optimisticNextStep = {
                type,
                title: 'Next Steps:',
                message: [
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
                ],
            };

            // Self review & another reviewer
            if (!isSelfApproval || (isSelfApproval && isOwner)) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: managerDisplayName,
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
                ];
            }

            break;
        }

        // Generates an optimistic nextStep once a report has been closed for example in the case of Submit and Close approval flow
        case CONST.REPORT.STATUS_NUM.CLOSED:
            optimisticNextStep = {
                type,
                title: 'Finished!',
                message: [
                    {
                        text: 'No further action required!',
                    },
                ],
            };

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
                        text: 'pay',
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
                        text: 'Waiting for ',
                    },
                    {
                        text: managerDisplayName,
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'pay',
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
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
            if (isPaidWithExpensify === false) {
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
