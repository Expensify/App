import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStep} from '@src/types/onyx';
import * as NextStepUtils from '../../src/libs/NextStepUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

Onyx.init({keys: ONYXKEYS});

describe('libs/NextStepUtils', () => {
    describe('buildNextStep', () => {
        const currentUserEmail = 'current-user@expensify.com';
        const currentUserAccountID = 37;
        const strangeEmail = 'stranger@expensify.com';
        const strangeAccountID = 50;
        const policyID = '1';
        const policy: Policy = {
            // Important props
            id: policyID,
            owner: currentUserEmail,
            submitsTo: currentUserAccountID,
            isHarvestingEnabled: false,
            // Required props
            name: 'Policy',
            role: 'admin',
            type: 'team',
            outputCurrency: CONST.CURRENCY.USD,
            areChatRoomsEnabled: true,
            isPolicyExpenseChatEnabled: true,
        };
        const report = ReportUtils.buildOptimisticExpenseReport('fake-chat-report-id-1', policyID, 1, -500, CONST.CURRENCY.USD) as Report;

        const optimisticNextStep: ReportNextStep = {
            type: 'neutral',
            title: '',
            message: [],
        };

        beforeAll(() => {
            // @ts-expect-error Preset necessary values
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: policy,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [strangeAccountID]: {
                        accountID: strangeAccountID,
                        login: strangeEmail,
                        avatar: '',
                    },
                },
            }).then(waitForBatchedUpdates);
        });

        beforeEach(() => {
            report.ownerAccountID = currentUserAccountID;
            optimisticNextStep.title = '';
            optimisticNextStep.message = [];
        });

        describe('it generates an optimistic nextStep once a report has been opened', () => {
            beforeEach(() => {
                report.statusNum = CONST.REPORT.STATUS.OPEN;
            });

            test('self review', () => {
                optimisticNextStep.title = 'Next Steps:';
                optimisticNextStep.message = [
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
                ];

                const result = NextStepUtils.buildNextStep(report);

                expect(result).toStrictEqual(optimisticNextStep);
            });

            // TODO: Clarify date
            test('scheduled submit enabled', () => {
                optimisticNextStep.title = 'Next Steps:';
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

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    isHarvestingEnabled: true,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report);

                    expect(result).toStrictEqual(optimisticNextStep);
                });
            });

            test('prevented self submitting', () => {
                report.isPreventSelfApprovalEnabled = true;
                optimisticNextStep.title = 'Next Steps:';
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

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    submitsTo: currentUserAccountID,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report);

                    expect(result).toStrictEqual(optimisticNextStep);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been submitted', () => {
            beforeEach(() => {
                report.statusNum = CONST.REPORT.STATUS.SUBMITTED;
            });

            test('self review', () => {
                optimisticNextStep.title = 'Next Steps:';
                optimisticNextStep.message = [
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
                ];

                const result = NextStepUtils.buildNextStep(report);

                expect(result).toStrictEqual(optimisticNextStep);
            });

            test('another reviewer', () => {
                optimisticNextStep.title = 'Next Steps:';
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: strangeEmail,
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
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    submitsTo: strangeAccountID,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report);

                    expect(result).toStrictEqual(optimisticNextStep);
                });
            });

            test('another owner', () => {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.title = 'Next Steps:';
                optimisticNextStep.message = [
                    {
                        text: strangeEmail,
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

                const result = NextStepUtils.buildNextStep(report);

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });

        describe('it generates an optimistic nextStep once a report has been approved', () => {
            beforeEach(() => {
                report.statusNum = CONST.REPORT.STATUS.APPROVED;
            });

            test('self review', () => {
                optimisticNextStep.title = 'Next Steps:';
                optimisticNextStep.message = [
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
                ];

                const result = NextStepUtils.buildNextStep(report);

                expect(result).toStrictEqual(optimisticNextStep);
            });

            test('another owner', () => {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report);

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });

        describe('it generates an optimistic nextStep once a report has been paid', () => {
            beforeEach(() => {
                report.statusNum = CONST.REPORT.STATUS.REIMBURSED;
            });

            test('paid with wallet', () => {
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
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
                    {
                        text: '.',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report, {isPaidWithWallet: true});

                expect(result).toStrictEqual(optimisticNextStep);
            });

            test('paid outside of Expensify', () => {
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
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
                    {
                        text: ' outside of Expensify',
                    },
                    {
                        text: '.',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report, {isPaidWithWallet: false});

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });
    });
});
