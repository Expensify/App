"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var NextStepUtils_1 = require("@libs/NextStepUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CollectionDataSet_1 = require("@src/types/utils/CollectionDataSet");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
describe('libs/NextStepUtils', function () {
    describe('buildNextStep', function () {
        var currentUserEmail = 'current-user@expensify.com';
        var currentUserAccountID = 37;
        var strangeEmail = 'stranger@expensify.com';
        var strangeAccountID = 50;
        var ownerEmail = 'owner@expensify.com';
        var ownerAccountID = 99;
        var policyID = '1';
        var policy = {
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
            outputCurrency: CONST_1.default.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        };
        var optimisticNextStep = {
            type: 'neutral',
            icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
            message: [],
        };
        var report = (0, ReportUtils_1.buildOptimisticExpenseReport)('fake-chat-report-id-1', policyID, 1, -500, CONST_1.default.CURRENCY.USD);
        beforeAll(function () {
            var _a, _b;
            var policyCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS_1.default.COLLECTION.POLICY, [policy], function (item) { return item.id; });
            react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: currentUserAccountID }, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_b = {},
                _b[strangeAccountID] = {
                    accountID: strangeAccountID,
                    login: strangeEmail,
                    avatar: '',
                },
                _b[currentUserAccountID] = {
                    accountID: currentUserAccountID,
                    login: currentUserEmail,
                    avatar: '',
                },
                _b[ownerAccountID] = {
                    accountID: ownerAccountID,
                    login: ownerEmail,
                    avatar: '',
                },
                _b), _a), policyCollectionDataSet)).then(waitForBatchedUpdates_1.default);
        });
        beforeEach(function () {
            report.ownerAccountID = currentUserAccountID;
            report.managerID = currentUserAccountID;
            optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
            optimisticNextStep.message = [];
            react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), policy).then(waitForBatchedUpdates_1.default);
        });
        describe('it generates and optimistic nextStep once a report has been created', function () {
            test('Correct next steps message', function () {
                var emptyReport = (0, ReportUtils_1.buildOptimisticEmptyReport)('fake-empty-report-id-2', currentUserAccountID, { reportID: 'fake-parent-report-id-3' }, 'fake-parent-report-action-id-4', policy, '2025-03-31 13:23:11');
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(currentUserEmail),
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
                var result = (0, NextStepUtils_1.buildNextStep)(emptyReport, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                expect(result).toMatchObject(optimisticNextStep);
            });
        });
        describe('it generates an optimistic nextStep once a report has been opened', function () {
            test('Fix violations', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(currentUserEmail),
                        type: 'strong',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'fix the issue(s)',
                    },
                ];
                var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN, true);
                expect(result).toMatchObject(optimisticNextStep);
            });
            test('self review', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                // Waiting for userSubmitter to add expense(s).
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(currentUserEmail),
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
                var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                expect(result).toMatchObject(optimisticNextStep);
            });
            describe('scheduled submit enabled', function () {
                beforeEach(function () {
                    optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                });
                // Format: Waiting for userSubmitter's expense(s) to automatically submit on scheduledSubmitSettings
                test('daily', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit later today
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('weekly', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit on Sunday
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('twice a month', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 1st and 16th of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('monthly on the 2nd', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit on the 2nd of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: 2,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('monthly on the last day', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastDayOfMonth of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                            text: " on the last day of the month",
                        },
                    ];
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('monthly on the last business day', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit on lastBusinessDayOfMonth of each month
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                            text: " on the last business day of the month",
                        },
                    ];
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
                        autoReportingOffset: CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('trip', function () {
                    // Waiting for userSubmitter's expense(s) to automatically submit at the end of their trip
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
                            clickToCopyText: "".concat(currentUserEmail),
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
                            text: " at the end of their trip",
                        },
                    ];
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP,
                        harvesting: {
                            enabled: true,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
                test('manual', function () {
                    // Waiting for userSubmitter to submit expense(s).
                    optimisticNextStep.message = [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(currentUserEmail),
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
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                        harvesting: {
                            enabled: false,
                        },
                    }).then(function () {
                        var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.OPEN);
                        expect(result).toMatchObject(optimisticNextStep);
                    });
                });
            });
        });
        describe('it generates an optimistic nextStep once a report has been submitted', function () {
            test('self review', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                // Waiting for an admin to set up a bank account
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "an admin",
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'finish setting up',
                    },
                    {
                        text: ' a business bank account.',
                    },
                ];
                var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.APPROVED);
                expect(result).toMatchObject(optimisticNextStep);
            });
            test('self review with bank account setup', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                // Waiting for an admin to pay expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "an admin",
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.APPROVED);
                    expect(result).toMatchObject(optimisticNextStep);
                    // restore to previous state
                    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                        achAccount: null,
                    });
                });
            });
            test('another reviewer', function () {
                var _a;
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    employeeList: (_a = {},
                        _a[currentUserEmail] = {
                            submitsTo: strangeEmail,
                        },
                        _a),
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.SUBMITTED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('another owner', function () {
                var _a;
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    employeeList: (_a = {},
                        _a[strangeEmail] = {
                            submitsTo: currentUserEmail,
                        },
                        _a),
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.SUBMITTED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('submit and close approval mode', function () {
                report.ownerAccountID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.CHECKMARK;
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL,
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.CLOSED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('approval mode enabled', function () {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.SUBMITTED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('advanced approval mode enabled', function () {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED,
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.SUBMITTED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });
        describe('it generates an optimistic nextStep once a report has been approved', function () {
            test('non-payer', function () {
                report.managerID = strangeAccountID;
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.CHECKMARK;
                optimisticNextStep.message = [
                    {
                        text: 'No further action required!',
                    },
                ];
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.APPROVED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            test('payer', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                // Waiting for an admin to set up a bank account
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: 'an admin',
                    },
                    {
                        text: ' to ',
                    },
                    {
                        text: 'finish setting up',
                    },
                    {
                        text: ' a business bank account.',
                    },
                ];
                // mock the report as approved
                var originalState = { stateNum: report.stateNum, statusNum: report.statusNum };
                report.stateNum = CONST_1.default.REPORT.STATE_NUM.APPROVED;
                report.statusNum = CONST_1.default.REPORT.STATUS_NUM.APPROVED;
                var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.APPROVED);
                expect(result).toMatchObject(optimisticNextStep);
                // restore
                report.stateNum = originalState.stateNum;
                report.statusNum = originalState.statusNum;
            });
            test('payer with bank account setup', function () {
                optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.HOURGLASS;
                // Waiting for an admin to pay expense(s)
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: 'an admin',
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
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
                    achAccount: {
                        accountNumber: '123456789',
                    },
                }).then(function () {
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.APPROVED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
            describe('it generates an optimistic nextStep once a report has been paid', function () {
                test('paid with wallet / outside of Expensify', function () {
                    optimisticNextStep.icon = CONST_1.default.NEXT_STEP.ICONS.CHECKMARK;
                    optimisticNextStep.message = [
                        {
                            text: 'No further action required!',
                        },
                    ];
                    var result = (0, NextStepUtils_1.buildNextStep)(report, CONST_1.default.REPORT.STATUS_NUM.REIMBURSED);
                    expect(result).toMatchObject(optimisticNextStep);
                });
            });
        });
    });
});
