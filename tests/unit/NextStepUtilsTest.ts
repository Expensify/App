import {
    buildNextStepNew,
    buildOptimisticNextStep,
    buildOptimisticNextStepForDynamicExternalWorkflowSubmitError,
    buildOptimisticNextStepForPreventSelfApprovalsEnabled,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    getReportNextStep,
} from '@libs/NextStepUtils';
import {buildOptimisticEmptyReport, buildOptimisticExpenseReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportNextStepDeprecated, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

Onyx.init({keys: ONYXKEYS});

describe('libs/NextStepUtils', () => {
    describe('buildNextStep', () => {
        const currentUserEmail = 'current-user@expensify.com';
        const currentUserAccountID = 37;
        const strangeEmail = 'stranger@expensify.com';
        const strangeAccountID = 50;
        const ownerEmail = 'owner@expensify.com';
        const ownerAccountID = 99;
        const policyID = '1';
        const policy: Policy = {
            // Important props
            id: policyID,
            owner: ownerEmail,
            harvesting: {
                enabled: false,
            },
            // Required props
            name: 'Policy',
            role: 'admin',
            type: 'team',
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        };
        const optimisticNextStep: ReportNextStepDeprecated = {
            type: 'neutral',
            icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
            message: [],
        };
        const report = buildOptimisticExpenseReport({
            chatReportID: 'fake-chat-report-id-1',
            policyID,
            payeeAccountID: 1,
            total: -500,
            currency: CONST.CURRENCY.USD,
            betas: [CONST.BETAS.ALL],
        }) as Report;

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
                    [ownerAccountID]: {
                        accountID: ownerAccountID,
                        login: ownerEmail,
                        avatar: '',
                    },
                },
                ...policyCollectionDataSet,
            }).then(waitForBatchedUpdates);
        });

        beforeEach(() => {
            report.ownerAccountID = currentUserAccountID;
            report.managerID = currentUserAccountID;
            report.transactionCount = 1;
            optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;
            optimisticNextStep.message = [];

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy).then(waitForBatchedUpdates);
        });

        describe('it generates and optimistic nextStep once a report has been created', () => {
            test('Correct next steps message', () => {
                const emptyReport = buildOptimisticEmptyReport(
                    'fake-empty-report-id-2',
                    currentUserAccountID,
                    currentUserEmail,
                    {reportID: 'fake-parent-report-id-3'},
                    'fake-parent-report-action-id-4',
                    policy,
                    '2025-03-31 13:23:11',
                    [CONST.BETAS.ALL],
                );

                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${currentUserEmail}`,
                        type: 'strong',
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
                ];
                const result = buildNextStepNew({
                    report: emptyReport,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                    shouldFixViolations: false,
                    isUnapprove: false,
                    isReopen: false,
                });

                expect(result).toMatchObject(optimisticNextStep);
            });
        });

        describe('it generates an optimistic nextStep once a report has been opened', () => {
            test('Fix violations', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${currentUserEmail}`,
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'fix the issues',
                    },
                ];
                const result = buildNextStepNew({
                    report,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: true,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                    shouldFixViolations: true,
                    isUnapprove: false,
                    isReopen: false,
                });

                expect(result).toMatchObject(optimisticNextStep);
            });

            test('self review', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for userSubmitter to submit expense(s).
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `${currentUserEmail}`,
                        type: 'strong',
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
                const result = buildNextStepNew({
                    report,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                    shouldFixViolations: false,
                    isUnapprove: false,
                    isReopen: false,
                });

                expect(result).toMatchObject(optimisticNextStep);
            });

            describe('scheduled submit enabled', () => {
                beforeEach(() => {
                    optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;
                });

                // Format: Waiting for userSubmitter's expense(s) to automatically submit on scheduledSubmitSettings

                test('daily', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit later today
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ' later today',
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });
                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('weekly', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on Sunday
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ' on Sunday',
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('twice a month', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 1st and 16th of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ' on the 1st and 16th of each month',
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('monthly on the 2nd', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 2nd of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ' on the 2nd of each month',
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                            autoReportingOffset: 2,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('monthly on the last day', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastDayOfMonth of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ` on the last day of the month`,
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                            autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });
                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('monthly on the last business day', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastBusinessDayOfMonth of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ` on the last business day of the month`,
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                            autoReportingOffset: CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('trip', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit at the end of their trip
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            clickToCopyText: `${currentUserEmail}`,
                            type: 'strong',
                        },
                        {
                            text: "'s",
                            type: 'strong',
                        },
                        {
                            text: ' %expenses to automatically submit',
                        },
                        {
                            text: ` at the end of their trip`,
                        },
                    ];

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP,
                            harvesting: {
                                enabled: true,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });

                test('manual', () => {
                    // Waiting for userSubmitter to submit expense(s).
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: `${currentUserEmail}`,
                            type: 'strong',
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

                    const result = buildNextStepNew({
                        report,
                        policy: {
                            ...policy,
                            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                            harvesting: {
                                enabled: false,
                            },
                        },
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been submitted', () => {
            test('self review', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for you to pay expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `you`,
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
                ];
                const result = buildNextStepNew({
                    report,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                    shouldFixViolations: false,
                    isUnapprove: false,
                    isReopen: false,
                });

                expect(result).toMatchObject(optimisticNextStep);
            });

            test('self review with bank account setup', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for you to pay expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: `you`,
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
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);

                    // restore to previous state
                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        achAccount: null,
                    });
                });
            });

            test('another reviewer', () => {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for userApprover to approve expense(s)
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
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('another owner', () => {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for userApprover to approve expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: currentUserEmail,
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
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    employeeList: {
                        [strangeEmail]: {
                            submitsTo: currentUserEmail,
                        },
                    },
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        shouldFixViolations: false,
                        isUnapprove: true,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('submit and close approval mode', () => {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.CHECKMARK;
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.CLOSED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('approval mode enabled', () => {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: ownerEmail,
                        type: 'strong',
                        clickToCopyText: ownerEmail,
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

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('advanced approval mode enabled', () => {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: strangeEmail,
                        type: 'strong',
                        clickToCopyText: strangeEmail,
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

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been approved', () => {
            test('disabled reimbursements', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.CHECKMARK;
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('non-payer', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.CHECKMARK;
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                    role: 'user',
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            test('payer', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for an admin (you) to pay expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: 'you',
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
                // mock the report as approved
                const originalState = {stateNum: report.stateNum, statusNum: report.statusNum};
                report.stateNum = CONST.REPORT.STATE_NUM.APPROVED;
                report.statusNum = CONST.REPORT.STATUS_NUM.APPROVED;
                const result = buildNextStepNew({
                    report,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                    shouldFixViolations: false,
                    isUnapprove: false,
                    isReopen: false,
                });

                expect(result).toMatchObject(optimisticNextStep);

                // restore
                report.stateNum = originalState.stateNum;
                report.statusNum = originalState.statusNum;
            });

            test('payer with bank account setup', () => {
                optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.HOURGLASS;

                // Waiting for you to pay expense(s)
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
                    },
                    {
                        text: ' %expenses.',
                    },
                ];

                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(() => {
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });

            describe('it generates an optimistic nextStep once a report has been paid', () => {
                test('paid with wallet / outside of Expensify', () => {
                    optimisticNextStep.icon = CONST.NEXT_STEP.ICONS.CHECKMARK;
                    optimisticNextStep.message = [
                        {
                            text: 'No further action required!',
                        },
                    ];
                    const result = buildNextStepNew({
                        report,
                        policy,
                        currentUserAccountIDParam: currentUserAccountID,
                        currentUserEmailParam: currentUserEmail,
                        hasViolations: false,
                        isASAPSubmitBetaEnabled: false,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED,
                        shouldFixViolations: false,
                        isUnapprove: false,
                        isReopen: false,
                    });

                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });
    });

    describe('buildOptimisticNextStepForStrictPolicyRuleViolations', () => {
        test('returns correct next step message for strict policy rule violations', () => {
            const result = buildOptimisticNextStepForStrictPolicyRuleViolations();

            expect(result).toEqual({
                type: 'alert',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for you to fix the issues. Your admins have restricted submission of expenses with violations.',
                    },
                ],
            });
        });
    });

    describe('buildOptimisticNextStepForDynamicExternalWorkflowSubmitError', () => {
        test('should return alert next step with error message when DEW submit fails', () => {
            // Given a scenario where Dynamic External Workflow submission has failed

            // When buildOptimisticNextStepForDynamicExternalWorkflowSubmitError is called
            const result = buildOptimisticNextStepForDynamicExternalWorkflowSubmitError();

            // Then it should return an alert-type next step with the appropriate error message and dot indicator icon
            expect(result).toEqual({
                type: 'alert',
                icon: CONST.NEXT_STEP.ICONS.DOT_INDICATOR,
                message: [
                    {
                        text: "This report can't be submitted. Please review the comments to resolve.",
                        type: 'alert-text',
                    },
                ],
            });
        });
    });

    describe('getReportNextStep', () => {
        const currentUserEmail = 'current-user@expensify.com';
        const currentUserAccountID = 37;
        const policyID = 'policy-1';

        beforeAll(() => {
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [currentUserAccountID]: {
                        accountID: currentUserAccountID,
                        login: currentUserEmail,
                        avatar: '',
                    },
                },
            }).then(waitForBatchedUpdates);
        });

        it('returns the current next step when no special conditions are met', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-1',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const currentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Current next step'}],
            };

            const result = getReportNextStep(currentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID);
            expect(result).toBe(currentNextStep);
        });

        it('returns an optimistic fix issue next step when all transactions have submission-blocking violations', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-2',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const transaction: Transaction = {
                transactionID: 'txn-1',
                reportID: report.reportID,
                amount: -500,
                currency: CONST.CURRENCY.USD,
            } as Transaction;

            const transactionViolations: OnyxCollection<TransactionViolations> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
            };

            const result = getReportNextStep(undefined, report, [transaction] as Array<OnyxEntry<Transaction>>, undefined, transactionViolations, currentUserEmail, currentUserAccountID);

            expect(result).toEqual({
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                actorAccountID: report.ownerAccountID,
            });
        });

        it('returns an optimistic prevent self-approval next step when preventSelfApproval is enabled and submitter would submit to themselves', async () => {
            const policy: Policy = {
                id: policyID,
                name: 'Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: currentUserEmail,
                preventSelfApproval: true,
                employeeList: {
                    [currentUserEmail]: {
                        email: currentUserEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: currentUserEmail,
                    },
                },
            };

            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-3',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            const result = getReportNextStep(undefined, report, [], policy, {}, currentUserEmail, currentUserAccountID);
            expect(result).toEqual(buildOptimisticNextStepForPreventSelfApprovalsEnabled());
        });

        it('prioritizes the fix issue next step over the prevent self-approval next step when both conditions are true', async () => {
            const policy: Policy = {
                id: policyID,
                name: 'Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: currentUserEmail,
                preventSelfApproval: true,
                employeeList: {
                    [currentUserEmail]: {
                        email: currentUserEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: currentUserEmail,
                    },
                },
            };

            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-4',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const transaction: Transaction = {
                transactionID: 'txn-2',
                reportID: report.reportID,
                amount: -500,
                currency: CONST.CURRENCY.USD,
            } as Transaction;

            const transactionViolations: OnyxCollection<TransactionViolations> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.NO_ROUTE,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            const result = getReportNextStep(undefined, report, [transaction] as Array<OnyxEntry<Transaction>>, policy, transactionViolations, currentUserEmail, currentUserAccountID);

            expect(result).toEqual({
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: report.ownerAccountID,
            });
        });

        it('returns the translatable next step over the deprecated one for the empty-report waiting-to-add-transactions case', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-5',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const currentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Waiting for '}, {text: 'you', type: 'strong'}, {text: ' to '}, {text: 'add'}, {text: ' %expenses.'}],
            };

            const reportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
            };

            const result = getReportNextStep(currentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID, reportNextStep);
            expect(result).toBe(reportNextStep);
        });

        it('prefers the report-embedded next step over the deprecated one when no special override applies', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-6',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const currentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Current next step'}],
            };

            const reportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
            };

            const result = getReportNextStep(currentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID, reportNextStep);
            expect(result).toBe(reportNextStep);
        });

        it('recomputes the next step for a non-actor viewer whose stored next step is stale after a third-party approval (regression for real-time "What\'s next")', () => {
            // Repro (measured live with two sessions): the submitter watches a submitted reimbursable report while an
            // approver approves it on another device. The report push refreshes report.statusNum (SUBMITTED -> APPROVED)
            // for the submitter, but does NOT refresh report.nextStep for the submitter (only the approver, the actor,
            // gets a fresh nextStep). The deprecated reportNextStep_* collection is likewise stale until a later
            // OpenReport refetch. So on the viewer both stored next-step values still say "Waiting to approve"
            // (messageKey WAITING_TO_APPROVE, which implies a SUBMITTED report) while statusNum is already APPROVED.
            // Preferring the stale report.nextStep would leave the bar stuck; the fix must recompute from statusNum.
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-8',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: 99,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            } as Report;

            // The deprecated collection is stale for a non-actor viewer immediately after the push.
            const staleCurrentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Waiting for '}, {text: 'the approver', type: 'strong'}, {text: ' to '}, {text: 'approve'}, {text: ' %expenses.'}],
            };

            // report.nextStep is ALSO stale on the viewer: it still describes the pre-approval SUBMITTED state.
            const staleReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: 99,
            };

            const result = getReportNextStep(staleCurrentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID, staleReportNextStep);

            // The stale WAITING_TO_APPROVE implies a SUBMITTED report, which mismatches the pushed APPROVED status, so the
            // step is recomputed from statusNum rather than returning either stale value.
            expect(result).not.toBe(staleReportNextStep);
            expect(result).not.toBe(staleCurrentNextStep);
            expect(result).not.toHaveProperty('messageKey', CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE);
            // The recomputed value is exactly what buildOptimisticNextStep produces for the pushed APPROVED status.
            expect(result).toEqual(
                buildOptimisticNextStep({
                    report,
                    policy: undefined,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                }),
            );
        });

        it('recomputes "Waiting to pay" for a payer viewing a report whose stored next step is stale after approval', async () => {
            // Same staleness scenario, but the viewer is the reimburser: the recomputed post-approval step must be the
            // real next action ("Waiting to pay"), matching what the server sends on the later OpenReport refetch.
            const payerPolicyID = 'policy-payer';
            const policy: Policy = {
                id: payerPolicyID,
                name: 'Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                // Manual (indirect) reimbursement means the "bank account required" branch is skipped without needing a
                // full achAccount fixture, so the recomputed APPROVED step is "Waiting to pay".
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                ownerAccountID: currentUserAccountID,
                reimburser: currentUserEmail,
            };

            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-8b',
                    policyID: payerPolicyID,
                    payeeAccountID: 2,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: 2,
                managerID: currentUserAccountID,
                policyID: payerPolicyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            } as Report;

            const staleReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${payerPolicyID}`, policy);
            await waitForBatchedUpdates();

            const result = getReportNextStep(undefined, report, [], policy, {}, currentUserEmail, currentUserAccountID, staleReportNextStep);

            expect(result).not.toBe(staleReportNextStep);
            expect(result).toEqual(
                buildOptimisticNextStep({
                    report,
                    policy,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserEmail,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: false,
                    predictedNextStatus: CONST.REPORT.STATUS_NUM.APPROVED,
                }),
            );
            expect(result).toHaveProperty('messageKey', CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY);
        });

        it('keeps the report-embedded next step when its message key is consistent with the current status (actor path, no recompute)', () => {
            // The actor writes report.statusNum and report.nextStep together (see approveMoneyRequest), so the stored
            // messageKey always matches statusNum for them. A consistent SUBMITTED report + WAITING_TO_APPROVE must be
            // returned verbatim, never recomputed.
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-8c',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: 99,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            } as Report;

            const currentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Current next step'}],
            };

            const consistentReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: 99,
            };

            const result = getReportNextStep(currentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID, consistentReportNextStep);
            expect(result).toBe(consistentReportNextStep);
        });

        it('does not recompute for an ambiguous message key even when it looks like it could be stale', () => {
            // WAITING_TO_PAY is emitted for both SUBMITTED (optional/no-approval policy) and APPROVED reports, so it is
            // NOT in the unambiguous mismatch map. Even if statusNum is SUBMITTED we must not treat it as stale and must
            // return the report-embedded value unchanged (the server owns multi-status messages the client can't safely
            // reconstruct, e.g. external/DEW workflows).
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-8d',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: 99,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            } as Report;

            const ambiguousReportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: 99,
            };

            const result = getReportNextStep(undefined, report, [], undefined, {}, currentUserEmail, currentUserAccountID, ambiguousReportNextStep);
            expect(result).toBe(ambiguousReportNextStep);
        });

        it('falls back to the deprecated next step when the report has no embedded next step', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-9',
                    policyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            } as Report;

            const currentNextStep: ReportNextStepDeprecated = {
                type: 'neutral',
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                message: [{text: 'Current next step'}],
            };

            const result = getReportNextStep(currentNextStep, report, [], undefined, {}, currentUserEmail, currentUserAccountID, undefined);
            expect(result).toBe(currentNextStep);
        });

        it('prioritizes a higher-priority override over the new translatable next step', async () => {
            const overridePolicyID = 'policy-override';
            const policy: Policy = {
                id: overridePolicyID,
                name: 'Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: currentUserEmail,
                preventSelfApproval: true,
                employeeList: {
                    [currentUserEmail]: {
                        email: currentUserEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: currentUserEmail,
                    },
                },
            };

            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-7',
                    policyID: overridePolicyID,
                    payeeAccountID: 1,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                policyID: overridePolicyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const reportNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${overridePolicyID}`, policy);
            await waitForBatchedUpdates();

            // Even though a translatable next step is supplied, the prevent-self-approval override must still win.
            const result = getReportNextStep(undefined, report, [], policy, {}, currentUserEmail, currentUserAccountID, reportNextStep);
            expect(result).toEqual(buildOptimisticNextStepForPreventSelfApprovalsEnabled());
        });
    });
});
