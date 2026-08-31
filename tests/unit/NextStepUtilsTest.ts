import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {
    buildNextStepMessage,
    buildOptimisticNextStepForPreventSelfApprovalsEnabled,
    getReportNextStep,
    buildOptimisticNextStep,
    shouldShowDynamicExternalWorkflowApproveErrorNextStep,
} from '@libs/NextStepUtils';
import {buildOptimisticEmptyReport, buildOptimisticExpenseReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportNextStep} from '@src/types/onyx/Report';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import type {OnyxCollection} from 'react-native-onyx';

import {execFileSync} from 'child_process';
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {formatPhoneNumber, getCurrencyDecimalsLocal, translateLocal} from '../utils/TestHelper';
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
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        };
        const report = buildOptimisticExpenseReport({
            chatReportID: 'fake-chat-report-id-1',
            getCurrencyDecimals: getCurrencyDecimalsLocal,
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
                    getCurrencyDecimalsLocal,
                );

                const expectedResult: ReportNextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: currentUserAccountID,
                };
                const result = buildOptimisticNextStep({
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
                    isTrackIntentUser: false,
                });

                expect(result).toMatchObject(expectedResult);
            });
        });

        describe('it generates an optimistic nextStep once a report has been opened', () => {
            test('Fix violations', () => {
                const expectedResult: ReportNextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: currentUserAccountID,
                };
                const result = buildOptimisticNextStep({
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
                    isTrackIntentUser: false,
                });

                expect(result).toMatchObject(expectedResult);
            });

            test('self review', () => {
                // Waiting for userSubmitter to submit expense(s).
                const expectedResult: ReportNextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: currentUserAccountID,
                };
                const result = buildOptimisticNextStep({
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
                    isTrackIntentUser: false,
                });

                expect(result).toMatchObject(expectedResult);
            });

            describe('scheduled submit enabled', () => {
                // Format: Waiting for userSubmitter's expense(s) to automatically submit on scheduledSubmitSettings

                test('daily', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit later today
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.TODAY,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });
                    expect(result).toMatchObject(expectedResult);
                });

                test('weekly', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on Sunday
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });

                test('twice a month', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 1st and 16th of each month
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });

                test('monthly on the 2nd', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 2nd of each month
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            dateTime: format(DateUtils.getNextNthOfMonth(2), 'yyyy-MM-dd'),
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });

                test('monthly on the last day', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastDayOfMonth of each month
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });
                    expect(result).toMatchObject(expectedResult);
                });

                test('monthly on the last business day', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastBusinessDayOfMonth of each month
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });

                test('trip', () => {
                    // Waiting for userSubmitter's expense(s) to automatically submit at the end of their trip
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                        eta: {
                            etaKey: CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP,
                        },
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });

                test('manual', () => {
                    // Waiting for userSubmitter to submit expense(s).
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been submitted', () => {
            test('self review', () => {
                // Waiting for an admin to pay expense(s)
                const expectedResult: ReportNextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: -1,
                };
                const result = buildOptimisticNextStep({
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
                    isTrackIntentUser: false,
                });

                expect(result).toMatchObject(expectedResult);
            });

            test('self review with bank account setup', () => {
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: -1,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);

                    // restore to previous state
                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                        achAccount: null,
                    });
                });
            });

            test('another reviewer', () => {
                report.managerID = strangeAccountID;
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    employeeList: {
                        [currentUserEmail]: {
                            submitsTo: strangeEmail,
                        },
                    },
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: strangeAccountID,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            test('another owner', () => {
                report.ownerAccountID = strangeAccountID;
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    employeeList: {
                        [strangeEmail]: {
                            submitsTo: currentUserEmail,
                        },
                    },
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: currentUserAccountID,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });
            test('submit and close approval mode', () => {
                report.ownerAccountID = strangeAccountID;
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            test('approval mode enabled', () => {
                report.managerID = strangeAccountID;
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: ownerAccountID,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            test('advanced approval mode enabled', () => {
                report.managerID = strangeAccountID;
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: strangeAccountID,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });
                    expect(result).toMatchObject(expectedResult);
                });
            });
        });

        describe('it generates an optimistic nextStep once a report has been approved', () => {
            test('disabled reimbursements', () => {
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            test('non-payer', () => {
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                    role: 'user',
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            test('payer', () => {
                // mock the report as approved
                const originalState = {stateNum: report.stateNum, statusNum: report.statusNum};
                report.stateNum = CONST.REPORT.STATE_NUM.APPROVED;
                report.statusNum = CONST.REPORT.STATUS_NUM.APPROVED;
                const expectedResult: ReportNextStep = {
                    messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                    icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                    actorAccountID: -1,
                };
                const result = buildOptimisticNextStep({
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
                    isTrackIntentUser: false,
                });

                expect(result).toMatchObject(expectedResult);

                // restore
                report.stateNum = originalState.stateNum;
                report.statusNum = originalState.statusNum;
            });

            test('payer with bank account setup', () => {
                return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(() => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY,
                        icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                        actorAccountID: -1,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });

            describe('it generates an optimistic nextStep once a report has been paid', () => {
                test('paid with wallet / outside of Expensify', () => {
                    const expectedResult: ReportNextStep = {
                        messageKey: CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION,
                        icon: CONST.NEXT_STEP.ICONS.CHECKMARK,
                    };
                    const result = buildOptimisticNextStep({
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
                        isTrackIntentUser: false,
                    });

                    expect(result).toMatchObject(expectedResult);
                });
            });
        });
    });

    describe('shouldShowDynamicExternalWorkflowApproveErrorNextStep', () => {
        const createDEWApproveFailedAction = (automaticAction?: boolean): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED> => ({
            actionName: CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
            reportActionID: '1',
            created: '2026-01-01 00:00:00.000',
            message: [],
            originalMessage: {
                message: 'DEW blocked approval',
                automaticAction,
            },
        });

        it('returns true for manual approve failures when the current user is the approver', () => {
            expect(shouldShowDynamicExternalWorkflowApproveErrorNextStep(createDEWApproveFailedAction(false), true, true)).toBe(true);
        });

        it('returns true when automaticAction is absent (treated as manual failure)', () => {
            expect(shouldShowDynamicExternalWorkflowApproveErrorNextStep(createDEWApproveFailedAction(), true, true)).toBe(true);
        });

        it('returns false for auto-approve failures so the normal workflow next step is kept', () => {
            expect(shouldShowDynamicExternalWorkflowApproveErrorNextStep(createDEWApproveFailedAction(true), true, true)).toBe(false);
        });

        it('returns false when the current user is not the approver', () => {
            expect(shouldShowDynamicExternalWorkflowApproveErrorNextStep(createDEWApproveFailedAction(false), true, false)).toBe(false);
        });

        it('returns false when there is no active DEW approve failure', () => {
            expect(shouldShowDynamicExternalWorkflowApproveErrorNextStep(createDEWApproveFailedAction(false), false, true)).toBe(false);
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
            const currentNextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
            };

            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-1',
                    getCurrencyDecimals: getCurrencyDecimalsLocal,
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
                nextStep: currentNextStep,
            } as Report;

            const result = getReportNextStep({
                moneyRequestReport: report,
                moneyRequestReportOwnerLogin: currentUserEmail,
                transactions: [],
                policy: undefined,
                transactionViolations: {},
                currentUserEmail,
                currentUserAccountID,
            });
            expect(result).toBe(currentNextStep);
        });

        it('returns an optimistic fix issue next step when all transactions have submission-blocking violations', () => {
            const report: Report = {
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-2',
                    getCurrencyDecimals: getCurrencyDecimalsLocal,
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

            const transaction = createMock<Transaction>({
                transactionID: 'txn-1',
                reportID: report.reportID,
                amount: -500,
                currency: CONST.CURRENCY.USD,
            });

            const transactionViolations: OnyxCollection<TransactionViolations> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
            };

            const result = getReportNextStep({
                moneyRequestReport: report,
                moneyRequestReportOwnerLogin: currentUserEmail,
                transactions: [transaction],
                policy: undefined,
                transactionViolations,
                currentUserEmail,
                currentUserAccountID,
            });

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
                    getCurrencyDecimals: getCurrencyDecimalsLocal,
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

            const result = getReportNextStep({
                moneyRequestReport: report,
                moneyRequestReportOwnerLogin: currentUserEmail,
                transactions: [],
                policy,
                transactionViolations: {},
                currentUserEmail,
                currentUserAccountID,
            });
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
                    getCurrencyDecimals: getCurrencyDecimalsLocal,
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

            const transaction = createMock<Transaction>({
                transactionID: 'txn-2',
                reportID: report.reportID,
                amount: -500,
                currency: CONST.CURRENCY.USD,
            });

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

            const result = getReportNextStep({
                moneyRequestReport: report,
                moneyRequestReportOwnerLogin: currentUserEmail,
                transactions: [transaction],
                policy,
                transactionViolations,
                currentUserEmail,
                currentUserAccountID,
            });

            expect(result).toEqual({
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: report.ownerAccountID,
            });
        });
    });

    describe('buildNextStepMessage', () => {
        it('resolves the actor name through the provided translate function', async () => {
            const hiddenActorAccountID = 780070;
            // The actor has no displayName/login, so its name resolves to the hidden label provided by translate.
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[hiddenActorAccountID]: {accountID: hiddenActorAccountID, login: '', displayName: ''}});
            await waitForBatchedUpdates();
            const nextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: hiddenActorAccountID,
            };
            // The provided translate resolves the hidden actor label and renders the message body around the actor name.
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'common.hidden') {
                    return 'HiddenMarker';
                }
                if (path === 'nextStep.message.waitingToSubmit') {
                    return `Waiting for ${String(parameters.at(0))} to submit expenses.`;
                }
                return translateLocal(path, ...parameters);
            };

            // A currentUserAccountID different from the actor renders the actor as an OTHER_USER, so its name appears in the message.
            const message = buildNextStepMessage(nextStep, translateWithHiddenMarker, undefined, 999999, formatPhoneNumber);
            expect(message).toBe('<next-step>Waiting for HiddenMarker to submit expenses.</next-step>');
        });

        it.each([
            {requiredDepositCurrency: CONST.CURRENCY.USD, expectedAccount: 'USD bank account'},
            {requiredDepositCurrency: '<strong>USD</strong>', expectedAccount: '&lt;strong&gt;USD&lt;/strong&gt; bank account'},
            {requiredDepositCurrency: undefined, expectedAccount: 'bank account'},
        ])('renders the required deposit currency when it is available', ({requiredDepositCurrency, expectedAccount}) => {
            const currentUserAccountID = 780071;
            const nextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: currentUserAccountID,
                requiredDepositCurrency,
            };
            const translateWithDepositCurrency: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'nextStep.message.waitingForSubmitterAccount') {
                    const currency = parameters.at(4);
                    const account = typeof currency === 'string' ? `${currency} bank account` : 'bank account';
                    return `Waiting for <strong>you</strong> to add a ${account}.`;
                }
                return translateLocal(path, ...parameters);
            };

            const message = buildNextStepMessage(nextStep, translateWithDepositCurrency, undefined, currentUserAccountID, formatPhoneNumber);
            expect(message).toBe(`<next-step>Waiting for <strong>you</strong> to add a ${expectedAccount}.</next-step>`);
        });

        it('uses the provided phone number formatter when resolving an SMS actor login', async () => {
            const phoneActorAccountID = 780071;
            const phoneActorLogin = '18332403628@expensify.sms';
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[phoneActorAccountID]: {accountID: phoneActorAccountID, login: phoneActorLogin}});
            await waitForBatchedUpdates();
            const nextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: phoneActorAccountID,
            };
            const translateWithActorName: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'nextStep.message.waitingToSubmit') {
                    return `Waiting for ${String(parameters.at(0))} to submit expenses.`;
                }
                return translateLocal(path, ...parameters);
            };
            const formatPhoneNumberMock = jest.fn((phoneNumber: string) => `formatted:${phoneNumber}`);

            const message = buildNextStepMessage(nextStep, translateWithActorName, undefined, 999999, formatPhoneNumberMock);

            expect(formatPhoneNumberMock).toHaveBeenCalledWith(phoneActorLogin);
            expect(message).toBe(`<next-step>Waiting for formatted:${phoneActorLogin} to submit expenses.</next-step>`);
        });

        it('renders a monthly automatic-submit eta using the day-of-month it encodes, not one shifted by UTC parsing', () => {
            // A date-only `eta.dateTime` must render as the same day it encodes regardless of the browser timezone.
            // Native `new Date('2026-08-15')` parses as UTC midnight and shows the 14th in UTC-negative timezones;
            // `parseISO` keeps it at local midnight so the ordinal day matches the workspace setting.
            const nextStep: ReportNextStep = {
                messageKey: CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT,
                icon: CONST.NEXT_STEP.ICONS.HOURGLASS,
                actorAccountID: 999999,
                eta: {dateTime: '2026-08-15'},
            };
            // Echo the rendered eta (parameter index 2) so we can assert the ordinal day the user actually sees.
            const translateEta: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'nextStep.message.waitingForAutomaticSubmit') {
                    return String(parameters.at(2));
                }
                return translateLocal(path, ...parameters);
            };

            const message = buildNextStepMessage(nextStep, translateEta, undefined, 999999, formatPhoneNumber);
            expect(message).toBe('<next-step>15th</next-step>');
        });

        describe('renders a monthly automatic-submit eta on the encoded day of month in every timezone', () => {
            // `buildNextStepMessage` renders a date-only `eta.dateTime` with date-fns, which uses the ambient system
            // timezone. Jest is pinned to UTC (`TZ=utc`) and V8 caches that at process start, so we cannot change the
            // timezone from inside this process. UTC is also the one zone where the bug is invisible, because UTC
            // midnight and local midnight coincide. To exercise real UTC-negative/positive offsets we run the same
            // parse+format expression used by buildNextStepMessage (see src/libs/NextStepUtils.ts:86) in a child
            // `node` process with a real `TZ`. `fixed` mirrors the shipped `parseISO` parsing; `legacy` mirrors the
            // old `new Date` parsing that caused the regression.
            const renderEtaDayInTimezone = (timezone: string): {fixed: string; legacy: string} => {
                const dateOnly = '2026-08-15';
                // Print the fixed (`parseISO`) and legacy (`new Date`) ordinals space-separated so the parent can read
                // them back as plain strings without an unsafe cast.
                const script = `const {format,parseISO}=require('date-fns');process.stdout.write([format(parseISO('${dateOnly}'),'do'),format(new Date('${dateOnly}'),'do')].join(' '));`;
                const out = execFileSync(process.execPath, ['-e', script], {env: {...process.env, TZ: timezone}, encoding: 'utf8'});
                const [fixed, legacy] = out.split(' ');
                return {fixed, legacy};
            };

            it.each([
                ['Asia/Tokyo', 'positive'],
                ['Europe/Paris', 'positive'],
                ['UTC', 'zero'],
                ['America/New_York', 'negative'],
                ['America/Los_Angeles', 'negative'],
                ['Pacific/Honolulu', 'negative'],
            ])('renders the encoded day (15th) in %s (%s UTC offset)', (timezone, offsetSign) => {
                const {fixed, legacy} = renderEtaDayInTimezone(timezone);

                // The shipped fix renders the encoded day in every timezone.
                expect(fixed).toBe('15th');

                // In UTC-negative zones the old `new Date` parsing shifts the day back by one. Asserting it here both
                // documents the regression and guarantees the child really ran in a UTC-negative zone. Otherwise this
                // would read '15th' and fail loudly instead of the test silently degrading into a UTC-only no-op.
                if (offsetSign === 'negative') {
                    expect(legacy).toBe('14th');
                }
            });
        });
    });

    describe('buildOptimisticNextStep', () => {
        const currentUserEmail = 'current-user@expensify.com';
        const currentUserAccountID = 37;
        const policyID = 'submit-and-close-policy';

        const policy: Policy = {
            id: policyID,
            name: 'Submit and Close Policy',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            owner: currentUserEmail,
            outputCurrency: CONST.CURRENCY.USD,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            approver: currentUserEmail,
            harvesting: {
                enabled: false,
            },
            employeeList: {
                [currentUserEmail]: {
                    email: currentUserEmail,
                    role: CONST.POLICY.ROLE.ADMIN,
                    submitsTo: currentUserEmail,
                },
            },
        };

        beforeAll(async () => {
            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (item) => item.id);

            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [currentUserAccountID]: {
                        accountID: currentUserAccountID,
                        login: currentUserEmail,
                        avatar: '',
                    },
                },
                ...policyCollectionDataSet,
            });
            await waitForBatchedUpdates();
        });

        const getOpenSubmitAndCloseReport = (): Report =>
            ({
                ...buildOptimisticExpenseReport({
                    chatReportID: 'chat-track-intent',
                    getCurrencyDecimals: getCurrencyDecimalsLocal,
                    policyID,
                    payeeAccountID: currentUserAccountID,
                    total: -500,
                    currency: CONST.CURRENCY.USD,
                    betas: [CONST.BETAS.ALL],
                }),
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                transactionCount: 1,
            }) as Report;

        it('returns WAITING_TO_MARK_AS_DONE when isTrackIntentUser is true for an open submit-and-close report', () => {
            const report = getOpenSubmitAndCloseReport();

            const result = buildOptimisticNextStep({
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
                isTrackIntentUser: true,
            });

            expect(result?.messageKey).toBe(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE);
        });

        it('returns WAITING_TO_SUBMIT when isTrackIntentUser is false for the same report', () => {
            const report = getOpenSubmitAndCloseReport();

            const result = buildOptimisticNextStep({
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
                isTrackIntentUser: false,
            });

            expect(result?.messageKey).toBe(CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT);
        });
    });
});
