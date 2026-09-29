import {act, renderHook} from '@testing-library/react-native';

import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxValues} from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Connections} from '@src/types/onyx/Policy';

import type {OnyxMultiSetInput} from 'react-native-onyx';
import type {IndicatorTestCase} from 'tests/utils/IndicatorTestUtils';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const userID = 'admin@expensify.com';
const otherUserID = 'employee@example.com';

const WORKSPACE = {
    policyID: '1' as const,
    policyAccountID: 12345,
    policyName: 'Test Workspace',
};

const TEST_CASES = {
    hasPolicyErrors: {
        name: 'has policy errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS,
    },
    hasCustomUnitsError: {
        name: 'has custom units error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR,
    },
    hasEmployeeListError: {
        name: 'has employee list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR,
    },
    hasSyncErrors: {
        name: 'has sync errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS,
    },
    hasQBOExportError: {
        name: 'has QBO export error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR,
    },
    hasUberCredentialsError: {
        name: 'has Uber credentials error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR,
    },
    hasMergeHRSetupNeeded: {
        name: 'has Merge HR setup needed',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_MERGE_HR_SETUP_NEEDED,
    },
} as const satisfies Record<string, IndicatorTestCase>;

const getMockForTestCase = ({name}: IndicatorTestCase) =>
    createMock<OnyxMultiSetInput>({
        [ONYXKEYS.SESSION]: createMock<OnyxValues[typeof ONYXKEYS.SESSION]>({email: userID}),
        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
            id: WORKSPACE.policyID,
            name: WORKSPACE.policyName,
            owner: userID,
            role: 'admin',
            policyAccountID: WORKSPACE.policyAccountID,
            // Policy errors
            errors: name === TEST_CASES.hasPolicyErrors.name ? {policyError: 'Something went wrong'} : undefined,
            errorFields: undefined,
            // Custom units errors
            customUnits:
                name === TEST_CASES.hasCustomUnitsError.name
                    ? {
                          errors: createMock<Errors>({customUnitError: 'Invalid custom unit'}),
                      }
                    : undefined,
            // Employee list errors
            employeeList:
                name === TEST_CASES.hasEmployeeListError.name
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
                ...(name === TEST_CASES.hasSyncErrors.name
                    ? {
                          quickbooksOnline: createMock<NonNullable<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBO]>>({
                              lastSync: {
                                  errorMessage: 'Sync failed',
                                  isSuccessful: false,
                                  errorDate: new Date().toISOString(),
                              },
                          }),
                      }
                    : {}),
                ...(name === TEST_CASES.hasQBOExportError.name
                    ? {
                          quickbooksOnline: createMock<NonNullable<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBO]>>({
                              config: {
                                  reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                                  reimbursableExpensesAccount: undefined,
                              },
                          }),
                      }
                    : {}),
                ...(name === TEST_CASES.hasMergeHRSetupNeeded.name
                    ? {
                          [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: createMock<NonNullable<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]>>({
                              config: {integration: 'workday'},
                              data: {groups: [{id: 'g1', name: 'Eng', type: 'Department'}]},
                              lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
                          }),
                      }
                    : {}),
            },
            // Uber credentials error
            receiptPartners:
                name === TEST_CASES.hasUberCredentialsError.name
                    ? {
                          uber: {
                              error: 'Invalid Uber credentials',
                          },
                      }
                    : undefined,
        },
        // Sync progress - not in progress
        [`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${WORKSPACE.policyID}` as const]:
            name === TEST_CASES.hasSyncErrors.name
                ? {
                      stageInProgress: null,
                      connectionName: 'quickbooksOnline',
                  }
                : undefined,
    });

