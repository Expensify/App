import {format, lastDayOfMonth, setDate} from 'date-fns';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import * as NextStepUtils from '@libs/NextStepUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStep} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
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
            harvesting: {
                enabled: false,
            },
            // Required props
            name: 'Policy',
            role: 'admin',
            type: 'team',
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        };
        const optimisticNextStep: ReportNextStep = {
            type: 'neutral',
            title: '',
            message: [],
        };
        const report = ReportUtils.buildOptimisticExpenseReport('fake-chat-report-id-1', policyID, 1, -500, CONST.CURRENCY.USD) as Report;

        beforeAll(() => {
            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (item) => item.id);

            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [strangeAccountID]: {
                        accountID: strangeAccountID,
                        login: strangeEmail,
                        avatar: '',
                    },
                    [currentUserAccountID]: {
                        accountID: currentUserAccountID,
                        login: currentUserEmail,
                        avatar: '',
                    },
                },
                ...policyCollectionDataSet,
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

                expect(result).toMatchObject(optimisticNextStep);
            });

            describe('scheduled submit enabled', () => {
                beforeEach(() => {
                    optimisticNextStep.title = 'Next Steps:';
                });

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

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
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

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
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

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
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

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: 2,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });

                test('monthly on the last day', () => {
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: `automatically submit on the ${format(lastDayOfMonth(new Date()), CONST.DATE.ORDINAL_DAY_OF_MONTH)} of each month!`,
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });

                test('monthly on the last business day', () => {
                    const lastBusinessDayOfMonth = DateUtils.getLastBusinessDayOfMonth(new Date());
                    optimisticNextStep.message = [
                        {
                            text: 'These expenses are scheduled to ',
                        },
                        {
                            text: `automatically submit on the ${format(setDate(new Date(), lastBusinessDayOfMonth), CONST.DATE.ORDINAL_DAY_OF_MONTH)} of each month!`,
                            type: 'strong',
                        },
                        {
                            text: ' No further action required!',
                        },
                    ];

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
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

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
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
                    ];

                    return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                        harvesting: {
                            enabled: false,
                        },
                    }).then(() => {
                        const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
            });

            test('prevented self submitting', () => {
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
                    preventSelfApproval: true,
                    employeeList: {
                        [currentUserEmail]: {
                            submitsTo: currentUserEmail,
                        },
                    },
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.OPEN);

                    expect(result).toMatchObject(optimisticNextStep);
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
                        text: 'pay',
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

                expect(result).toMatchObject(optimisticNextStep);
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
                    employeeList: {
                        [currentUserEmail]: {
                            submitsTo: strangeEmail,
                        },
                    },
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.SUBMITTED);

                    expect(result).toMatchObject(optimisticNextStep);
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

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    employeeList: {
                        [strangeEmail]: {
                            submitsTo: currentUserEmail,
                        },
                    },
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.SUBMITTED);

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('submit and close approval mode', () => {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }).then(() => {
                    const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.CLOSED);

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been approved', () => {
            test('non-payer', () => {
                report.managerID = strangeAccountID;
                optimisticNextStep.title = 'Finished!';
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

                expect(result).toMatchObject(optimisticNextStep);
            });

            test('payer', () => {
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
                        text: 'pay',
                        type: 'strong',
                    },
                    {
                        text: ' %expenses.',
                    },
                ];
                // mock the report as approved
                const originalState = {stateNum: report.stateNum, statusNum: report.statusNum};
                report.stateNum = CONST.REPORT.STATE_NUM.APPROVED;
                report.statusNum = CONST.REPORT.STATUS_NUM.APPROVED;

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.APPROVED);

                expect(result).toMatchObject(optimisticNextStep);

                // restore
                report.stateNum = originalState.stateNum;
                report.statusNum = originalState.statusNum;
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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.REIMBURSED, {isPaidWithExpensify: true});

                expect(result).toMatchObject(optimisticNextStep);
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

                const result = NextStepUtils.buildNextStep(report, CONST.REPORT.STATUS_NUM.REIMBURSED, {isPaidWithExpensify: false});

                expect(result).toMatchObject(optimisticNextStep);
            });
        });
    });
});
