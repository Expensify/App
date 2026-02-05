import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useIndicatorStatus from '@hooks/useIndicatorStatus';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import CONST from '@src/CONST';
import initWithOnyxDerivedValues from '@src/libs/actions/OnyxDerived';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IndicatorTestCase} from '../utils/IndicatorTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const userID = 'johndoe12@expensify.com';
const otherUserID = 'otheruser@expensify.com';

const brokenCardFeed = {
    feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    workspaceAccountID: 12345,
};

const cardFeedErrorTestCases = {
    admin: {
        name: 'has policy card feed error if admin',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS,
        policyIDWithErrors: '1',
    },
    employee: {
        name: 'has account card feed error if employee (non-admin)',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_CARD_FEED_ERRORS,
    },
} as const satisfies Record<'admin' | 'employee', IndicatorTestCase>;

const TEST_CASES = {
    hasPolicyErrors: {
        name: 'has policy errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
        policyIDWithErrors: '2',
    },
    hasCustomUnitsError: {
        name: 'has custom units error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
        policyIDWithErrors: '1',
    },
    hasEmployeeListError: {
        name: 'has employee list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
        policyIDWithErrors: '3',
    },
    hasSyncErrors: {
        name: 'has sync errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
        policyIDWithErrors: '4',
    },
    hasUserWalletErrors: {
        name: 'has user wallet errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS,
        policyIDWithErrors: undefined,
    },
    hasPaymentMethodError: {
        name: 'has payment method error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR,
        policyIDWithErrors: undefined,
    },
    hasSubscriptionErrors: {
        name: 'has subscription errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
        policyIDWithErrors: undefined,
    },
    hasReimbursementAccountErrors: {
        name: 'has reimbursement account errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS,
        policyIDWithErrors: undefined,
    },
    hasLoginListError: {
        name: 'has login list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR,
        policyIDWithErrors: undefined,
    },
    hasWalletTermsErrors: {
        name: 'has wallet terms errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS,
        policyIDWithErrors: undefined,
    },
    hasLoginListInfo: {
        name: 'has login list info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO,
        policyIDWithErrors: undefined,
    },
    hasSubscriptionInfo: {
        name: 'has subscription info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
        policyIDWithErrors: undefined,
    },
    hasPendingCardInfo: {
        name: 'has pending card info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_PENDING_CARD_INFO,
        policyIDWithErrors: undefined,
    },
    hasPolicyAdminCardFeedErrors: cardFeedErrorTestCases.admin,
} as const satisfies Record<string, IndicatorTestCase>;

const TEST_CASES_NON_ADMIN = {
    hasCustomUnitsError: {
        name: 'has custom units error but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
    },
    hasPolicyErrors: {
        name: 'has policy errors but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
    },
    hasEmployeeListError: {
        name: 'has employee list error but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
    },
    hasSyncErrors: {
        name: 'has sync errors but not an admin so no RBR',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
    },
    hasEmployeeCardFeedErrors: cardFeedErrorTestCases.employee,
} as const satisfies Record<string, IndicatorTestCase>;

const getMockForTestCase = ({name, status}: IndicatorTestCase, isAdmin: boolean) =>
    ({
        [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: {
            id: '1',
            name: 'Workspace 1',
            owner: isAdmin ? userID : otherUserID,
            role: isAdmin ? 'admin' : 'user',
            workspaceAccountID: brokenCardFeed.workspaceAccountID,
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
            owner: userID,
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
            owner: userID,
            role: isAdmin ? 'admin' : 'user',
            employeeList: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                [userID]: {
                    email: userID,
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
            owner: userID,
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
            [userID]: {
                partnerName: 'John Doe',
                partnerUserID: userID,
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
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: status === CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO,
        [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED]: status === CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS,
        [ONYXKEYS.CARD_LIST]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '123456': {
                cardID: 123456,
                bank: CONST.EXPENSIFY_CARD.BANK,
                accountID: 123,
                fundID: String(brokenCardFeed.workspaceAccountID),
                state: status === CONST.INDICATOR_STATUS.HAS_PENDING_CARD_INFO ? CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED : CONST.EXPENSIFY_CARD.STATE.OPEN,
            },
            card1: {
                bank: 'OTHER_BANK',
                lastScrapeResult: name === cardFeedErrorTestCases.admin.name || name === cardFeedErrorTestCases.employee.name ? 403 : 200,
                fundID: String(brokenCardFeed.workspaceAccountID),
            },
        },
        [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
            legalFirstName: 'John',
            legalLastName: 'Doe',
            dob: '2000-08-08',
            phoneNumber: '0123456789',
            addresses: [
                {
                    street: '123 Main St',
                },
            ],
        },
    }) as OnyxMultiSetInput;

describe('useIndicatorStatusTest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initWithOnyxDerivedValues();
    });

    describe.each(Object.values(TEST_CASES))('$name', (testCase) => {
        beforeAll(async () => {
            await Onyx.multiSet(getMockForTestCase(testCase, true));
            await waitForBatchedUpdates();
        });
        it('returns correct indicatorColor', async () => {
            const {result} = renderHook(() => useIndicatorStatus());
            await act(async () => {
                await waitForBatchedUpdates();
            });
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });
        it('returns correct status', async () => {
            const {result} = renderHook(() => useIndicatorStatus());
            await act(async () => {
                await waitForBatchedUpdates();
            });
            const {status} = result.current;
            expect(status).toBe(testCase.status);
        });
        it('returns correct policyIDWithErrors', async () => {
            const {result} = renderHook(() => useIndicatorStatus());
            await act(async () => {
                await waitForBatchedUpdates();
            });
            const {policyIDWithErrors} = result.current;
            expect(policyIDWithErrors).toBe(testCase.policyIDWithErrors);
        });
    });
    describe.each(Object.values(TEST_CASES_NON_ADMIN))('$name', (testCase) => {
        beforeAll(async () => {
            await Onyx.multiSet(getMockForTestCase(testCase, false));
            await waitForBatchedUpdates();
        });
        it('returns correct indicatorColor', async () => {
            const {result} = renderHook(() => useIndicatorStatus());
            await act(async () => {
                await waitForBatchedUpdates();
            });
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });
    });
});