describe('useWorkspacesTabIndicatorStatus', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    describe.each(Object.values(TEST_CASES))('$name', (testCase) => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(getMockForTestCase(testCase));
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

        it('returns indicatorPolicyID', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorPolicyID} = result.current;
            expect(indicatorPolicyID).toBe(WORKSPACE.policyID);
        });
    });

    describe('no errors', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {
                            email: userID,
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                            id: WORKSPACE.policyID,
                            name: WORKSPACE.policyName,
                            owner: userID,
                            role: 'admin',
                            policyAccountID: WORKSPACE.policyAccountID,
                        },
                        [ONYXKEYS.CARD_LIST]: {},
                    }),
                );
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

        it('returns undefined indicatorPolicyID when no errors exist', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorPolicyID} = result.current;
            expect(indicatorPolicyID).toBeUndefined();
        });
    });

    describe('non-admin user', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {
                            email: otherUserID,
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                            id: WORKSPACE.policyID,
                            name: WORKSPACE.policyName,
                            owner: userID,
                            role: 'user', // Non-admin role
                            policyAccountID: WORKSPACE.policyAccountID,
                            // Policy errors should NOT show for non-admin
                            errors: {policyError: 'Something went wrong'},
                        },
                        [ONYXKEYS.CARD_LIST]: {},
                    }),
                );
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
            policyID: '2' as const,
            policyAccountID: 67890,
            policyName: 'Second Workspace',
        };

        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {
                            email: userID,
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                            id: WORKSPACE.policyID,
                            name: WORKSPACE.policyName,
                            owner: userID,
                            role: 'admin',
                            policyAccountID: WORKSPACE.policyAccountID,
                            // No errors on first policy
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${SECOND_WORKSPACE.policyID}` as const]: {
                            id: SECOND_WORKSPACE.policyID,
                            name: SECOND_WORKSPACE.policyName,
                            owner: userID,
                            role: 'admin',
                            policyAccountID: SECOND_WORKSPACE.policyAccountID,
                            // Errors on second policy
                            errors: {policyError: 'Something went wrong'},
                        },
                        [ONYXKEYS.CARD_LIST]: {},
                    }),
                );
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
            const {indicatorPolicyID} = result.current;

            expect(indicatorPolicyID).toBe(SECOND_WORKSPACE.policyID);
        });
    });

    describe('domain admin pending requests (info)', () => {
        const domainAdminAccountID = 555;
        const requesterAccountID = 777;
        const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}domain1` as const;

        beforeAll(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();

            const domainWithAdmin: Domain = {
                validated: true,
                accountID: 1,
                email: 'domain.com',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_defaultSecurityGroupID: '',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[requesterAccountID]: 'read'},
            };
            Reflect.set(domainWithAdmin, `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${domainAdminAccountID}`, domainAdminAccountID);

            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {accountID: domainAdminAccountID, email: userID},
                        [domainKey]: domainWithAdmin,
                    }),
                );
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns HAS_PENDING_DOMAIN_ADMIN_REQUESTS status with success color', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;

            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_PENDING_DOMAIN_ADMIN_REQUESTS);
            expect(indicatorColor).toBe(defaultTheme.success);
        });
    });

    describe('domain errors take priority over domain admin pending requests', () => {
        const domainAdminAccountID = 555;
        const requesterAccountID = 777;
        const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}domain1` as const;
        const domainErrorsKey = `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}domain1` as const;

        beforeAll(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();

            const domainWithAdmin: Domain = {
                validated: true,
                accountID: 1,
                email: 'domain.com',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_defaultSecurityGroupID: '',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[requesterAccountID]: 'read'},
            };
            Reflect.set(domainWithAdmin, `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${domainAdminAccountID}`, domainAdminAccountID);

            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {accountID: domainAdminAccountID, email: userID},
                        [domainKey]: domainWithAdmin,
                        [domainErrorsKey]: {errors: {domainError: 'Domain error'}},
                    }),
                );
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('shows red domain error instead of the green pending-requests indicator', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;

            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_DOMAIN_ERRORS);
            expect(indicatorColor).toBe(defaultTheme.danger);
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
            const {status, indicatorColor, indicatorPolicyID} = result.current;

            expect(status).toBeUndefined();
            expect(indicatorColor).toBe(defaultTheme.success);
            expect(indicatorPolicyID).toBeUndefined();
        });
    });

    describe('error priority', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {
                            email: userID,
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                            id: WORKSPACE.policyID,
                            name: WORKSPACE.policyName,
                            owner: userID,
                            role: 'admin',
                            policyAccountID: WORKSPACE.policyAccountID,
                            // Multiple errors at once
                            errors: {policyError: 'Policy error'},
                            customUnits: {
                                errors: createMock<Errors>({customUnitError: 'Custom unit error'}),
                            },
                            employeeList: {
                                [otherUserID]: {
                                    email: otherUserID,
                                    errors: {employeeError: 'Employee error'},
                                },
                            },
                        },
                        [ONYXKEYS.CARD_LIST]: {},
                    }),
                );
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

    describe('error priority over info', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(
                    createMock<OnyxMultiSetInput>({
                        [ONYXKEYS.SESSION]: {
                            email: userID,
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                            id: WORKSPACE.policyID,
                            name: WORKSPACE.policyName,
                            owner: userID,
                            role: 'admin',
                            policyAccountID: WORKSPACE.policyAccountID,
                            connections: {
                                quickbooksOnline: createMock<NonNullable<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBO]>>({
                                    lastSync: {
                                        errorMessage: 'Sync failed',
                                        isSuccessful: false,
                                        errorDate: new Date().toISOString(),
                                    },
                                }),
                                [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: createMock<NonNullable<Connections[typeof CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]>>({
                                    config: {integration: 'workday'},
                                    data: {groups: [{id: 'g1', name: 'Eng', type: 'Department'}]},
                                    lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
                                }),
                            },
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${WORKSPACE.policyID}` as const]: {
                            stageInProgress: null,
                            connectionName: 'quickbooksOnline',
                        },
                        [ONYXKEYS.CARD_LIST]: {},
                    }),
                );
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('shows red sync error when both sync error and merge HR setup are needed', async () => {
            const {result} = renderHook(() => useWorkspacesTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;

            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS);
            expect(indicatorColor).toBe(defaultTheme.danger);
        });
    });
});
