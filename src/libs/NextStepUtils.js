"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessage = parseMessage;
exports.buildNextStep = buildNextStep;
exports.buildOptimisticNextStepForPreventSelfApprovalsEnabled = buildOptimisticNextStepForPreventSelfApprovalsEnabled;
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmailUtils_1 = require("./EmailUtils");
var Permissions_1 = require("./Permissions");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportUtils_1 = require("./ReportUtils");
var currentUserAccountID = -1;
var currentUserEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a, _b;
        if (!value) {
            return;
        }
        currentUserAccountID = (_a = value === null || value === void 0 ? void 0 : value.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
        currentUserEmail = (_b = value === null || value === void 0 ? void 0 : value.email) !== null && _b !== void 0 ? _b : '';
    },
});
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
var allBetas;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.BETAS,
    callback: function (value) { return (allBetas = value); },
});
var transactionViolations;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        transactionViolations = value;
    },
});
function parseMessage(messages) {
    var nextStepHTML = '';
    messages === null || messages === void 0 ? void 0 : messages.forEach(function (part, index) {
        var _a;
        var isEmail = expensify_common_1.Str.isValidEmail(part.text);
        var tagType = (_a = part.type) !== null && _a !== void 0 ? _a : 'span';
        var content = expensify_common_1.Str.safeEscape(part.text);
        var previousPart = index !== 0 ? messages.at(index - 1) : undefined;
        var nextPart = messages.at(index + 1);
        if (currentUserEmail === part.text || part.clickToCopyText === currentUserEmail) {
            tagType = 'strong';
            content = (nextPart === null || nextPart === void 0 ? void 0 : nextPart.text) === "'s" ? 'your' : 'you';
        }
        else if (part.text === "'s" && ((previousPart === null || previousPart === void 0 ? void 0 : previousPart.text) === currentUserEmail || (previousPart === null || previousPart === void 0 ? void 0 : previousPart.clickToCopyText) === currentUserEmail)) {
            content = '';
        }
        else if (isEmail) {
            tagType = 'next-step-email';
            content = EmailUtils_1.default.prefixMailSeparatorsWithBreakOpportunities(content);
        }
        nextStepHTML += "<".concat(tagType, ">").concat(content, "</").concat(tagType, ">");
    });
    var formattedHtml = nextStepHTML
        .replace(/%expenses/g, 'expense(s)')
        .replace(/%Expenses/g, 'Expense(s)')
        .replace(/%tobe/g, 'are');
    return "<next-step>".concat(formattedHtml, "</next-step>");
}
function getNextApproverDisplayName(report, isUnapprove) {
    var _a;
    var approverAccountID = (0, ReportUtils_1.getNextApproverAccountID)(report, isUnapprove);
    return (_a = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: approverAccountID })) !== null && _a !== void 0 ? _a : (0, ReportUtils_1.getPersonalDetailsForAccountID)(approverAccountID).login;
}
function buildOptimisticNextStepForPreventSelfApprovalsEnabled() {
    var optimisticNextStep = {
        type: 'alert',
        icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
        message: [
            {
                text: "Oops! Looks like you're submitting to ",
            },
            {
                text: 'yourself',
                type: 'next-step-email',
            },
            {
                text: '. Approving your own reports is ',
            },
            {
                text: 'forbidden',
                type: 'next-step-email',
            },
            {
                text: ' by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.',
            },
        ],
    };
    return optimisticNextStep;
}
/**
 * Generates an optimistic nextStep based on a current report status and other properties.
 *
 * @param report
 * @param predictedNextStatus - a next expected status of the report
 * @param shouldFixViolations - whether to show `fix the issue` next step
 * @param isUnapprove - whether a report is being unapproved
 * @param isReopen - whether a report is being reopened
 * @returns nextStep
 */
