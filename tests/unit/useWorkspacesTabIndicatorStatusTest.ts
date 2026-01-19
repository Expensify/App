import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import CONST from '@src/CONST';
import initOnyxDerivedValues from '@src/libs/actions/OnyxDerived';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const userID = 'admin@expensify.com';
const otherUserID = 'employee@example.com';

const WORKSPACE = {
    policyID: '1',
    workspaceAccountID: 12345,
    policyName: 'Test Workspace',
};

const CARD_FEED = {
    feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    workspaceAccountID: WORKSPACE.workspaceAccountID,
};

type TestCase = {
    name: string;
    indicatorColor: string;
    status: string | undefined;
};

const cardFeedErrorTestCaseNames = {
    admin: 'has card feed error if admin',
    employee: 'has no card feed error if employee (non-admin)',
} as const;

const TEST_CASE_NAMES = {
    hasPolicyErrors: 'has policy errors',
    hasCustomUnitsError: 'has custom units error',
    hasEmployeeListError: 'has employee list error',
    hasSyncErrors: 'has sync errors',
    hasQBOExportError: 'has QBO export error',
    hasUberCredentialsError: 'has Uber credentials error',
    hasAdminCardFeedErrors: cardFeedErrorTestCaseNames.admin,
    hasNoCardFeedErrorsForEmployee: cardFeedErrorTestCaseNames.employee,
    noErrors: 'no errors',
} as const;

const getMockForStatus = ({name}: TestCase) =>
    ({
        [ONYXKEYS.SESSION]: {
            email: name === cardFeedErrorTestCaseNames.employee ? otherUserID : userID,
        },
        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
            id: WORKSPACE.policyID,
            name: WORKSPACE.policyName,
            owner: name === cardFeedErrorTestCaseNames.employee ? userID : userID,
            role: name === cardFeedErrorTestCaseNames.employee ? 'user' : 'admin',
            workspaceAccountID: WORKSPACE.workspaceAccountID,
            // Policy errors
            errors: name === TEST_CASE_NAMES.hasPolicyErrors ? {policyError: 'Something went wrong'} : undefined,
            errorFields: undefined,
            // Custom units errors
            customUnits: name === TEST_CASE_NAMES.hasCustomUnitsError ? {errors: {customUnitError: 'Invalid custom unit'}} : undefined,
            // Employee list errors
            employeeList:
                name === TEST_CASE_NAMES.hasEmployeeListError
                    ? {
                          otherUserID: {
                              email: otherUserID,
                              errors: {employeeError: 'Employee error'},
                          },
                      }
                    : undefined,
            // Sync errors - use connections with sync errors
            // hasSynchronizationErrorMessage requires: !isSyncInProgress && lastSync exists && isSuccessful === false && errorDate exists
            connections: {
                ...(name === TEST_CASE_NAMES.hasSyncErrors ? {
                    quickbooksOnline: {
                        lastSync: {
                            errorMessage: 'Sync failed',
                            isSuccessful: false,
                            errorDate: new Date().toISOString(),
                        },
                    },
                } : {}),
                ...(name === TEST_CASE_NAMES.hasQBOExportError ? {
                    quickbooksOnline: {
                        config: {
                            reimbursableExpensesExportDestination: 'VENDOR_BILL',
                            reimbursableExpensesAccount: undefined,
                        },
                    },
                } : {}),
            },
            // Uber credentials error
            receiptPartners:
                name === TEST_CASE_NAMES.hasUberCredentialsError
                    ? {
                          uber: {
                              error: 'Invalid Uber credentials',
                          },
                      }
                    : undefined,
        },
        // Card feed errors - both admin and employee test cases have broken card connection
        // Admin sees HAS_POLICY_ADMIN_CARD_FEED_ERRORS, employee does NOT see it in workspaces tab
        [`${ONYXKEYS.CARD_LIST}`]:
            name === cardFeedErrorTestCaseNames.admin || name === cardFeedErrorTestCaseNames.employee
                ? {
                      card1: {
                          cardID: 1,
                          bank: CARD_FEED.feedName,
                          lastScrapeResult: 403, // Broken connection
                          fundID: String(CARD_FEED.workspaceAccountID),
                      },
                  }
                : {},
        // Sync progress - not in progress
        [`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${WORKSPACE.policyID}` as const]:
            name === TEST_CASE_NAMES.hasSyncErrors
                ? {
                      stageInProgress: null,
                      connectionName: 'quickbooksOnline',
                  }
                : undefined,
    }) as unknown as OnyxMultiSetInput;

