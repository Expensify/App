import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import usePolicyIndicatorChecks from '@hooks/usePolicyIndicatorChecks';
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

describe('usePolicyIndicatorChecks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
    });

    describe('policy error statuses', () => {
        it('returns HAS_POLICY_ERRORS when policy has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        errors: {policyError: 'Something went wrong'},
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_CUSTOM_UNITS_ERROR when custom units have errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        customUnits: {errors: {customUnitError: 'Invalid custom unit'}},
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_EMPLOYEE_LIST_ERROR when employee list has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        employeeList: {
                            [otherUserID]: {
                                email: otherUserID,
                                errors: {employeeError: 'Employee error'},
                            },
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_SYNC_ERRORS when sync has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        connections: {
                            quickbooksOnline: {
                                lastSync: {
                                    errorMessage: 'Sync failed',
                                    isSuccessful: false,
                                    errorDate: new Date().toISOString(),
                                },
                            },
                        },
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${WORKSPACE.policyID}` as const]: {
                        stageInProgress: null,
                        connectionName: 'quickbooksOnline',
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_QBO_EXPORT_ERROR when QBO export has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        connections: {
                            quickbooksOnline: {
                                config: {
                                    reimbursableExpensesExportDestination: 'VENDOR_BILL',
                                    reimbursableExpensesAccount: undefined,
                                },
                            },
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_UBER_CREDENTIALS_ERROR when Uber credentials have errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        receiptPartners: {
                            uber: {error: 'Invalid Uber credentials'},
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR);
            expect(result.current.policyIDWithErrors).toBe(WORKSPACE.policyID);
        });

        it('returns HAS_POLICY_ADMIN_CARD_FEED_ERRORS when admin has card feed errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                    },
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                            fundID: String(WORKSPACE.workspaceAccountID),
                            lastScrapeResult: 403,
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS);
        });
    });

    describe('domain error statuses', () => {
        beforeEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('returns HAS_DOMAIN_ERRORS when domain has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}domain1` as const]: {
                        errors: {domainError: 'Domain error'},
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.domainStatus).toBe(CONST.INDICATOR_STATUS.HAS_DOMAIN_ERRORS);
        });
    });

    describe('no errors', () => {
        beforeAll(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                    },
                    [ONYXKEYS.CARD_LIST]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns undefined for all statuses', async () => {
            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBeUndefined();
            expect(result.current.domainStatus).toBeUndefined();
            expect(result.current.policyIDWithErrors).toBeUndefined();
        });
    });

    describe('missing data', () => {
        beforeAll(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('handles missing data gracefully', async () => {
            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBeUndefined();
            expect(result.current.domainStatus).toBeUndefined();
            expect(result.current.policyIDWithErrors).toBeUndefined();
        });
    });

    describe('error priority', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                        errors: {policyError: 'Policy error'},
                        customUnits: {errors: {customUnitError: 'Custom unit error'}},
                        employeeList: {
                            [otherUserID]: {
                                email: otherUserID,
                                errors: {employeeError: 'Employee error'},
                            },
                        },
                    },
                    [ONYXKEYS.CARD_LIST]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns the first error found based on check order', async () => {
            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            // HAS_POLICY_ERRORS is checked first
            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS);
        });
    });

    describe('multiple policies', () => {
        const SECOND_WORKSPACE = {
            policyID: '2',
            workspaceAccountID: 67890,
            policyName: 'Second Workspace',
        };

        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: userID},
                    [`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE.policyID}` as const]: {
                        id: WORKSPACE.policyID,
                        name: WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: WORKSPACE.workspaceAccountID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${SECOND_WORKSPACE.policyID}` as const]: {
                        id: SECOND_WORKSPACE.policyID,
                        name: SECOND_WORKSPACE.policyName,
                        owner: userID,
                        role: 'admin',
                        workspaceAccountID: SECOND_WORKSPACE.workspaceAccountID,
                        errors: {policyError: 'Something went wrong'},
                    },
                    [ONYXKEYS.CARD_LIST]: {},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns the policyID of the policy with errors', async () => {
            const {result} = renderHook(() => usePolicyIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.policyStatus).toBe(CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS);
            expect(result.current.policyIDWithErrors).toBe(SECOND_WORKSPACE.policyID);
        });
    });
});
