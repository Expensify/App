"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var useIndicatorStatus_1 = require("@hooks/useIndicatorStatus");
// eslint-disable-next-line no-restricted-imports
var theme_1 = require("@styles/theme");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var getMockForStatus = function (status, isAdmin) {
    var _a;
    if (isAdmin === void 0) { isAdmin = true; }
    return (_a = {},
        _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1")] = {
            id: '1',
            name: 'Workspace 1',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            customUnits: status === CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR
                ? {
                    errors: {
                        error: 'Something went wrong',
                    },
                }
                : undefined,
        },
        _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "2")] = {
            id: '2',
            name: 'Workspace 2',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            errors: status === CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS
                ? {
                    error: 'Something went wrong',
                }
                : undefined,
        },
        _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "3")] = {
            id: '3',
            name: 'Workspace 3',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            employeeList: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'johndoe12@expensify.com': {
                    email: 'johndoe12@expensify.com',
                    errors: status === CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR
                        ? {
                            error: 'Something went wrong',
                        }
                        : undefined,
                },
            },
        },
        _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "4")] = {
            id: '4',
            name: 'Workspace 4',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'auditor',
            connections: status === CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS
                ? {
                    xero: {
                        lastSync: {
                            isSuccessful: false,
                            errorDate: new Date().toISOString(),
                        },
                    },
                }
                : undefined,
        },
        _a[ONYXKEYS_1.default.BANK_ACCOUNT_LIST] = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            12345: {
                methodID: 12345,
                errors: status === CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR
                    ? {
                        error: 'Something went wrong',
                    }
                    : undefined,
            },
        },
        _a[ONYXKEYS_1.default.USER_WALLET] = {
            bankAccountID: 12345,
            errors: status === CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS
                ? {
                    error: 'Something went wrong',
                }
                : undefined,
        },
        _a[ONYXKEYS_1.default.WALLET_TERMS] = {
            errors: status === CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS
                ? {
                    error: 'Something went wrong',
                }
                : undefined,
        },
        _a[ONYXKEYS_1.default.LOGIN_LIST] = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'johndoe12@expensify.com': {
                partnerName: 'John Doe',
                partnerUserID: 'johndoe12@expensify.com',
                validatedDate: status !== CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? new Date().toISOString() : undefined,
                errorFields: status === CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR
                    ? {
                        field: {
                            error: 'Something went wrong',
                        },
                    }
                    : undefined,
            },
        },
        _a[ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT] = {
            achData: {
                bankAccountID: 12345,
            },
            errors: status === CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS
                ? {
                    error: 'Something went wrong',
                }
                : undefined,
        },
        _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL] = status === CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
        _a[ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED] = status === CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
        _a);
};
var TEST_CASES = [
    {
        name: 'has policy errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS,
        policyIDWithErrors: '2',
    },
    {
        name: 'has custom units error',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
        policyIDWithErrors: '1',
    },
    {
        name: 'has employee list error',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
        policyIDWithErrors: '3',
    },
    {
        name: 'has sync errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS,
        policyIDWithErrors: '4',
    },
    {
        name: 'has user wallet errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has payment method error',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has subscription errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has reimbursement account errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has login list error',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has wallet terms errors',
        indicatorColor: theme_1.defaultTheme.danger,
        status: CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has login list info',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO,
        policyIDWithErrors: undefined,
    },
    {
        name: 'has subscription info',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
        policyIDWithErrors: undefined,
    },
];
var TEST_CASES_NON_ADMIN = [
    {
        name: 'has custom units error but not an admin so no RBR',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
    },
    {
        name: 'has policy errors but not an admin so no RBR',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS,
    },
    {
        name: 'has employee list error but not an admin so no RBR',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
    },
    {
        name: 'has sync errors but not an admin so no RBR',
        indicatorColor: theme_1.defaultTheme.success,
        status: CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS,
    },
];
describe('useIndicatorStatusTest', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    describe.each(TEST_CASES)('$name', function (testCase) {
        beforeAll(function () {
            return react_native_onyx_1.default.multiSet(getMockForStatus(testCase.status)).then(waitForBatchedUpdates_1.default);
        });
        it('returns correct indicatorColor', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useIndicatorStatus_1.default)(); }).result;
            var indicatorColor = result.current.indicatorColor;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });
        it('returns correct status', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useIndicatorStatus_1.default)(); }).result;
            var status = result.current.status;
            expect(status).toBe(testCase.status);
        });
        it('returns correct policyIDWithErrors', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useIndicatorStatus_1.default)(); }).result;
            var policyIDWithErrors = result.current.policyIDWithErrors;
            expect(policyIDWithErrors).toBe(testCase.policyIDWithErrors);
        });
    });
    describe.each(TEST_CASES_NON_ADMIN)('$name', function (testCase) {
        beforeAll(function () {
            return react_native_onyx_1.default.multiSet(getMockForStatus(testCase.status, false)).then(waitForBatchedUpdates_1.default);
        });
        it('returns correct indicatorColor', function () {
            var result = (0, react_native_1.renderHook)(function () { return (0, useIndicatorStatus_1.default)(); }).result;
            var indicatorColor = result.current.indicatorColor;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });
    });
});
