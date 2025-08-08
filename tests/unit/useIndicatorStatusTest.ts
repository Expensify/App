import {renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useIndicatorStatus from '@hooks/useIndicatorStatus';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getMockForStatus = (status: string, isAdmin = true) =>
    ({
        [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: {
            id: '1',
            name: 'Workspace 1',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            customUnits:
                status === CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR
                    ? {
                          errors: {
                              error: 'Something went wrong',
                          },
                      }
                    : undefined,
        },
        [`${ONYXKEYS.COLLECTION.POLICY}2` as const]: {
            id: '2',
            name: 'Workspace 2',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            errors:
                status === CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [`${ONYXKEYS.COLLECTION.POLICY}3` as const]: {
            id: '3',
            name: 'Workspace 3',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            employeeList: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'johndoe12@expensify.com': {
                    email: 'johndoe12@expensify.com',
                    errors:
                        status === CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR
                            ? {
                                  error: 'Something went wrong',
                              }
                            : undefined,
                },
            },
        },
        [`${ONYXKEYS.COLLECTION.POLICY}4` as const]: {
            id: '4',
            name: 'Workspace 4',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'auditor',
            connections:
                status === CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS
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
        [`${ONYXKEYS.COLLECTION.POLICY}5` as const]: {
            id: '5',
            name: 'Workspace 5',
            owner: 'johndoe12@expensify.com',
            role: isAdmin ? 'admin' : 'user',
            connections:
                status === CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR
                    ? {
                          quickbooksOnline: {
                              config: {
                                  reimbursableExpensesExportDestination: 'journal_entry',
                                  reimbursableExpensesAccount: undefined,
                              },
                          },
                      }
                    : undefined,
        },
        [ONYXKEYS.BANK_ACCOUNT_LIST]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            12345: {
                methodID: 12345,
                errors:
                    status === CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR
                        ? {
                              error: 'Something went wrong',
                          }
                        : undefined,
            },
        },
        [ONYXKEYS.USER_WALLET]: {
            bankAccountID: 12345,
            errors:
                status === CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [ONYXKEYS.WALLET_TERMS]: {
            errors:
                status === CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [ONYXKEYS.LOGIN_LIST]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'johndoe12@expensify.com': {
                partnerName: 'John Doe',
                partnerUserID: 'johndoe12@expensify.com',
                validatedDate: status !== CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? new Date().toISOString() : undefined,
                errorFields:
                    status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR
                        ? {
                              field: {
                                  error: 'Something went wrong',
                              },
                          }
                        : undefined,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'otheruser@expensify.com': {
                partnerName: 'Other User',
                partnerUserID: status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? 'different@expensify.com' : 'otheruser@expensify.com',
                validatedDate: status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? undefined : new Date().toISOString(),
                errorFields: undefined,
            },
        },
        [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {
            achData: {
                bankAccountID: 12345,
            },
            errors:
                status === CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
            errorFields:
                status === CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR
                    ? {
                          phoneNumber: 'Invalid phone number',
                      }
                    : undefined,
        },
        [`${ONYXKEYS.CARD_LIST}`]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'card123': {
                bank: 'OTHER_BANK',
                lastScrapeResult: status === CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR ? 500 : 200,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'card456': {
                bank: 'ANOTHER_BANK',
                lastScrapeResult: status === CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR ? 500 : 200,
            },
        },
        [ONYXKEYS.SESSION]: {
            email: 'johndoe12@expensify.com',
        },
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: status === CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: status === CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
    }) as unknown as OnyxMultiSetInput;

type TestCase = {
    name: string;
    indicatorColor: string;
    status: string;
    policyIDWithErrors?: string;
};

const TEST_CASES: TestCase[] = [
    {
        name: 'has policy errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
        policyIDWithErrors: '2',
    },
    {
        name: 'has custom units error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
        policyIDWithErrors: '1',
    },
    {
        name: 'has employee list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
        policyIDWithErrors: '3',
    },
    {
        name: 'has sync errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
        policyIDWithErrors: '4',
    },
    {
        name: 'has QBO export error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR,
        policyIDWithErrors: '5',
    },
    {
        name: 'has user wallet errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS,
    },
    {
        name: 'has payment method error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR,
    },
    {
        name: 'has subscription errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
    },
    {
        name: 'has reimbursement account errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS,
    },
    {
        name: 'has login list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR,
    },
    {
        name: 'has wallet terms errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS,
    },
    {
        name: 'has card connection error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR,
    },
    {
        name: 'has phone number error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR,
    },
    {
        name: 'has login list info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO,
    },
    {
        name: 'has subscription info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
    },
];

const TEST_CASES_NON_ADMIN: TestCase[] = [
    {
        name: 'has custom units error but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
    },
    {
        name: 'has policy errors but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
    },
    {
        name: 'has employee list error but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
    },
    {
        name: 'has sync errors but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
    },
    {
        name: 'has QBO export error but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR,
    },
];

describe('useIndicatorStatus', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    describe.each(TEST_CASES)('$name', (testCase) => {
        beforeAll(() => {
            return Onyx.multiSet(getMockForStatus(testCase.status)).then(waitForBatchedUpdates);
        });

        it('returns correct indicatorColor', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });

        it('returns correct status', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status} = result.current;
            expect(status).toBe(testCase.status);
        });

        it('returns correct policyIDWithErrors', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {policyIDWithErrors} = result.current;
            expect(policyIDWithErrors).toBe(testCase.policyIDWithErrors);
        });
    });

    describe.each(TEST_CASES_NON_ADMIN)('$name', (testCase) => {
        beforeAll(() => {
            return Onyx.multiSet(getMockForStatus(testCase.status, false)).then(waitForBatchedUpdates);
        });

        it('returns correct indicatorColor', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });
    });

    describe('no errors or info', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                [ONYXKEYS.USER_WALLET]: {},
                [ONYXKEYS.WALLET_TERMS]: {},
                [ONYXKEYS.LOGIN_LIST]: {},
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                [`${ONYXKEYS.CARD_LIST}`]: {},
                [ONYXKEYS.SESSION]: {
                    email: 'johndoe12@expensify.com',
                },
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('returns undefined status when no errors or info exist', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status} = result.current;
            expect(status).toBeUndefined();
        });

        it('returns success color when no errors or info exist', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.success);
        });

        it('returns undefined policyIDWithErrors when no errors exist', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {policyIDWithErrors} = result.current;
            expect(policyIDWithErrors).toBeUndefined();
        });
    });

    describe('wallet terms with chatReportID', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                [ONYXKEYS.USER_WALLET]: {},
                [ONYXKEYS.WALLET_TERMS]: {
                    errors: {
                        error: 'Something went wrong',
                    },
                    chatReportID: '123',
                },
                [ONYXKEYS.LOGIN_LIST]: {},
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                [`${ONYXKEYS.CARD_LIST}`]: {},
                [ONYXKEYS.SESSION]: {
                    email: 'johndoe12@expensify.com',
                },
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('does not show wallet terms error when chatReportID exists', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status} = result.current;
            expect(status).toBeUndefined();
        });
    });

    describe('multiple errors', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    12345: {
                        methodID: 12345,
                        errors: {
                            error: 'Payment method error',
                        },
                    },
                },
                [ONYXKEYS.USER_WALLET]: {
                    bankAccountID: 12345,
                    errors: {
                        error: 'Wallet error',
                    },
                },
                [ONYXKEYS.WALLET_TERMS]: {},
                [ONYXKEYS.LOGIN_LIST]: {},
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                [`${ONYXKEYS.CARD_LIST}`]: {},
                [ONYXKEYS.SESSION]: {
                    email: 'johndoe12@expensify.com',
                },
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('returns the first error status found', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status} = result.current;
            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
        });

        it('returns danger color for multiple errors', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.danger);
        });
    });

    describe('error takes priority over info', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                [ONYXKEYS.USER_WALLET]: {
                    bankAccountID: 12345,
                    errors: {
                        error: 'Wallet error',
                    },
                },
                [ONYXKEYS.WALLET_TERMS]: {},
                [ONYXKEYS.LOGIN_LIST]: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'johndoe12@expensify.com': {
                        partnerName: 'John Doe',
                        partnerUserID: 'johndoe12@expensify.com',
                        validatedDate: undefined,
                    },
                },
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                [`${ONYXKEYS.CARD_LIST}`]: {},
                [ONYXKEYS.SESSION]: {
                    email: 'johndoe12@expensify.com',
                },
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('returns error status when both error and info exist', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status} = result.current;
            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
        });

        it('returns danger color when error takes priority', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.danger);
        });
    });

    describe('policy with null id', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}null` as const]: {
                    id: null,
                    name: 'Null Policy',
                    owner: 'johndoe12@expensify.com',
                    role: 'admin',
                    errors: {
                        error: 'Something went wrong',
                    },
                },
                [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                [ONYXKEYS.USER_WALLET]: {},
                [ONYXKEYS.WALLET_TERMS]: {},
                [ONYXKEYS.LOGIN_LIST]: {},
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                [`${ONYXKEYS.CARD_LIST}`]: {},
                [ONYXKEYS.SESSION]: {
                    email: 'johndoe12@expensify.com',
                },
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('filters out policies with null id', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status, policyIDWithErrors} = result.current;
            expect(status).toBeUndefined();
            expect(policyIDWithErrors).toBeUndefined();
        });
    });

    describe('missing data', () => {
        beforeAll(() => {
            return Onyx.multiSet({
                [ONYXKEYS.BANK_ACCOUNT_LIST]: null,
                [ONYXKEYS.USER_WALLET]: null,
                [ONYXKEYS.WALLET_TERMS]: null,
                [ONYXKEYS.LOGIN_LIST]: null,
                [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: null,
                [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: null,
                [`${ONYXKEYS.CARD_LIST}`]: null,
                [ONYXKEYS.SESSION]: null,
            } as unknown as OnyxMultiSetInput).then(waitForBatchedUpdates);
        });

        it('handles missing data gracefully', () => {
            const {result} = renderHook(() => useIndicatorStatus());
            const {status, indicatorColor, policyIDWithErrors} = result.current;
            expect(status).toBeUndefined();
            expect(indicatorColor).toBe(defaultTheme.success);
            expect(policyIDWithErrors).toBeUndefined();
        });
    });
}); 