const TEST_CASES: TestCase[] = [
    {
        name: TEST_CASE_NAMES.hasPolicyErrors,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
    },
    {
        name: TEST_CASE_NAMES.hasCustomUnitsError,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
    },
    {
        name: TEST_CASE_NAMES.hasEmployeeListError,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
    },
    {
        name: TEST_CASE_NAMES.hasSyncErrors,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
    },
    {
        name: TEST_CASE_NAMES.hasQBOExportError,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR,
    },
    {
        name: TEST_CASE_NAMES.hasUberCredentialsError,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR,
    },
    {
        name: cardFeedErrorTestCaseNames.admin,
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS,
    },
    {
        name: cardFeedErrorTestCaseNames.employee,
        indicatorColor: defaultTheme.success,
        status: undefined,
    },
];

describe('useWorkspacesTabIndicatorStatus', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
    });

    describe.each(TEST_CASES)('$name', (testCase) => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(getMockForStatus(testCase));
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns correct indicatorColor', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });

        it('returns correct status', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBe(testCase.status);
        });

        it('returns policyIDWithErrors', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {policyIDWithErrors} = result.current;
            // Employee test case has no policy errors visible (card feed errors don't show for employees in workspaces tab)
            if (testCase.name === cardFeedErrorTestCaseNames.employee) {
                expect(policyIDWithErrors).toBeUndefined();
            } else {
                expect(policyIDWithErrors).toBe(WORKSPACE.policyID);
            }
        });
    });

    describe('no errors', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: userID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                    },
                    [`${ONYXKEYS.CARD_LIST}`]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns undefined status when no errors exist', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBeUndefined();
        });

        it('returns success color when no errors exist', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.success);
        });

        it('returns undefined policyIDWithErrors when no errors exist', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {policyIDWithErrors} = result.current;
            expect(policyIDWithErrors).toBeUndefined();
        });
    });

    describe('non-admin user', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: otherUserID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'user', // Non-admin role
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        // Policy errors should NOT show for non-admin
                        errors: {policyError: 'Something went wrong'},
                    },
                    [`${ONYXKEYS.CARD_LIST}`]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('does not show policy errors for non-admin', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            // Policy errors require admin role
            expect(status).toBeUndefined();
        });
    });

    describe('multiple policies with errors', () => {
        const SECOND_WORKSPACE = {
            policyID: '2',
            workspaceAccountID: 67890,
            policyName: 'Second Workspace',
        };

        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: userID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        // No errors on first policy
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${SECOND_WORKSPACE.policyID}` as const]: {
                        id: SECOND_WORKSPACE.policyID,
                        name: SECOND_WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: SECOND_WORKSPACE.workspaceAccountID,
                        // Errors on second policy
                        errors: {policyError: 'Something went wrong'},
                    },
                    [`${ONYXKEYS.CARD_LIST}`]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns error status when at least one policy has errors', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;

            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS);
            expect(indicatorColor).toBe(defaultTheme.danger);
        });

        it('returns the policyID of the policy with errors', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {policyIDWithErrors} = result.current;

            expect(policyIDWithErrors).toBe(SECOND_WORKSPACE.policyID);
        });
    });

    describe('missing data', () => {
        beforeAll(async () => {
            // Clear all Onyx data first to ensure clean state
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('handles missing data gracefully', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor, policyIDWithErrors} = result.current;

            expect(status).toBeUndefined();
            expect(indicatorColor).toBe(defaultTheme.success);
            expect(policyIDWithErrors).toBeUndefined();
        });
    });

    describe('error priority', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: userID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        // Multiple errors at once
                        errors: {policyError: 'Policy error'},
                        customUnits: {errors: {customUnitError: 'Custom unit error'}},
                        employeeList: {
                            [otherUserID]: {
                                email: otherUserID,
                                errors: {employeeError: 'Employee error'},
                            },
                        },
                    },
                    [`${ONYXKEYS.CARD_LIST}`]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns the first error found based on check order', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;

            // Based on the order in useNavigationTabBarIndicatorChecks:
            // 1. HAS_POLICY_ERRORS
            // 2. HAS_CUSTOM_UNITS_ERROR
            // 3. HAS_EMPLOYEE_LIST_ERROR
            // etc.
            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS);
        });
    });
});
