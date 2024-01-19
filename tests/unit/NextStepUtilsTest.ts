import {format, lastDayOfMonth} from 'date-fns';
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
            isAutoApprovalEnabled: false,
            // Required props
            name: 'Policy',
            role: 'admin',
            type: 'team',
            outputCurrency: CONST.CURRENCY.USD,
            areChatRoomsEnabled: true,
            isPolicyExpenseChatEnabled: true,
        };
        const optimisticNextStep: ReportNextStep = {
            type: 'neutral',
            title: '',
            message: [],
        };
        const report = ReportUtils.buildOptimisticExpenseReport('fake-chat-report-id-1', policyID, 1, -500, CONST.CURRENCY.USD) as Report;

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
            report.managerID = currentUserAccountID;
            optimisticNextStep.title = '';
            optimisticNextStep.message = [];

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy).then(waitForBatchedUpdates);
        });

        describe('it generates an optimistic nextStep once a report has been opened', () => {
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
                        text: ' these expenses.',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                expect(result).toStrictEqual(optimisticNextStep);
            });

            test('self review and auto approval enabled', () => {
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
                        text: ' these expenses.',
                    },
                    {
                        text: ' This report may be selected at random for manual approval.',
                    },
                ];

                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    isAutoApprovalEnabled: true,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                    expect(result).toStrictEqual(optimisticNextStep);
                });
            });

            describe('scheduled submit enabled', () => {
                optimisticNextStep.title = 'Next Steps:';

                test('daily', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: 'automatically submit later today!',
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'immediate',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('weekly', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: 'automatically submit on Sunday!',
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'weekly',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('twice a month', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: 'automatically submit on the 1st and 16th of each month!',
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'semimonthly',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('monthly on the 2nd', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: 'automatically submit on the 2nd of each month!',
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'monthly',
                        autoReportingOffset: 2,
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('monthly on the last day', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: `automatically submit on the ${format(lastDayOfMonth(new Date()), 'do')} of each month!`,
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'monthly',
                        autoReportingOffset: 'lastDayOfMonth',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('trip', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: 'automatically submit at the end of your trip!',
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'trip',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
                });

                test('manual', () => {
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
                            text: ' these expenses.',
                        },
                        {
                            text: ' This report may be selected at random for manual approval.',
                        },
                    ];

                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        isHarvestingEnabled: true,
                        autoReportingFrequency: 'manual',
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toStrictEqual(optimisticNextStep);
                    });
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
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                    expect(result).toStrictEqual(optimisticNextStep);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been submitted', () => {
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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

                expect(result).toStrictEqual(optimisticNextStep);
            });

            test('another reviewer', () => {
                report.managerID = strangeAccountID;
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
                        text: 'approve',
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    submitsTo: strangeAccountID,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.SUBMITTED);

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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.SUBMITTED);

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });

        describe('it generates an optimistic nextStep once a report has been approved', () => {
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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });

        describe('it generates an optimistic nextStep once a report has been paid', () => {
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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.REIMBURSED, {isPaidWithWallet: true});

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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.REIMBURSED, {isPaidWithWallet: false});

                expect(result).toStrictEqual(optimisticNextStep);
            });
        });
    });
});