function buildNextStep(report, predictedNextStatus, shouldFixViolations, isUnapprove, isReopen) {
    var _a;
    var _b, _c, _d, _e, _f, _g, _h;
    if (!(0, ReportUtils_1.isExpenseReport)(report)) {
        return null;
    }
    var _j = report !== null && report !== void 0 ? report : {}, _k = _j.policyID, policyID = _k === void 0 ? '' : _k, _l = _j.ownerAccountID, ownerAccountID = _l === void 0 ? -1 : _l;
    var policy = (_b = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) !== null && _b !== void 0 ? _b : {};
    var harvesting = policy.harvesting, autoReportingOffset = policy.autoReportingOffset;
    var autoReportingFrequency = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy);
    var hasViolations = (0, ReportUtils_1.hasViolations)(report === null || report === void 0 ? void 0 : report.reportID, transactionViolations);
    var isASAPSubmitBetaEnabled = Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.ASAP_SUBMIT, allBetas);
    var isInstantSubmitEnabled = autoReportingFrequency === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
    var shouldShowFixMessage = hasViolations && isInstantSubmitEnabled && !isASAPSubmitBetaEnabled;
    var _m = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({
        accountIDs: [(_c = policy.ownerAccountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID, ownerAccountID],
        currentUserAccountID: currentUserAccountID,
        shouldChangeUserDisplayName: true,
    }), policyOwnerPersonalDetails = _m[0], ownerPersonalDetails = _m[1];
    var isReportContainingTransactions = report &&
        ((report.total !== 0 && report.total !== undefined) ||
            (report.unheldTotal !== 0 && report.unheldTotal !== undefined) ||
            (report.unheldNonReimbursableTotal !== 0 && report.unheldNonReimbursableTotal !== undefined));
    var ownerDisplayName = (_e = (_d = ownerPersonalDetails === null || ownerPersonalDetails === void 0 ? void 0 : ownerPersonalDetails.displayName) !== null && _d !== void 0 ? _d : ownerPersonalDetails === null || ownerPersonalDetails === void 0 ? void 0 : ownerPersonalDetails.login) !== null && _e !== void 0 ? _e : (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: ownerAccountID });
    var policyOwnerDisplayName = (_g = (_f = policyOwnerPersonalDetails === null || policyOwnerPersonalDetails === void 0 ? void 0 : policyOwnerPersonalDetails.displayName) !== null && _f !== void 0 ? _f : policyOwnerPersonalDetails === null || policyOwnerPersonalDetails === void 0 ? void 0 : policyOwnerPersonalDetails.login) !== null && _g !== void 0 ? _g : (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: policy.ownerAccountID });
    var nextApproverDisplayName = getNextApproverDisplayName(report, isUnapprove);
    var approverAccountID = (0, ReportUtils_1.getNextApproverAccountID)(report, isUnapprove);
    var approvers = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)([approverAccountID !== null && approverAccountID !== void 0 ? approverAccountID : CONST_1.default.DEFAULT_NUMBER_ID]);
    var reimburserAccountID = (0, PolicyUtils_1.getReimburserAccountID)(policy);
    var hasValidAccount = !!((_h = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _h === void 0 ? void 0 : _h.accountNumber) || policy.reimbursementChoice !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
    var type = 'neutral';
    var optimisticNextStep;
    var nextStepPayExpense = {
        type: type,
        icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
        message: __spreadArray([
            {
                text: 'Waiting for ',
            },
            ownerAccountID === -1 || !policy.ownerAccountID
                ? {
                    text: 'an admin',
                }
                : {
                    text: shouldShowFixMessage ? ownerDisplayName : policyOwnerDisplayName,
                    type: 'strong',
                },
            {
                text: ' to ',
            }
        ], (shouldShowFixMessage ? [{ text: 'fix the issue(s)' }] : [{ text: 'pay' }, { text: ' %expenses.' }]), true),
    };
    var noActionRequired = {
        icon: CONST_1.default.NEXT_STEP.ICONS.CHECKMARK,
        type: type,
        message: [
            {
                text: 'No further action required!',
            },
        ],
    };
    switch (predictedNextStatus) {
        // Generates an optimistic nextStep once a report has been opened
        case CONST_1.default.REPORT.STATUS_NUM.OPEN:
            if ((isASAPSubmitBetaEnabled && hasViolations && isInstantSubmitEnabled) || shouldFixViolations) {
                optimisticNextStep = {
                    type: type,
                    icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
                    message: [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(ownerDisplayName),
                            type: 'strong',
                            clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
                        },
                        {
                            text: ' to ',
                        },
                        {
                            text: 'fix the issue(s)',
                        },
                    ],
                };
                break;
            }
            if (isReopen) {
                optimisticNextStep = {
                    type: type,
                    icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
                    message: [
                        {
                            text: 'Waiting for ',
                        },
                        {
                            text: "".concat(ownerDisplayName),
                            type: 'strong',
                            clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
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
                    ],
                };
                break;
            }
            // Self review
            optimisticNextStep = {
                type: type,
                icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(ownerDisplayName),
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
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
                ],
            };
            // Scheduled submit enabled
            if ((harvesting === null || harvesting === void 0 ? void 0 : harvesting.enabled) && autoReportingFrequency !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL && isReportContainingTransactions) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(ownerDisplayName),
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
                    },
                    {
                        text: "'s",
                        type: 'strong',
                    },
                    {
                        text: ' %expenses to automatically submit',
                    },
                ];
                var harvestingSuffix = '';
                if (autoReportingFrequency) {
                    var currentDate = new Date();
                    var autoSubmissionDate = '';
                    var monthlyText = '';
                    if (autoReportingOffset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                        monthlyText = 'on the last day of the month';
                    }
                    else if (autoReportingOffset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                        monthlyText = 'on the last business day of the month';
                    }
                    else if (autoReportingOffset !== undefined) {
                        autoSubmissionDate = (0, date_fns_1.format)((0, date_fns_1.setDate)(currentDate, autoReportingOffset), CONST_1.default.DATE.ORDINAL_DAY_OF_MONTH);
                    }
                    var harvestingSuffixes = (_a = {},
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE] = 'later today',
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY] = 'on Sunday',
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY] = 'on the 1st and 16th of each month',
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY] = autoSubmissionDate ? "on the ".concat(autoSubmissionDate, " of each month") : monthlyText,
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP] = 'at the end of their trip',
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT] = '',
                        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL] = '',
                        _a);
                    if (harvestingSuffixes[autoReportingFrequency]) {
                        harvestingSuffix = "".concat(harvestingSuffixes[autoReportingFrequency]);
                    }
                }
                optimisticNextStep.message.push({
                    text: " ".concat(harvestingSuffix),
                });
            }
            // Manual submission
            if ((report === null || report === void 0 ? void 0 : report.total) !== 0 && !(harvesting === null || harvesting === void 0 ? void 0 : harvesting.enabled) && autoReportingFrequency === CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: "".concat(ownerDisplayName),
                        type: 'strong',
                        clickToCopyText: ownerAccountID === currentUserAccountID ? currentUserEmail : '',
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
            }
            break;
        // Generates an optimistic nextStep once a report has been submitted
        case CONST_1.default.REPORT.STATUS_NUM.SUBMITTED: {
            if (policy.approvalMode === CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL) {
                optimisticNextStep = nextStepPayExpense;
                break;
            }
            // Another owner
            optimisticNextStep = {
                type: type,
                icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
            };
            // We want to show pending approval next step for cases where the policy has approvals enabled
            var policyApprovalMode_1 = (0, PolicyUtils_1.getApprovalWorkflow)(policy);
            if ([CONST_1.default.POLICY.APPROVAL_MODE.BASIC, CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED].some(function (approvalMode) { return approvalMode === policyApprovalMode_1; })) {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    {
                        text: nextApproverDisplayName,
                        type: 'strong',
                        clickToCopyText: approvers.at(0),
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
            }
            else {
                optimisticNextStep.message = [
                    {
                        text: 'Waiting for ',
                    },
                    (0, ReportUtils_1.isPayer)({
                        accountID: currentUserAccountID,
                        email: currentUserEmail,
                    }, report)
                        ? {
                            text: "you",
                            type: 'strong',
                        }
                        : {
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
            }
            break;
        }
        // Generates an optimistic nextStep once a report has been closed for example in the case of Submit and Close approval flow
        case CONST_1.default.REPORT.STATUS_NUM.CLOSED:
            optimisticNextStep = noActionRequired;
            break;
        // Generates an optimistic nextStep once a report has been paid
        case CONST_1.default.REPORT.STATUS_NUM.REIMBURSED:
            optimisticNextStep = noActionRequired;
            break;
        // Generates an optimistic nextStep once a report has been approved
        case CONST_1.default.REPORT.STATUS_NUM.APPROVED:
            if ((0, ReportUtils_1.isInvoiceReport)(report) ||
                !(0, ReportUtils_1.isPayer)({
                    accountID: currentUserAccountID,
                    email: currentUserEmail,
                }, report)) {
                optimisticNextStep = noActionRequired;
                break;
            }
            // Self review
            optimisticNextStep = {
                type: type,
                icon: CONST_1.default.NEXT_STEP.ICONS.HOURGLASS,
                message: [
                    {
                        text: 'Waiting for ',
                    },
                    reimburserAccountID === -1
                        ? {
                            text: 'an admin',
                        }
                        : {
                            text: (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: reimburserAccountID }),
                            type: 'strong',
                        },
                    {
                        text: ' to ',
                    },
                    {
                        text: hasValidAccount ? 'pay' : 'finish setting up',
                    },
                    {
                        text: hasValidAccount ? ' %expenses.' : ' a business bank account.',
                    },
                ],
            };
            break;
        // Resets a nextStep
        default:
            optimisticNextStep = null;
    }
    return optimisticNextStep;
}
